"use client";

import { useActionState } from "react";
import {
  initialLandingFormState,
  submitLandingForm,
  type LandingFormState,
} from "@/actions/landing";

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState<LandingFormState, FormData>(
    submitLandingForm,
    initialLandingFormState,
  );

  return (
    <>
      <form className="cta-form" action={formAction}>
        <input name="nombre" type="text" placeholder="Tu nombre completo" required />
        <input name="email" type="email" placeholder="Tu email" required />
        <input name="telefono" type="tel" placeholder="Tu teléfono (opcional)" />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Enviando..." : "Quiero acceso anticipado →"}
        </button>
      </form>

      {state.message ? (
        <p className={`form-feedback ${state.success ? "success" : "error"}`}>{state.message}</p>
      ) : null}
    </>
  );
}
