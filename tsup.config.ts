import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node22',
  outDir: 'dist',
  splitting: false,
  sourcemap: false,
  clean: true,
  bundle: true,
  external: [
    // Dependências que não devem ser bundladas
    'swagger-jsdoc',
    '@apidevtools/swagger-parser',
    '@jsdevtools/ono',
    'swagger-ui-express',
    // Prisma
    '@prisma/client',
    'prisma',
    // Outras dependências nativas
    'express',
    'socket.io',
    'bcryptjs',
    'jsonwebtoken',
    'multer',
    'multer-s3',
    'nodemailer',
    'cookie-parser',
    'cors',
    'helmet',
    'express-rate-limit',
    'express-async-errors',
  ],
  noExternal: [],
});

