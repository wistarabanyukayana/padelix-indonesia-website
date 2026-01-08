// app/api/revalidate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// force Node.js runtime so logging always works
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// shape of Strapi webhook payload
interface WebhookBody {
  event: string; // e.g. "entry.publish"
  model?: string; // e.g. "product"
  [key: string]: unknown;
}

// map Strapi events → ISR tags
const EVENT_TO_TAGS: Record<string, string[]> = {
  "trigger-test": [
    "global",
    "homepage",
    "product-list",
    "product-slug",
    "content-list",
    "content-carousel",
  ],
  /*"entry.publish":   ["homepage","product-list","global"],
  "entry.unpublish": ["homepage","product-list"],*/
  // ...etc
};

// map Strapi models → ISR tags (optional)
const MODEL_TO_TAGS: Record<string, string[]> = {
  global: ["global"],
  "home-page": ["homepage"],
  product: ["product-list", "product-slug", "content-list", "content-carousel"],

  // ...etc
};

export async function POST(req: NextRequest) {
  // 1) Parse & log body
  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
    console.info("🔍 Parsed body:", body);
  } catch (err) {
    console.error("⚠️ Could not parse JSON:", err);
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // 2) Auth header → secret
  const authHeader = req.headers.get("authorization") ?? "";
  const receivedSecret = authHeader.replace(/^Bearer\s*/i, "");
  console.info("🗝️ Received secret:", receivedSecret);
  console.info("🗝️ Expected secret:", process.env.MY_REVALIDATE_SECRET);
  if (receivedSecret !== process.env.MY_REVALIDATE_SECRET) {
    console.error("🚨 Secret mismatch");
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }
  console.info("✅ Secret validated");

  // 3) Extract event & optional model
  const { event, model } = body;
  console.info(`📦 Webhook event="${event}", model="${model}"`);

  // 4) Build the set of tags to revalidate
  const tags = new Set<string>();

  //  - always include tags owed to the event
  const eventTags = EVENT_TO_TAGS[event];
  if (eventTags) {
    eventTags.forEach((t) => {
      tags.add(t);
      console.debug(`➕ Queued from event: ${t}`);
    });
  } else {
    console.warn(`⚠️ No tags mapped for event="${event}"`);
  }

  //  - if model is present and mapped, include those tags too
  if (model) {
    const modelTags = MODEL_TO_TAGS[model];
    if (modelTags) {
      modelTags.forEach((t) => {
        if (!tags.has(t)) {
          tags.add(t);
          console.debug(`➕ Queued from model: ${t}`);
        }
      });
    } else {
      console.warn(`⚠️ No tags mapped for model="${model}"`);
    }
  }

  if (tags.size === 0) {
    console.warn("⚠️ No tags to revalidate");
    return NextResponse.json({
      revalidated: false,
      reason: "no tags configured for this event/model",
      event,
      model,
    });
  }

  // 5) Perform revalidation
  const revalidated: string[] = [];
  for (const tag of tags) {
    console.info(`🔄 Revalidating tag "${tag}"…`);
    await revalidateTag(tag);
    console.info(`✅ Revalidated "${tag}"`);
    revalidated.push(tag);
  }

  // 6) Echo back for confirmation
  return NextResponse.json({
    revalidated: true,
    tags: revalidated,
    event,
    model,
  });
}
