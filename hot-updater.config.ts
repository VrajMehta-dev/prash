import {existsSync} from 'node:fs';
import {bare} from '@hot-updater/bare';
import {s3Storage} from '@hot-updater/aws';
import {standaloneRepository} from '@hot-updater/standalone';
import {defineConfig} from 'hot-updater';
import {apiKeys, insights} from 'hot-updater/plugins';

// UAT publish target. Secrets live in .env.hotupdater (gitignored).
if (existsSync('.env.hotupdater')) {
  process.loadEnvFile('.env.hotupdater');
}

const adminToken = process.env.HOT_UPDATER_ADMIN_TOKEN;
if (!adminToken) {
  throw new Error('HOT_UPDATER_ADMIN_TOKEN is required');
}

export default defineConfig({
  build: bare({enableHermes: true}),
  storage: s3Storage({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    bucketName: process.env.BUCKET_NAME!,
    basePath: 'mobile-ota/uat', // must match the server
  }),
  database: standaloneRepository({
    baseUrl: 'https://test-prash.aystera.com/ota/hot-updater/admin',
    commonHeaders: {Authorization: `Bearer ${adminToken}`},
  }),
  plugins: [insights(), apiKeys()],
  updateStrategy: 'appVersion',
});
