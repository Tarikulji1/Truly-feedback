import { z } from 'zod';

export const acceptMessageSchema = z.object({
    acceptMessage: z.boolean(),
}).refine(data => data.acceptMessage === true, {
  message: "Not allowed to toggle messages at this time",
  path: ["isAcceptingMessages"],
});