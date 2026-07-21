import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import * as clientService from "../services/client.service";
import { createClientSchema, updateClientSchema } from "../validators/client.validator";

export const listClients = asyncHandler(async (_req: Request, res: Response) => {
  const clients = await clientService.listClients();
  res.json({ data: clients });
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const input = createClientSchema.parse(req.body);
  const client = await clientService.createClient(input);
  res.status(201).json({ data: client });
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const input = updateClientSchema.parse(req.body);
  const client = await clientService.updateClient(req.params.id, input);
  res.json({ data: client });
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  await clientService.deleteClient(req.params.id);
  res.status(204).send();
});

function makeImageUploadHandler(upload: (id: string, buffer: Buffer) => Promise<unknown>) {
  return asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new HttpError(400, 'Missing image file (multipart field "image")');
    }
    const client = await clientService.getClientById(req.params.id);
    if (!client) {
      throw new HttpError(404, "Client not found");
    }
    const updated = await upload(req.params.id, req.file.buffer);
    res.json({ data: updated });
  });
}

export const uploadClientLogo = makeImageUploadHandler(clientService.uploadClientLogo);
export const uploadClientBackground = makeImageUploadHandler(clientService.uploadClientBackground);
