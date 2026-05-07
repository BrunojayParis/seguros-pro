import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold text-zinc-100">Dashboard</h1>
      <p className="mt-2 text-zinc-400">Hola, {session.perfil?.nombre ?? session.user.email}</p>
    </section>
  );
}
