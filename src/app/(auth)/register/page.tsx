import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { getSession } from "@/lib/auth/getSession";

export default async function RegisterPage() {
  const session = await getSession();

  if (session?.currentOrg) {
    redirect("/dashboard");
  }

  const initialUser = session
    ? {
        nombre: session.perfil?.nombre ?? session.user.user_metadata?.nombre ?? "",
        apellido: session.perfil?.apellido ?? session.user.user_metadata?.apellido ?? "",
        email: session.user.email ?? session.perfil?.email ?? "",
      }
    : null;

  return <OnboardingFlow initialUser={initialUser} />;
}
