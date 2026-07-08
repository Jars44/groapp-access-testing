import { config } from 'dotenv';
import { execSync } from 'child_process';

config({ path: '.env.testing' });

export default async () => {
  const requiredEnvVars = [
    "VITE_API_URL",
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_FIREBASE_MEASUREMENT_ID",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: Environment variable ${envVar} is not set`);
    }
  }
};
