import { z } from 'zod';

export const verifySchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, { message: 'Verification code must be exactly 6 digits long' })
    .regex(/^\d{6}$/, { message: 'Code must contain only numbers' }),
});
