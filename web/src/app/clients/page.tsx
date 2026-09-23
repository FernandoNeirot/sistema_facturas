"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClientsQuery, useCreateClientMutation, useDeleteClientMutation } from "@/hooks/use-clients";
import { CreateClientFormSchema, type CreateClientFormValues } from "@/schemas/client.schema";
import { cardClass, inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";

export default function ClientsPage() {
  const { data: clients, isLoading } = useClientsQuery();
  const createClient = useCreateClientMutation();
  const deleteClient = useDeleteClientMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(CreateClientFormSchema),
    defaultValues: { name: "", email: "", taxId: "", address: "" },
  });

  function onSubmit(values: CreateClientFormValues) {
    createClient.mutate(
      {
        name: values.name,
        email: values.email || null,
        taxId: values.taxId || null,
        address: values.address || null,
      },
      { onSuccess: () => reset() },
    );
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    deleteClient.mutate(id);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Nuevo cliente</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 p-6 ${cardClass}`}>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input className={inputClass} {...register("name")} />
            {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} {...register("email")} />
          </div>
          <div>
            <label className={labelClass}>CUIT / Tax ID</label>
            <input className={inputClass} {...register("taxId")} />
          </div>
          <div>
            <label className={labelClass}>Dirección</label>
            <input className={inputClass} {...register("address")} />
          </div>
          <Button type="submit" disabled={createClient.isPending} className="w-full px-3 py-2">
            {createClient.isPending ? "Guardando..." : "Crear cliente"}
          </Button>
        </form>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold">Clientes</h1>
        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>}
        {clients && clients.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay clientes cargados.</p>
        )}
        {clients && clients.length > 0 && (
          <ul className={`divide-y divide-gray-100 dark:divide-gray-800 ${cardClass}`}>
            {clients.map((client) => (
              <li key={client.id} className="flex items-start justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {[client.email, client.taxId, client.address].filter(Boolean).join(" · ") || "Sin datos adicionales"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
