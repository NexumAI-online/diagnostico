import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import generateRoadmapRouter from './routes/generate-roadmap.js';
import sendEmailRouter from './routes/send-email.js';
import saveSheetsRouter from './routes/save-sheets.js';

export function buildApp() {
  const app = express();

  app.set('trust proxy', 1);

  // CORS: solo whitelist explícita. En Vercel el frontend y la API viven en
  // la misma origin, así que CORS no se aplica al tráfico normal.
  const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([...devOrigins, ...extraOrigins]);
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // misma-origin / curl
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error('Origin not allowed'));
    },
    credentials: true,
  }));

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
