"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/hooks/use-auth";
import { LoginFormSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { cardClass, inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";

export function LoginScreen() {
  const login = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
      <form onSubmit={handleSubmit(onSubmit)} className={`w-full max-w-sm space-y-4 p-6 ${cardClass}`}>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Facturas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ingresá tus credenciales para continuar.</p>
        </div>
        <div>
          <label className={labelClass}>Usuario</label>
          <input autoFocus className={inputClass} {...register("username")} />
          {errors.username && <ErrorText>{errors.username.message}</ErrorText>}
        </div>
        <div>
          <label className={labelClass}>Contraseña</label>
          <input type="password" className={inputClass} {...register("password")} />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
        </div>
        {login.isError && (
          <ErrorText>{login.error instanceof Error ? login.error.message : "Error desconocido"}</ErrorText>
        )}
        <Button type="submit" disabled={login.isPending} className="w-full px-3 py-2">
          {login.isPending ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
