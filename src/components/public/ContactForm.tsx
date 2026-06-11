"use client";

import { sendContactEmail } from "@/actions/contact";
import { Button } from "@/components/ui/Button";
import { trackMetaEvent } from "@/lib/metaPixel";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [state, action, isPending] = useActionState(sendContactEmail, {});

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        trackMetaEvent("Lead");
        trackMetaEvent("Contact");
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      {/* Honeypot field - Hidden from users */}
      <input
        type="text"
        name="honeypot"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="flex flex-col gap-1">
        <input
          type="text"
          name="name"
          placeholder="Nama Lengkap"
          required
          className={`w-full rounded-brand bg-neutral-100 p-4 transition-all outline-none focus:ring-2 focus:ring-brand-green ${state.error?.name ? "ring-2 ring-red-500" : ""}`}
        />
        {state.error?.name && (
          <span className="text-xs font-medium text-red-500">
            {state.error.name[0]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="text"
          name="contact"
          placeholder="Email / Nomor WhatsApp"
          required
          className={`w-full rounded-brand bg-neutral-100 p-4 transition-all outline-none focus:ring-2 focus:ring-brand-green ${state.error?.contact ? "ring-2 ring-red-500" : ""}`}
        />
        {state.error?.contact && (
          <span className="text-xs font-medium text-red-500">
            {state.error.contact[0]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          name="message"
          placeholder="Pesan Anda"
          rows={4}
          required
          className={`w-full resize-none rounded-brand bg-neutral-100 p-4 transition-all outline-none focus:ring-2 focus:ring-brand-green ${state.error?.message ? "ring-2 ring-red-500" : ""}`}
        ></textarea>
        {state.error?.message && (
          <span className="text-xs font-medium text-red-500">
            {state.error.message[0]}
          </span>
        )}
      </div>

      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className="h-auto py-4 font-bold shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25"
      >
        {isPending ? "Mengirim..." : "Kirim Pesan"}
      </Button>
    </form>
  );
}
