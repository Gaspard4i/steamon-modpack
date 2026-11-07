import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  root,
  port: Number(process.env.PORT) || 3210,
  host: process.env.HOST || '127.0.0.1',
  password: process.env.TABLE_PASSWORD ?? '',
  dataDir: process.env.DATA_DIR || path.join(root, 'data'),
  distDir: path.join(root, 'client', 'dist'),
  allowedOrigin: process.env.ALLOWED_ORIGIN || '', // ex: https://loup.exemple.fr (vide = même origine)
  isProd: process.env.NODE_ENV === 'production',
};
