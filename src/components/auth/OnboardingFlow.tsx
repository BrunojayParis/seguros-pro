"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  Car,
  Check,
  Circle,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Heart,
  Home,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Stethoscope,
  Trash2,
  Upload,
  UserRoundCheck,
} from "lucide-react";
import { completeOnboarding } from "@/lib/auth/actions";
import { createBrowserClient } from "@/lib/supabase/client";
import type { OnboardingRamo, OnboardingRol } from "@/types/onboarding";

type InitialUser = {
  nombre: string;
  apellido: string;
  email: string;
};

type OnboardingFlowProps = {
  initialUser: InitialUser | null;
};

type AccountState = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
};

type OrganizationState = {
  nombre: string;
  cuit: string;
  matricula_ssn: string;
  telefono: string;
};

type TeamMember = {
  id: string;
  email: string;
  rol: OnboardingRol;
};

type ImportMethod = "excel" | "manual";

type FinalState =
  | {
      status: "idle";
    }
  | {
      status: "pending_email_confirmation";
      message: string;
    };

const stepItems = [
  { label: "Tu cuenta", sub: "Email o Google" },
  { label: "Tu organizacion", sub: "Nombre y datos" },
  { label: "Ramos", sub: "Tipos de seguro" },
  { label: "Importar datos", sub: "Clientes y polizas" },
  { label: "Listo", sub: "Accede al panel" },
] as const;

const ramoOptions: {
  id: OnboardingRamo;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "automotor", label: "Automotor", description: "Autos, motos, camiones", icon: Car },
  { id: "vida", label: "Vida", description: "Individual y colectivo", icon: Heart },
  {
    id: "accidentes_personales",
    label: "Acc. Personales",
    description: "AP y muerte accidental",
    icon: Stethoscope,
  },
  { id: "hogar", label: "Hogar", description: "Combinado familiar", icon: Home },
  { id: "art", label: "ART", description: "Riesgos del trabajo", icon: UserRoundCheck },
  { id: "otros", label: "Otros", description: "Caucion, RC, etc.", icon: FileSpreadsheet },
];

