import { z } from 'zod';

export const messageSchema = z.object({
    content: z
    .string()
    .min(10, { message: 'Message content must be at least 10 character long' })
    .max(300, { message: 'Message content must be at most 300 characters long' }),
})