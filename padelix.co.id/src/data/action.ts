"use server";
import { z } from "zod";
import { contactSignupService, type ContactSignupProps } from "./service";
import { ContactSignupState } from "@/types";

const contactSignupSchema = z.object({
  name: z.string().min(1, {
    message: "Mohon masukan nama anda",
  }),
  contact: z.union([
    z.email({
      message: "Mohon masukan email yang benar",
    }),
    z.string().regex(/^\+?[0-9]{7,15}$/, {
      message: "Mohon masukan nomor WA yang benar",
    }),
  ]),
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
    return {
      ...prevState,
      zodErrors: z.flattenError(validatedFields.error).fieldErrors,
      strapiErrors: null,
      formData: {
        ...formDataObject,
      },
    };
  }

  const dataToSend: ContactSignupProps = {
    ...validatedFields.data,
    event: {
      connect: [formDataObject.eventId as string],
    },
  };

  const responseData = await contactSignupService(dataToSend);

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
      strapiErrors: responseData.error,
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
