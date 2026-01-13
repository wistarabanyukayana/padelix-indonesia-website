"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { sendContactEmail } from "@/actions/contact";
import { toast } from "sonner";

export function ContactForm() {
  const [state, action, isPending] = useActionState(sendContactEmail, {});

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      {/* Honeypot field - Hidden from users */}
      <input 
        type="text" 
        name="honeypot" 
        style={{ display: 'none' }} 
        tabIndex={-1} 
        autoComplete="off" 
      />

      <div className="flex flex-col gap-1">
        <input 
          type="text" 
          name="name"
          placeholder="Nama Lengkap" 
          required
          className={`w-full p-4 bg-neutral-100 rounded-brand outline-none focus:ring-2 focus:ring-brand-green transition-all ${state.error?.name ? 'ring-2 ring-red-500' : ''}`} 
        />
        {state.error?.name && <span className="text-xs text-red-500 font-medium">{state.error.name[0]}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <input 
          type="text" 
          name="contact"
          placeholder="Email / Nomor WhatsApp" 
          required
          className={`w-full p-4 bg-neutral-100 rounded-brand outline-none focus:ring-2 focus:ring-brand-green transition-all ${state.error?.contact ? 'ring-2 ring-red-500' : ''}`} 
        />
        {state.error?.contact && <span className="text-xs text-red-500 font-medium">{state.error.contact[0]}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <textarea 
          name="message"
          placeholder="Pesan Anda" 
          rows={4} 
          required
          className={`w-full p-4 bg-neutral-100 rounded-brand outline-none focus:ring-2 focus:ring-brand-green transition-all resize-none ${state.error?.message ? 'ring-2 ring-red-500' : ''}`}
        ></textarea>
        {state.error?.message && <span className="text-xs text-red-500 font-medium">{state.error.message[0]}</span>}
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        disabled={isPending}
        className="bg-brand-red text-white font-bold py-4 rounded-brand hover:bg-red-600 transition-colors h-auto"
      >
        {isPending ? "Mengirim..." : "Kirim Pesan"}
      </Button>
    </form>
  );
}
