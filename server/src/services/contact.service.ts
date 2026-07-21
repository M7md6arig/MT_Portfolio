import { prisma } from "../config/prisma";
import { ContactInput } from "../validators/contact.validator";

export function createMessage(data: ContactInput) {
  return prisma.message.create({ data });
}