function getPasswordScore(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

function passwordLabel(score: number) {
  if (score <= 1) return "Debil";
  if (score === 2) return "Regular";
  if (score === 3) return "Buena";
  return "Excelente";
}

function strengthClass(score: number) {
  if (score <= 1) return "bg-red-400";
  if (score === 2) return "bg-amber-400";
  return "bg-emerald-400";
}

function getInitials(value: string) {
  const text = value.trim();
  if (!text) return "?";
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function OnboardingFlow({ initialUser }: OnboardingFlowProps) {
  const hasSession = Boolean(initialUser);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [account, setAccount] = useState<AccountState>({
    nombre: initialUser?.nombre ?? "",
    apellido: initialUser?.apellido ?? "",
    email: initialUser?.email ?? "",
    password: "",
  });
  const [organization, setOrganization] = useState<OrganizationState>({
    nombre: "",
    cuit: "",
    matricula_ssn: "",
    telefono: "",
  });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [ramos, setRamos] = useState<Set<OnboardingRamo>>(new Set());
  const [importMethod, setImportMethod] = useState<ImportMethod | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [skipImport, setSkipImport] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalState, setFinalState] = useState<FinalState>({ status: "idle" });
  const [oauthPending, setOauthPending] = useState(false);
  const [pending, startTransition] = useTransition();

  const score = getPasswordScore(account.password);
  const ownerEmail = account.email.trim().toLowerCase();
  const selectedRamos = useMemo(() => ramoOptions.filter((item) => ramos.has(item.id)), [ramos]);

  const goToStep = (target: number) => {
    if (target === step) return;
    if (completed.has(target)) {
      setStep(target);
      setError(null);
    }
  };

  const markStepDone = (index: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const validateStep = (index: number) => {
    if (index === 0) {
      if (hasSession) {
        if (!account.nombre.trim() || !account.email.trim()) {
          return "Completa nombre y email para continuar";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim())) {
          return "Ingresa un email valido";
        }
        return null;
      }
      if (!account.nombre.trim() || !account.email.trim() || !account.password) {
        return "Completa nombre, email y contrasena para continuar";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim())) {
        return "Ingresa un email valido";
      }
      if (account.password.length < 8) {
        return "La contrasena debe tener al menos 8 caracteres";
      }
      return null;
    }

    if (index === 1) {
      if (!organization.nombre.trim()) {
        return "Ingresa el nombre de tu organizacion";
      }

      const seen = new Set<string>();
      for (const member of team) {
        const email = member.email.trim().toLowerCase();
        if (!email) {
          return "Completa el email de cada colaborador o elimina la fila vacia";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return `Email invalido: ${member.email}`;
        }
        if (email === ownerEmail) {
          return "No puedes invitarte a ti mismo como colaborador";
        }
        if (seen.has(email)) {
          return "Hay emails de colaboradores duplicados";
        }
        seen.add(email);
      }
      return null;
    }

    if (index === 2) {
      if (ramos.size < 1) {
        return "Selecciona al menos un ramo para continuar";
      }
      return null;
    }

    return null;
  };

  const nextStep = (index: number, options?: { skip?: boolean }) => {
    const skip = options?.skip ?? false;
    if (!skip) {
      const validationError = validateStep(index);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (index === 3) {
      setSkipImport(skip);
    }

    markStepDone(index);
    setStep(Math.min(stepItems.length - 1, index + 1));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRamo = (ramo: OnboardingRamo) => {
    setRamos((prev) => {
      const next = new Set(prev);
      if (next.has(ramo)) {
        next.delete(ramo);
      } else {
        next.add(ramo);
      }
      return next;
    });
  };

  const addTeamMember = () => {
    setTeam((prev) => [...prev, { id: uid(), email: "", rol: "asistente" }]);
  };

  const updateTeamMember = (id: string, patch: Partial<TeamMember>) => {
    setTeam((prev) => prev.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  };

  const removeTeamMember = (id: string) => {
    setTeam((prev) => prev.filter((member) => member.id !== id));
  };

  const handleGoogle = async () => {
    setError(null);
    setOauthPending(true);
    try {
      const supabase = createBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/register`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        setError("No pudimos iniciar sesion con Google");
      }
    } catch {
      setError("No pudimos iniciar sesion con Google");
    } finally {
      setOauthPending(false);
    }
  };

  const handleComplete = () => {
    if (validateStep(0) || validateStep(1) || validateStep(2)) {
      setError("Faltan completar datos obligatorios antes de finalizar");
      return;
    }

    startTransition(() => {
      completeOnboarding({
        account: {
          useExistingSession: hasSession,
          nombre: account.nombre,
          apellido: account.apellido || "Usuario",
          email: account.email,
          password: hasSession ? undefined : account.password,
        },
        organization,
        team: team.map((member) => ({ email: member.email, rol: member.rol })),
        ramos: Array.from(ramos),
        importConfig: {
          method: importMethod,
          fileName: importFileName,
          skipped: skipImport,
        },
      })
        .then((result) => {
          if (result.error) {
            setError(result.error);
            return;
          }

          if (result.status === "done" && result.redirectTo) {
            window.location.assign(result.redirectTo);
            return;
          }

          if (result.status === "pending_email_confirmation") {
            setFinalState({
              status: "pending_email_confirmation",
              message: result.message ?? "Revisa tu email para confirmar tu cuenta",
            });
            setError(null);
          }
        })
        .catch(() => {
          setError("No pudimos completar el onboarding. Intenta nuevamente");
        });
    });
  };

  const handleMobileAdvance = () => {
    if (step === 4) {
      handleComplete();
      return;
    }

    nextStep(step);
  };

  return (
    <div className="flex min-h-screen bg-[#0e0e0d] text-[#f0efe8]">
      <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 flex-col border-r border-[#2c2c28] bg-[#161614] px-7 py-8 lg:flex">
        <Link href="/" className="mb-12 flex w-fit items-center gap-2.5" aria-label="Volver al inicio">
          <div className="grid h-[30px] w-[30px] place-content-center rounded-lg border border-[rgba(91,156,246,0.2)] bg-[rgba(26,95,204,0.12)]">
            <Shield className="h-4 w-4 text-[#5b9cf6]" />
          </div>
          <span className="text-[15px] font-medium">SegurosPro</span>
        </Link>

        <div className="flex flex-1 flex-col gap-1">
          {stepItems.map((item, index) => {
            const isDone = completed.has(index);
            const isActive = step === index;
            const canClick = isDone;

            return (
              <button
                key={item.label}
                type="button"
                disabled={!canClick}
                onClick={() => goToStep(index)}
                className={`group flex items-start gap-3 rounded-xl px-2.5 py-3 text-left transition ${
                  canClick ? "cursor-pointer hover:bg-[#1e1e1b]" : "cursor-default"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-7 w-7 place-content-center rounded-full border text-xs font-medium transition ${
                      isDone
                        ? "border-[rgba(74,222,128,0.4)] bg-[rgba(22,163,74,0.1)] text-[#4ade80]"
                        : isActive
                          ? "border-[rgba(91,156,246,0.2)] bg-[rgba(26,95,204,0.12)] text-[#5b9cf6]"
                          : "border-[#3a3a35] text-[#6b6a62]"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  {index < stepItems.length - 1 ? <span className="mt-1 h-6 w-px bg-[#2c2c28]" /> : null}
                </div>
                <div className="pt-0.5">
                  <p className={`text-[13px] font-medium ${isActive ? "text-[#f0efe8]" : isDone ? "text-[#a8a79e]" : "text-[#6b6a62]"}`}>
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6b6a62]">{item.sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-[#6b6a62]">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#5b9cf6] underline-offset-2 hover:underline">
            Ingresa
          </Link>
        </p>
      </aside>

      <main className="flex flex-1 justify-center overflow-y-auto px-5 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-[760px]">
          <Link href="/" className="mb-6 inline-flex items-center gap-2.5 lg:hidden" aria-label="Volver al inicio">
            <span className="grid h-[30px] w-[30px] place-content-center rounded-lg border border-[rgba(91,156,246,0.2)] bg-[rgba(26,95,204,0.12)]">
              <Shield className="h-4 w-4 text-[#5b9cf6]" />
            </span>
            <span className="text-[15px] font-medium">SegurosPro</span>
          </Link>

          {finalState.status === "pending_email_confirmation" ? (
            <section className="mx-auto max-w-[560px] rounded-2xl border border-[#2c2c28] bg-[#10100f] p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-content-center rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)]">
                <Check className="h-8 w-8 text-[#4ade80]" />
              </div>
              <h1 className="mt-6 font-[var(--font-dm-serif)] text-4xl text-white">Revisa tu email</h1>
              <p className="mx-auto mt-4 max-w-md text-lg text-[#a8a79e]">{finalState.message}</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-[#6b6a62]">
                La organizacion ya fue creada y tus colaboradores fueron invitados.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1a5fcc] px-6 text-base font-medium text-white transition hover:bg-[#1450b0]"
                >
                  Ir a login
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3a3a35] px-6 text-base text-[#a8a79e] transition hover:bg-[#1e1e1b] hover:text-[#f0efe8]"
                >
                  Volver al inicio
                </Link>
              </div>
            </section>
          ) : (
            <>
              <header className="mb-8">
                <div className="mb-2 flex items-center justify-between gap-3 lg:block">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#5b9cf6]">
                    Paso {step + 1} de {stepItems.length} - {stepItems[step].label}
                  </p>
                  <button
                    type="button"
                    onClick={handleMobileAdvance}
                    disabled={pending || oauthPending}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(91,156,246,0.25)] bg-[rgba(26,95,204,0.12)] px-3 text-xs font-medium text-[#5b9cf6] transition hover:bg-[rgba(26,95,204,0.2)] disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
                  >
                    <Check className="h-3.5 w-3.5" />
                    OK
                  </button>
                </div>
                {step === 0 ? (
                  <>
                    <h1 className="mt-3 font-[var(--font-dm-serif)] text-5xl leading-[1.1] text-white">Empeza en segundos</h1>
                    <p className="mt-3 max-w-2xl text-[15px] text-[#a8a79e]">Crea tu cuenta para acceder a SegurosPro.</p>
                  </>
                ) : null}
                {step === 1 ? (
                  <>
                    <h1 className="mt-3 font-[var(--font-dm-serif)] text-5xl leading-[1.1] text-white">Contanos sobre tu empresa</h1>
                    <p className="mt-3 max-w-2xl text-[15px] text-[#a8a79e]">Estos datos apareceran en tu panel y en los reportes.</p>
                  </>
                ) : null}
                {step === 2 ? (
                  <>
                    <h1 className="mt-3 font-[var(--font-dm-serif)] text-5xl leading-[1.1] text-white">Que tipos de seguro manejas?</h1>
                    <p className="mt-3 max-w-2xl text-[15px] text-[#a8a79e]">Selecciona todos los ramos con los que trabajas.</p>
                  </>
                ) : null}
                {step === 3 ? (
                  <>
                    <h1 className="mt-3 font-[var(--font-dm-serif)] text-5xl leading-[1.1] text-white">Carga tu cartera existente</h1>
                    <p className="mt-3 max-w-2xl text-[15px] text-[#a8a79e]">
                      Si ya tienes clientes y polizas en Excel o CSV, puedes importarlos ahora.
                    </p>
                  </>
                ) : null}
                {step === 4 ? (
                  <>
                    <h1 className="mt-3 font-[var(--font-dm-serif)] text-5xl leading-[1.1] text-white">Todo listo, {account.nombre || "productor"}!</h1>
                    <p className="mt-3 max-w-2xl text-[15px] text-[#a8a79e]">Revisa el resumen antes de ir al panel.</p>
                  </>
                ) : null}
              </header>

              {error ? (
                <div className="mb-5 rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.1)] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {step === 0 ? (
                <section className="max-w-[760px]">
                  {hasSession ? (
                    <div className="mb-4 rounded-2xl border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)] px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#4ade80]">
                        <Check className="h-4 w-4" />
                        Sesion activa detectada
                      </div>
                      <p className="mt-2 text-sm text-[#a8a79e]">Continuaras onboarding con {account.email}.</p>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                      Nombre
                      <input
                        value={account.nombre}
                        onChange={(event) => setAccount((prev) => ({ ...prev, nombre: event.target.value }))}
                        className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                        placeholder="Carlos"
                      />
                    </label>
                    <label className="space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                      Apellido
                      <input
                        value={account.apellido}
                        onChange={(event) => setAccount((prev) => ({ ...prev, apellido: event.target.value }))}
                        className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                        placeholder="Garcia"
                      />
                    </label>
                  </div>

                  <label className="mt-3 block space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                    Email
                    <input
                      value={account.email}
                      onChange={(event) => setAccount((prev) => ({ ...prev, email: event.target.value }))}
                      className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                      placeholder="tu@email.com"
                      type="email"
                    />
                  </label>

                  {!hasSession ? (
                    <>
                      <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={oauthPending}
                        className="mb-4 mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3a3a35] bg-[#1e1e1b] text-base transition hover:bg-[#252522] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {oauthPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Circle className="h-4 w-4" />}
                        Continuar con Google
                      </button>

                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#2c2c28]" />
                        <span className="text-xs text-[#6b6a62]">o con email</span>
                        <div className="h-px flex-1 bg-[#2c2c28]" />
                      </div>

                      <label className="mt-3 block space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                        Contrasena
                        <div className="relative">
                          <input
                            value={account.password}
                            onChange={(event) => setAccount((prev) => ({ ...prev, password: event.target.value }))}
                            className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 pr-11 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                            placeholder="Minimo 8 caracteres"
                            type={showPassword ? "text" : "password"}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6a62] transition hover:text-[#a8a79e]"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </label>

                      <div className="mt-3 space-y-1.5">
                        <div className="grid grid-cols-4 gap-1.5">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className={`h-1 rounded-full ${index < score ? strengthClass(score) : "bg-[#2c2c28]"}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#6b6a62]">{account.password ? passwordLabel(score) : ""}</p>
                      </div>
                    </>
                  ) : null}

                  <p className="mt-4 text-sm text-[#6b6a62]">
                    Al continuar aceptas los Terminos de uso y la Politica de privacidad.
                  </p>
                </section>
              ) : null}

              {step === 1 ? (
                <section className="max-w-[760px]">
                  <div className="mb-4 grid h-14 w-14 place-content-center rounded-xl border border-[rgba(91,156,246,0.2)] bg-[rgba(26,95,204,0.12)] text-2xl font-medium text-[#5b9cf6]">
                    {getInitials(organization.nombre)}
                  </div>

                  <label className="block space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                    Nombre de la organizacion
                    <input
                      value={organization.nombre}
                      onChange={(event) => setOrganization((prev) => ({ ...prev, nombre: event.target.value }))}
                      className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                      placeholder="Ej: Garcia Seguros"
                    />
                  </label>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                      CUIT (opcional)
                      <input
                        value={organization.cuit}
                        onChange={(event) => setOrganization((prev) => ({ ...prev, cuit: event.target.value }))}
                        className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                        placeholder="30-12345678-9"
                      />
                    </label>
                    <label className="space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                      Matricula SSN (opcional)
                      <input
                        value={organization.matricula_ssn}
                        onChange={(event) =>
                          setOrganization((prev) => ({ ...prev, matricula_ssn: event.target.value }))
                        }
                        className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                        placeholder="MAT-001234"
                      />
                    </label>
                  </div>

                  <label className="mt-3 block space-y-2 text-xs uppercase tracking-[0.08em] text-[#a8a79e]">
                    Telefono de contacto
                    <input
                      value={organization.telefono}
                      onChange={(event) => setOrganization((prev) => ({ ...prev, telefono: event.target.value }))}
                      className="h-12 w-full rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-4 text-base text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                      placeholder="11 1234-5678"
                    />
                  </label>

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.08em] text-[#a8a79e]">Trabajas con equipo?</p>

                    <div className="mt-3 space-y-2">
                      {team.map((member) => (
                        <div key={member.id} className="grid gap-2 sm:grid-cols-[1fr_170px_40px]">
                          <input
                            value={member.email}
                            onChange={(event) => updateTeamMember(member.id, { email: event.target.value })}
                            className="h-10 rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-3 text-sm text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                            placeholder="email@colaborador.com"
                            type="email"
                          />
                          <select
                            value={member.rol}
                            onChange={(event) => updateTeamMember(member.id, { rol: event.target.value as OnboardingRol })}
                            className="h-10 rounded-xl border border-[#3a3a35] bg-[#1e1e1b] px-3 text-sm text-[#f0efe8] outline-none ring-[#1a5fcc] focus:ring-2"
                          >
                            <option value="productor">Productor</option>
                            <option value="asistente">Asistente</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(member.id)}
                            className="grid h-10 w-10 place-content-center rounded-xl border border-[#2c2c28] text-[#6b6a62] transition hover:border-[rgba(220,38,38,0.2)] hover:bg-[rgba(220,38,38,0.1)] hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-[#5b9cf6] transition hover:opacity-80"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar colaborador
                    </button>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3a3a35] px-6 text-base text-[#a8a79e] transition hover:bg-[#1e1e1b] hover:text-[#f0efe8]"
                    >
                      Atras
                    </button>
                    <button
                      type="button"
                      onClick={() => nextStep(1)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1a5fcc] px-6 text-base font-medium text-white transition hover:bg-[#1450b0]"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section className="max-w-[760px]">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ramoOptions.map((ramo) => {
                      const selected = ramos.has(ramo.id);
                      const Icon = ramo.icon;
                      return (
                        <button
                          type="button"
                          key={ramo.id}
                          onClick={() => toggleRamo(ramo.id)}
                          className={`rounded-2xl border p-4 text-center transition ${
                            selected
                              ? "border-[#1a5fcc] bg-[rgba(26,95,204,0.12)]"
                              : "border-[#2c2c28] hover:border-[#3a3a35] hover:bg-[#1e1e1b]"
                          }`}
                        >
                          <Icon className={`mx-auto h-6 w-6 ${selected ? "text-[#5b9cf6]" : "text-[#a8a79e]"}`} />
                          <p className={`mt-2 text-base font-medium ${selected ? "text-[#5b9cf6]" : "text-[#f0efe8]"}`}>
                            {ramo.label}
                          </p>
                          <p className="mt-1 text-sm text-[#6b6a62]">{ramo.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-sm text-[#6b6a62]">Selecciona al menos uno para continuar.</p>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3a3a35] px-6 text-base text-[#a8a79e] transition hover:bg-[#1e1e1b] hover:text-[#f0efe8]"
                    >
                      Atras
                    </button>
                    <button
                      type="button"
                      onClick={() => nextStep(2)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1a5fcc] px-6 text-base font-medium text-white transition hover:bg-[#1450b0]"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </section>
              ) : null}

              {step === 3 ? (
                <section className="max-w-[760px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setImportMethod("excel")}
                      className={`rounded-2xl border p-5 text-center transition ${
                        importMethod === "excel"
                          ? "border-[#1a5fcc] bg-[rgba(26,95,204,0.12)]"
                          : "border-[#2c2c28] hover:border-[#3a3a35] hover:bg-[#1e1e1b]"
                      }`}
                    >
                      <span className="mx-auto grid h-11 w-11 place-content-center rounded-xl border border-[#2c2c28] bg-[#252522]">
                        <FileSpreadsheet
                          className={`h-5 w-5 ${importMethod === "excel" ? "text-[#5b9cf6]" : "text-[#a8a79e]"}`}
                        />
                      </span>
                      <p className="text-base font-medium">Excel / CSV</p>
                      <p className="mt-1 text-sm text-[#6b6a62]">Importa desde una planilla existente</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMethod("manual")}
                      className={`rounded-2xl border p-5 text-center transition ${
                        importMethod === "manual"
                          ? "border-[#1a5fcc] bg-[rgba(26,95,204,0.12)]"
                          : "border-[#2c2c28] hover:border-[#3a3a35] hover:bg-[#1e1e1b]"
                      }`}
                    >
                      <span className="mx-auto grid h-11 w-11 place-content-center rounded-xl border border-[#2c2c28] bg-[#252522]">
                        <Pencil className={`h-5 w-5 ${importMethod === "manual" ? "text-[#5b9cf6]" : "text-[#a8a79e]"}`} />
                      </span>
                      <p className="mt-3 text-base font-medium">Carga manual</p>
                      <p className="mt-1 text-sm text-[#6b6a62]">Ingresa los datos uno por uno</p>
                    </button>
                  </div>

                  {importMethod === "excel" ? (
                    <div className="mt-4">
                      <label
                        className={`block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
                          importFileName
                            ? "border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)]"
                            : "border-[#3a3a35] hover:border-[#1a5fcc] hover:bg-[rgba(26,95,204,0.12)]"
                        }`}
                        onDragOver={(event) => {
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const file = event.dataTransfer.files?.[0];
                          if (!file) return;
                          setImportFileName(file.name);
                          setSkipImport(false);
                        }}
                      >
                        <Upload className={`mx-auto h-8 w-8 ${importFileName ? "text-[#4ade80]" : "text-[#6b6a62]"}`} />
                        <p className="mt-2 text-sm font-medium text-[#a8a79e]">
                          {importFileName ? `Archivo seleccionado: ${importFileName}` : "Arrastra tu archivo aqui"}
                        </p>
                        <p className="mt-1 text-xs text-[#6b6a62]">Excel (.xlsx) o CSV - hasta 10MB</p>
                        <input
                          className="hidden"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setImportFileName(file.name);
                            setSkipImport(false);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob(
                            ["nombre,apellido,email,telefono,ramo,numero_poliza,vigencia_desde,vigencia_hasta\n"],
                            {
                              type: "text/csv;charset=utf-8;",
                            },
                          );
                          const href = URL.createObjectURL(blob);
                          const anchor = document.createElement("a");
                          anchor.href = href;
                          anchor.download = "plantilla-segurospro.csv";
                          anchor.click();
                          URL.revokeObjectURL(href);
                        }}
                        className="mt-3 inline-flex items-center gap-2 text-sm text-[#5b9cf6] transition hover:opacity-80"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Descargar plantilla de ejemplo
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3a3a35] px-6 text-base text-[#a8a79e] transition hover:bg-[#1e1e1b] hover:text-[#f0efe8]"
                    >
                      Atras
                    </button>
                    <button
                      type="button"
                      onClick={() => nextStep(3)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1a5fcc] px-6 text-base font-medium text-white transition hover:bg-[#1450b0]"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => nextStep(3, { skip: true })}
                      className="inline-flex h-12 items-center justify-center px-2 text-base text-[#6b6a62] transition hover:text-[#a8a79e]"
                    >
                      Hacer esto despues
                    </button>
                  </div>
                </section>
              ) : null}

              {step === 4 ? (
                <section className="mx-auto max-w-[720px]">
                  <div className="rounded-2xl border border-[#2c2c28] bg-[#10100f] p-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm text-[#a8a79e]">
                        <span className="mt-0.5 grid h-5 w-5 place-content-center rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)] text-[#4ade80]">
                          <Check className="h-3 w-3" />
                        </span>
                        Cuenta creada para {account.email || "tu email"}
                      </div>
                      <div className="flex items-start gap-3 text-sm text-[#a8a79e]">
                        <span className="mt-0.5 grid h-5 w-5 place-content-center rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)] text-[#4ade80]">
                          <Check className="h-3 w-3" />
                        </span>
                        Organizacion: {organization.nombre || "Tu organizacion"}
                      </div>
                      <div className="flex items-start gap-3 text-sm text-[#a8a79e]">
                        <span className="mt-0.5 grid h-5 w-5 place-content-center rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)] text-[#4ade80]">
                          <Check className="h-3 w-3" />
                        </span>
                        Ramos: {selectedRamos.map((item) => item.label).join(", ") || "Sin seleccion"}
                      </div>
                      <div className="flex items-start gap-3 text-sm text-[#a8a79e]">
                        <span className="mt-0.5 grid h-5 w-5 place-content-center rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)] text-[#4ade80]">
                          <Check className="h-3 w-3" />
                        </span>
                        Colaboradores: {team.length > 0 ? `${team.length} invitacion(es)` : "Sin colaboradores"}
                      </div>
                      <div className="flex items-start gap-3 text-sm text-[#a8a79e]">
                        <span className="mt-0.5 grid h-5 w-5 place-content-center rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(22,163,74,0.1)] text-[#4ade80]">
                          <Check className="h-3 w-3" />
                        </span>
                        Importacion: {skipImport ? "Lo haras despues" : importMethod ?? "Sin definir"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3a3a35] px-6 text-base text-[#a8a79e] transition hover:bg-[#1e1e1b] hover:text-[#f0efe8]"
                    >
                      Atras
                    </button>
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={pending}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1a5fcc] px-6 text-base font-medium text-white transition hover:bg-[#1450b0] disabled:cursor-not-allowed disabled:opacity-65"
                    >
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {hasSession ? "Ir a mi panel" : "Finalizar onboarding"}
                      {!pending ? <ArrowRight className="h-4 w-4" /> : null}
                    </button>
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
