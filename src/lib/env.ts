const isProduction = process.env.NODE_ENV === "production";

export function getEnvVar(name: string): string {
  const prodName = `${name}_PROD`;

  if (isProduction) {
    return process.env[prodName] ?? process.env[name] ?? "";
  }

  return process.env[name] ?? process.env[prodName] ?? "";
}
