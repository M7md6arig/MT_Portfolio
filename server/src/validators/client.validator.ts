import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1).max(80),
  order: z.number().int().min(0).default(0),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
