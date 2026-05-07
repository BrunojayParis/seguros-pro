import { Shield } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

type StatCard = {
  label: string;
  value: string;
  hint: string;
};

const stats: StatCard[] = [
  { label: "PRIMA MENSUAL", value: "$2.4M", hint: "+12%" },
  { label: "POLIZAS ACTIVAS", value: "148", hint: "+5 nuevas" },
  { label: "CLIENTES", value: "93", hint: "este mes" },
  { label: "VENCIMIENTOS", value: "11", hint: "proximos 30 dias" },
];

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0c0c0c] text-zinc-100">
      <div className="w-full border-zinc-800/80 px-5 py-6 sm:px-8 lg:w-[52%] lg:border-r lg:px-12 lg:py-10">
        <div className="mx-auto flex h-full w-full max-w-[520px] flex-col">
          <div className="mb-10 flex items-center gap-3 sm:mb-14">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-blue-600/35 text-blue-300">
              <Shield className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <span className="text-2xl font-semibold tracking-tight">SegurosPro</span>
          </div>

          <div className="mb-6 space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">{title}</h1>
            <p className="text-xl text-zinc-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      <aside className="relative hidden flex-1 overflow-hidden bg-[#050505] px-10 py-10 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.26),transparent_58%)]" />
        <div className="relative z-10 mx-auto mt-20 w-full max-w-[520px]">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-6 py-5 backdrop-blur"
              >
                <p className="text-xs font-medium tracking-[0.2em] text-zinc-500">{stat.label}</p>
                <p className="mt-1.5 text-4xl font-semibold text-zinc-100">{stat.value}</p>
                <p className="mt-1.5 text-2xl text-emerald-400">{stat.hint}</p>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-lg text-center text-2xl leading-snug tracking-tight text-zinc-500">
            Gestiona tu cartera de seguros desde un solo lugar.
          </p>
        </div>
      </aside>
    </div>
  );
}
