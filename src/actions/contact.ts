"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionState } from "@/types";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  contact: z.string().min(5, "Email atau nomor WhatsApp tidak valid"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
  honeypot: z.string().max(0, "Spam detected"), // Should be empty
});

export async function sendContactEmail(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = {
    name: formData.get("name") as string,
    contact: formData.get("contact") as string,
    message: formData.get("message") as string,
    honeypot: formData.get("honeypot") as string,
  };

  const validated = contactSchema.safeParse(data);

  if (!validated.success) {
    if (
      validated.error.issues.some((e: z.ZodIssue) =>
        e.path.includes("honeypot"),
      )
    ) {
      // Silently fail for bots
      return { success: true, message: "Pesan terkirim!" };
    }
    return {
      error: validated.error.flatten().fieldErrors,
    };
  }

  if (!process.env.RESEND_API_KEY) {
    return {
      success: false,
      message: "Konfigurasi email belum lengkap. Silakan hubungi admin.",
    };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "website@padelix.co.id",
      to: process.env.BUSINESS_EMAIL || "business@padelix.co.id",
      subject: `New Contact Message from ${validated.data.name}`,
      text: `
        Name: ${validated.data.name}
        Contact Info: ${validated.data.contact}
        Message:
        ${validated.data.message}
      `,
      html: `
        <h3>Pesan Baru dari Website Padelix</h3>
        <p><strong>Nama:</strong> ${validated.data.name}</p>
        <p><strong>Kontak:</strong> ${validated.data.contact}</p>
        <p><strong>Pesan:</strong></p>
        <p>${validated.data.message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) throw new Error(error.message);

    void createAuditLog(
      "CONTACT_SUBMISSION",
      undefined,
      `Name: ${validated.data.name}, Contact: ${validated.data.contact}`,
    );

    return {
      success: true,
      message:
        "Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      message:
        "Gagal mengirim pesan. Silakan coba lagi nanti atau hubungi kami langsung via WhatsApp.",
    };
  }
}
