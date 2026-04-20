import { Router } from 'express';
import { signSession, verifySession, cookieOptions, COOKIE_NAME, requireAuth } from '../lib/session.js';

const router = Router();

// Rate limit básico en memoria: bloquea por IP tras N intentos fallidos
const attempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 8;
const BLOCK_MS = 15 * 60 * 1000;

function keyFor(req: any): string {
  return req.ip || req.headers['x-forwarded-for'] || 'unknown';
}

function isBlocked(k: string): boolean {
  const entry = attempts.get(k);
  if (!entry) return false;
  if (entry.blockedUntil > Date.now()) return true;
  if (entry.blockedUntil && entry.blockedUntil <= Date.now()) attempts.delete(k);
  return false;
}

function registerFail(k: string) {
  const e = attempts.get(k) ?? { count: 0, blockedUntil: 0 };
  e.count += 1;
  if (e.count >= MAX_ATTEMPTS) e.blockedUntil = Date.now() + BLOCK_MS;
  attempts.set(k, e);
}

function registerOk(k: string) {
  attempts.delete(k);
}

router.post('/login', async (req, res) => {
  const k = keyFor(req);
  if (isBlocked(k)) {
    res.status(429).json({ respuesta: 'Demasiados intentos, probá en unos minutos.' });
    return;
  }

  const { usuario, contrasena } = req.body ?? {};
  if (typeof usuario !== 'string' || typeof contrasena !== 'string' || !usuario || !contrasena) {
    res.status(400).json({ respuesta: 'Faltan credenciales.' });
    return;
  }

  const url = process.env.WEBHOOK_LOGIN_URL;
  if (!url) {
    res.status(500).json({ respuesta: 'Configuración faltante.' });
    return;
  }

  let webhookRes;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    webhookRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena }),
      signal: controller.signal,
    });
    clearTimeout(t);
  } catch {
    res.status(502).json({ respuesta: 'Error de conexión. Reintentá.' });
    return;
  }

  if (!webhookRes.ok) {
    res.status(502).json({ respuesta: 'Error de validación. Reintentá.' });
    return;
  }

  let data: any;
  try {
    data = await webhookRes.json();
  } catch {
    res.status(502).json({ respuesta: 'Respuesta inválida del servicio.' });
    return;
  }

  const respuesta: string = data?.respuesta ?? '';

  if (respuesta === 'Acceso exitoso') {
    const token = signSession(usuario);
    res.cookie(COOKIE_NAME, token, cookieOptions());
    registerOk(k);
    res.json({ respuesta });
    return;
  }

  registerFail(k);
  // Pass-through de las otras respuestas del webhook
  res.status(401).json({ respuesta: respuesta || 'No autorizado' });
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  const session = verifySession(token);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, usuario: session.u });
});

export default router;
export { requireAuth };
