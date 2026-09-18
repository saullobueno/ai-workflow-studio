import { z } from 'zod'

export const authSessionSchema = z.object({
  email: z.string(),
})
export type AuthSession = z.infer<typeof authSessionSchema>
