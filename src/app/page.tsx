import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <main className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">SegurosPro</h1>
        <p className="text-zinc-400">Elegi donde queres ir</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login" className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-900">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-900"
          >
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}
