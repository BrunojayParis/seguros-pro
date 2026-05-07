"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { register as registerAction } from "@/lib/auth/actions";

const schema = z
  .object({
    nombre: z.string().min(2, "Ingresa tu nombre"),
    apellido: z.string().min(2, "Ingresa tu apellido"),
    email: z.string().email("Ingresa un email valido"),
    password: z.string().min(8, "Minimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Repite tu contrasena"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden",
  });

type RegisterFormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setFormError(null);
    setSuccessMessage(null);
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (
          field === "nombre" ||
          field === "apellido" ||
          field === "email" ||
          field === "password" ||
          field === "confirmPassword"
        ) {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    const formData = new FormData();
    formData.set("nombre", parsed.data.nombre);
    formData.set("apellido", parsed.data.apellido);
    formData.set("email", parsed.data.email);
    formData.set("password", parsed.data.password);
    formData.set("confirmPassword", parsed.data.confirmPassword);

    startTransition(() => {
      registerAction(formData)
        .then((result) => {
          if (result?.error) {
            setFormError(result.error);
            return;
          }

          setSuccessMessage(result?.message ?? "Revisá tu email para confirmar tu cuenta");
          reset();
        })
        .catch(() => {
          setFormError("No pudimos crear tu cuenta. Intenta nuevamente");
        });
    });
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="Completa tus datos para comenzar">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[520px] space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-base font-semibold tracking-[0.14em] text-zinc-400">
              NOMBRE
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Carlos"
              autoComplete="given-name"
              {...register("nombre")}
              className="h-13 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-5 text-xl text-zinc-100 outline-none ring-blue-500 transition focus:ring-2"
            />
            {errors.nombre?.message ? <p className="text-sm text-red-400">{errors.nombre.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="apellido"
              className="text-base font-semibold tracking-[0.14em] text-zinc-400"
            >
              APELLIDO
            </label>
            <input
              id="apellido"
              type="text"
              placeholder="Garcia"
              autoComplete="family-name"
              {...register("apellido")}
              className="h-13 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-5 text-xl text-zinc-100 outline-none ring-blue-500 transition focus:ring-2"
            />
            {errors.apellido?.message ? (
              <p className="text-sm text-red-400">{errors.apellido.message}</p>
            ) : null}
          </div>
        </div>

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
          <label htmlFor="password" className="text-base font-semibold tracking-[0.14em] text-zinc-400">
            CONTRASENA
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimo 8 caracteres"
            {...register("password")}
            className="h-13 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-5 text-xl text-zinc-100 outline-none ring-blue-500 transition focus:ring-2"
          />
          {errors.password?.message ? (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-base font-semibold tracking-[0.14em] text-zinc-400"
          >
            CONFIRMAR CONTRASENA
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contrasena"
            {...register("confirmPassword")}
            className="h-13 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-5 text-xl text-zinc-100 outline-none ring-blue-500 transition focus:ring-2"
          />
          {errors.confirmPassword?.message ? (
            <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 h-13 w-full rounded-xl border border-zinc-700 text-xl font-semibold text-zinc-100 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="pt-1 text-center text-xl text-zinc-500">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Ingresa
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
