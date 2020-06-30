import dotenv from 'dotenv';

function findDotEnvPath(): string[] {
  return process.env['DOTENV_PATH']
    ? process.env['DOTENV_PATH'].split(',')
    : ['.env'];
}

export function configureEnv() {
  const dotEnvPath = findDotEnvPath();
  for (const p of dotEnvPath) {
    dotenv.config({ path: p });
  }
}

export default configureEnv;
