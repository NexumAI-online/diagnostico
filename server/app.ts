import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import generateRoadmapRouter from './routes/generate-roadmap.js';
import sendEmailRouter from './routes/send-email.js';
import saveSheetsRouter from './routes/save-sheets.js';

export function buildApp() {
  const app = express();

  app.set('trust proxy', 1);

  // CORS: acepta same-origin (Vercel) + whitelist de dev + extras por env.
  const devOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
  const extraOrigins = new Set(
    (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (!origin) return next(); // curl / same-origin sin header

    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.headers.host;
    const sameOrigin = host && origin === `${proto}://${host}`;

    const allowed = sameOrigin || devOrigins.has(origin) || extraOrigins.has(origin);
    if (!allowed) return res.status(403).json({ error: 'Origin not allowed' });

    // Headers CORS manuales (más seguros que confiar en el paquete cors con whitelist dinámica)
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }
    next();
  });

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));

  // Timeout por ruta. generate-roadmap puede tomar varios minutos.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/generate-roadmap')) {
      req.setTimeout(10 * 60 * 1000);
      res.setTimeout(10 * 60 * 1000);
    } else {
      res.setTimeout(60 * 1000);
    }
    next();
  });

  app.use('/api', authRouter);
  app.use('/api/generate-roadmap', generateRoadmapRouter);
  app.use('/api/send-email', sendEmailRouter);
  app.use('/api/save-sheets', saveSheetsRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
