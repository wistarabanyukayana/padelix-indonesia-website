import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

async function LoginRedirect() {
  await connection();

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (session?.user?.id) {
    redirect("/admin");
  }

  return null;
}

export default function LoginPage() {
  return (
    <>
      <Suspense>
        <LoginRedirect />
      </Suspense>
      <LoginForm />
    </>
  );
}
