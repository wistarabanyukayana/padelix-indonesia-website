"use server";
import { z } from "zod";
import { submitContactForm } from "@/lib/db/repositories/contacts";
import { ContactSignupForm, ContactSignupState } from "@/types";

interface ContactSignupProps {
    name: string;
    contact: string;
    message: string;
}

const contactSignupSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Mohon masukan nama anda",
    })
    .regex(/^[A-Za-z ]+$/, {
      message: "Mohon masukan nama anda yang benar",
    }),
  contact: z.union([z.email(), z.string().regex(/^\+?[0-9]{7,15}$/)], {
    // ③ options (your custom message)
    message: "Mohon masukan nomor Email/WA yang benar",
  }),
  message: z.string().min(1, {
    message: "Mohon masukan pesan anda",
  }),
});

export async function contactSignupAction(
  prevState: ContactSignupState,
  formData: FormData
): Promise<ContactSignupState> {
  const formDataObject = {
    name: formData.get("name"),
    contact: formData.get("contact"),
    message: formData.get("message"),
    eventId: formData.get("eventId"),
  };

  const validatedFields = contactSignupSchema.safeParse(formDataObject);

  if (!validatedFields.success) {
    const zodErrors = z.flattenError(validatedFields.error).fieldErrors;
    const strapiErrs = prevState.strapiErrors ?? {}; // adjust if shape differs

    const filteredFormData: ContactSignupForm = {
      ...formDataObject,
      ...Object.fromEntries(
        Object.keys(zodErrors)
          .concat(Object.keys(strapiErrs))
          .map((k) => [k, null])
      ),
    };

    return {
      ...prevState,
      zodErrors,
      strapiErrors: strapiErrs,
      formData: filteredFormData,
    };
  }

  const dataToSend: ContactSignupProps = {
    ...validatedFields.data,
  };

  const responseData = await submitContactForm(dataToSend);

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      zodErrors: null,
      errorMessage: "Ops! Ada yang salah. Mohon coba kembali.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: { error: "Failed to submit" }, // Mock strapi error structure
      zodErrors: null,
      formData: {
        ...formDataObject,
      },
      errorMessage: "Gagal untuk mengirim.",
    };
  }

  return {
    ...prevState,
    zodErrors: null,
    strapiErrors: null,
    errorMessage: null,
    formData: null,
    successMessage: "Berhasil Dikirim!",
  };
}
