"use client";

import Link from "next/link";
import { useActionState } from "react";
import { StrapiImage } from "@/components/general/StrapiImage";
import { ContactSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { TextInput } from "@/components/ui/textInput";
import { SubmitButton } from "../ui/submitButton";
import { contactSignupAction } from "@/data/action";

const INITIAL_STATE = {
  zodErrors: null,
  strapiErrors: null,
  errorMessage: null,
  successMessage: null,
  formData: null,
};

export function ContactSection({
  subheading,
  backgroundColor,
  contactForm,
  contactInfo,
}: Readonly<ContactSectionProps>) {
  const [formState, formAction] = useActionState(
    contactSignupAction,
    INITIAL_STATE
  );

  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  const zodErrors = formState?.zodErrors;
  const strapiErrors = formState?.strapiErrors?.message;
  const successMessage = formState?.successMessage;

  return (
    <section
      id={id}
      className={`section sm:py-8 gap-4 sm:gap-7 ${getBackgroundColor(
        backgroundColor
      )}`}
    >
      <h3 className="subheading">{subheading}</h3>
      <div className="wrapper items-start justify-center h-full gap-4 sm:gap-12 lg:gap-0">
        <div className="flex flex-col justify-start items-start w-full lg:w-1/2 h-full gap-2 sm:gap-4">
          <h2 className="h2">{contactForm.heading}</h2>
          <form
            className="flex flex-col justify-start w-full sm:w-2/3 gap-2 sm:gap-4"
            action={formAction}
          >
            <TextInput
              id="name"
              label="Nama"
              name="name"
              className="h-12 sm:h-14 rounded-[1.875rem] bg-neutral-300 placeholder:text-neutral-600 placeholder:text-[1.125rem] p-4"
              error={zodErrors?.name?.[0]}
              defaultValue={
                typeof formState?.formData?.name === "string"
                  ? formState.formData.name
                  : ""
              }
            />
            <TextInput
              id="contact"
              label="Email/WA"
              name="contact"
              type="text"
              className="h-12 sm:h-14 rounded-[1.875rem] bg-neutral-300 placeholder:text-neutral-600 placeholder:text-[1.125rem] p-4"
              error={zodErrors?.contact?.[0]}
              defaultValue={
                !zodErrors?.contact?.[0]
                  ? typeof formState?.formData?.contact === "string"
                    ? formState.formData.contact
                    : ""
                  : undefined
              }
            />
            <TextInput
              id="message"
              label="Pesan"
              name="message"
              textArea
              className="h-29 sm:h-48 rounded-[1.875rem] bg-neutral-300 placeholder:text-neutral-600 placeholder:text-[1.125rem] p-4"
              error={zodErrors?.message?.[0]}
              defaultValue={
                typeof formState?.formData?.message === "string"
                  ? formState.formData.message
                  : ""
              }
            />
            <div className="w-1/3 flex items-center gap-8 text-nowrap">
              <SubmitButton
                className="rounded-[1.875rem] uppercase font-bold bg-red-500 text-neutral-950 h-12 sm:h-14 w-4/5 text-[1.125rem]"
                text="Kirim"
              />
              {strapiErrors && <p className="text-red-500">{strapiErrors}</p>}
              {successMessage && (
                <p className="text-lime-400">{successMessage}</p>
              )}
            </div>
          </form>
        </div>
        <div className="flex flex-col justify-start items-start w-full lg:w-1/2 h-full gap-2 sm:gap-4">
          <h2 className="h2">{contactInfo.heading}</h2>
          <div className="flex flex-col h-full gap-2 sm:gap-4">
            {contactInfo.logoLink.map((item) => (
              <Link
                key={item.id}
                href={item.link.href}
                target={item.link.isExternal ? "_blank" : "_self"}
                className="flex justify-start items-center gap-4"
              >
                <StrapiImage
                  src={item.logo.image.url}
                  alt={
                    item.logo.image.alternativeText ||
                    "No alternative text provided"
                  }
                  width={60}
                  height={60}
                  className={`size-10 sm:size-auto sm:max-w-15 sm:max-h-15 rounded-full p-2 ${getBackgroundColor(
                    item.logo.backgroundColor
                  )}`}
                />
                <p className="font-bold">{item.link.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
