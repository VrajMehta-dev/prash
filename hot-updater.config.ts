import {existsSync} from 'node:fs';
import {bare} from '@hot-updater/bare';
import {s3Storage} from '@hot-updater/aws';
import {standaloneRepository} from '@hot-updater/standalone';
import {defineConfig} from 'hot-updater';
import {apiKeys, insights} from 'hot-updater/plugins';

// Publish target: UAT by default, production with OTA_ENV=prod (scripts/ota-prod.sh). Secrets live in
// .env.hotupdater (UAT) / .env.hotupdater.prod (prod), both gitignored.
const prod = process.env.OTA_ENV === 'prod';
const envFile = prod ? '.env.hotupdater.prod' : '.env.hotupdater';
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
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
    basePath: prod ? 'mobile-ota/prod' : 'mobile-ota/uat', // must match the server
  }),
  database: standaloneRepository({
    baseUrl: prod
      ? 'https://prash.paruluniversity.ac.in/ota/hot-updater/admin'
      : 'https://test-prash.aystera.com/ota/hot-updater/admin',
    commonHeaders: {Authorization: `Bearer ${adminToken}`},
  }),
  plugins: [insights(), apiKeys()],
  updateStrategy: 'appVersion',
});
