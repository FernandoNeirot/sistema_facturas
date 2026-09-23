import { z } from "zod";
import { ClientSchema } from "./client.schema";

export const InvoiceStatusSchema = z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  status: InvoiceStatusSchema,
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().nullable(),
  clientId: z.string(),
  client: ClientSchema,
  items: z.array(InvoiceItemSchema),
  total: z.number(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const InvoiceItemFormSchema = z.object({
  description: z.string().min(1, "Descripción requerida"),
  quantity: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  unitPrice: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
});

export const CreateInvoiceFormSchema = z.object({
  clientId: z.string().min(1, "Elegí un cliente"),
  dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  notes: z.string().optional(),
  items: z.array(InvoiceItemFormSchema).min(1, "Agregá al menos un ítem"),
});

export type CreateInvoiceFormInput = z.input<typeof CreateInvoiceFormSchema>;
export type CreateInvoiceFormOutput = z.output<typeof CreateInvoiceFormSchema>;
