import fs from 'fs';
import path from 'path';

export interface CredentialsConfig {
  defaultPassword: string;
  consumer: { email: string; password: string };
  provider: { email: string; password: string };
  admin: { email: string; password: string };
  regulator: { email: string; password: string };
}

function loadCredentials(): CredentialsConfig {
  const rootPath = path.resolve(__dirname, '../../../credentials.json');
  const serverPath = path.resolve(__dirname, '../../credentials.json');
  const rootExamplePath = path.resolve(__dirname, '../../../credentials.example.json');
  const targetPath = fs.existsSync(rootPath)
    ? rootPath
    : fs.existsSync(serverPath)
    ? serverPath
    : fs.existsSync(rootExamplePath)
    ? rootExamplePath
    : null;

  if (targetPath) {
    try {
      const raw = fs.readFileSync(targetPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Credentials] Failed to parse credentials file, using environment defaults', e);
    }
  }

  return {
    defaultPassword: process.env.DEFAULT_SEED_PASSWORD || 'Password@123',
    consumer: {
      email: process.env.CONSUMER_EMAIL || 'vikram.consumer@gmail.com',
      password: process.env.CONSUMER_PASSWORD || process.env.DEFAULT_SEED_PASSWORD || 'Password@123',
    },
    provider: {
      email: process.env.PROVIDER_EMAIL || 'ramesh.plumber@sahakar.org',
      password: process.env.PROVIDER_PASSWORD || process.env.DEFAULT_SEED_PASSWORD || 'Password@123',
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin.delhi@sahakar.gov.in',
      password: process.env.ADMIN_PASSWORD || process.env.DEFAULT_SEED_PASSWORD || 'Password@123',
    },
    regulator: {
      email: process.env.REGULATOR_EMAIL || 'regulator@cooperation.gov.in',
      password: process.env.REGULATOR_PASSWORD || process.env.DEFAULT_SEED_PASSWORD || 'Password@123',
    },
  };
}

export const credentials = loadCredentials();
