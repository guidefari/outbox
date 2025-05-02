import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

function createEnvConfig() {
  try {
    const config = envSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'));
      throw new Error(
        `❌ Invalid environment variables: ${missingVars.join(', ')}\n${error.message}`
      );
    }
    throw error;
  }
}

export const env = createEnvConfig();

export type Env = z.infer<typeof envSchema>;
