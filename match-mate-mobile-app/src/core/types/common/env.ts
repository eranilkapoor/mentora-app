export const Envs = {
  DEV: 'development',
  STG: 'staging',
  PROD: 'production',
} as const;

export type Env = (typeof Envs)[keyof typeof Envs];
