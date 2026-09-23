"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClientsQuery } from "@/hooks/use-clients";
import { useCreateInvoiceMutation } from "@/hooks/use-invoices";
import {
  CreateInvoiceFormSchema,
  type CreateInvoiceFormInput,
  type CreateInvoiceFormOutput,
} from "@/schemas/invoice.schema";
import { cardClass, inputClass, itemInputClass, labelClass } from "@/lib/ui";
import { currency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";

const emptyItem = { description: "", quantity: 1, unitPrice: 0 };

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: clients } = useClientsQuery();
  const createInvoice = useCreateInvoiceMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateInvoiceFormInput, unknown, CreateInvoiceFormOutput>({
    resolver: zodResolver(CreateInvoiceFormSchema),
    defaultValues: { clientId: "", dueDate: "", notes: "", items: [emptyItem] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  useEffect(() => {
    if (clients && clients.length > 0 && !getValues("clientId")) {
      setValue("clientId", clients[0].id);
    }
  }, [clients, getValues, setValue]);

  const total = useMemo(
    () =>
      (items ?? []).reduce((sum, item) => {
        const qty = Number(item?.quantity) || 0;
        const price = Number(item?.unitPrice) || 0;
        return sum + qty * price;
      }, 0),
    [items],
  );

  function onSubmit(values: CreateInvoiceFormOutput) {
    createInvoice.mutate(
      {
        clientId: values.clientId,
        dueDate: values.dueDate,
        notes: values.notes || undefined,
        items: values.items,
      },
      {
        onSuccess: (invoice) => router.push(`/invoices/${invoice.id}`),
      },
    );
  }

  if (!clients) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando clientes...</p>;
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Primero necesitás crear un cliente en la sección{" "}
        <a href="/clients" className="underline">
          Clientes
        </a>
        .
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Nueva factura</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 p-6 ${cardClass}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Cliente *</label>
            <select className={inputClass} {...register("clientId")}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && <ErrorText>{errors.clientId.message}</ErrorText>}
          </div>
          <div>
            <label className={labelClass}>Fecha de vencimiento *</label>
            <input type="date" className={inputClass} {...register("dueDate")} />
            {errors.dueDate && <ErrorText>{errors.dueDate.message}</ErrorText>}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass}>Ítems</label>
            <button
              type="button"
              onClick={() => append(emptyItem)}
              className="text-sm text-gray-900 underline dark:text-gray-100"
            >
              + Agregar ítem
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => {
              const itemErrors = errors.items?.[index];
              return (
                <div key={field.id} className="space-y-1">
                  <div className="grid grid-cols-[1fr_80px_100px_28px] items-center gap-2">
                    <input
                      placeholder="Descripción"
                      className={itemInputClass}
                      {...register(`items.${index}.description`)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Cant."
                      className={itemInputClass}
                      {...register(`items.${index}.quantity`)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Precio"
                      className={itemInputClass}
                      {...register(`items.${index}.unitPrice`)}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-30 dark:text-gray-500 dark:hover:text-red-400"
                      aria-label="Quitar ítem"
                    >
                      ✕
                    </button>
                  </div>
                  {(itemErrors?.description || itemErrors?.quantity || itemErrors?.unitPrice) && (
                    <ErrorText>
                      {itemErrors?.description?.message ??
                        itemErrors?.quantity?.message ??
                        itemErrors?.unitPrice?.message}
                    </ErrorText>
                  )}
                </div>
              );
            })}
          </div>
          {errors.items?.message && <ErrorText>{errors.items.message}</ErrorText>}
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea className={inputClass} rows={3} {...register("notes")} />
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="text-lg font-semibold">Total: {currency.format(total)}</p>
          <Button type="submit" disabled={createInvoice.isPending} className="px-4 py-2">
            {createInvoice.isPending ? "Creando..." : "Crear factura"}
          </Button>
        </div>
      </form>
    </div>
  );
}
