"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/auth/actions";
import { AuthShell } from "@/components/auth/AuthShell";

const schema = z.object({
  email: z.string().email("Ingresa un email valido"),
  password: z.string().min(1, "Ingresa tu contrasena"),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "email" || field === "password") {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    const formData = new FormData();
    formData.set("email", parsed.data.email);
    formData.set("password", parsed.data.password);

    startTransition(() => {
      login(formData)
        .then((result) => {
          if (result?.error) {
            setFormError(result.error);
          }
        })
        .catch(() => {
          setFormError("No pudimos iniciar sesion. Intenta nuevamente");
        });
    });
  };

  return (
    <AuthShell title="Bienvenido" subtitle="Ingresa a tu panel de produccion">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[520px] space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-base font-semibold tracking-[0.14em] text-zinc-400">
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register("email")}
            className="h-13 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-5 text-xl text-zinc-100 outline-none ring-blue-500 transition focus:ring-2"
          />
          {errors.email?.message ? <p className="text-sm text-red-400">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <label
              htmlFor="password"
              className="text-base font-semibold tracking-[0.14em] text-zinc-400"
            >
              CONTRASENA
            </label>
            <span className="text-base text-blue-400">Olvidaste tu contrasena?</span>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="********"
            {...register("password")}
            className="h-13 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-5 text-xl text-zinc-100 outline-none ring-blue-500 transition focus:ring-2"
          />
          {errors.password?.message ? (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-13 w-full rounded-xl border border-zinc-700 text-xl font-semibold text-zinc-100 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="pt-1 text-center text-xl text-zinc-500">
          No tenes cuenta?{" "}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300">
            Registrate
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
