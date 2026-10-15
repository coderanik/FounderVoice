import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="marketing-page min-h-screen" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
