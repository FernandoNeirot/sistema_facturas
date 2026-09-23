import { z } from "zod";

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  taxId: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.string(),
});

export type Client = z.infer<typeof ClientSchema>;

export const CreateClientFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
});

export type CreateClientFormValues = z.infer<typeof CreateClientFormSchema>;
