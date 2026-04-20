import crypto from 'crypto';

const COOKIE_NAME = 'nxm_session';

interface SessionPayload {
  u: string;  // username
  exp: number;  // unix ms expiration
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

function hmac(secret: string, data: string): string {
  return b64url(crypto.createHmac('sha256', secret).update(data).digest());
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('SESSION_SECRET missing or too short (must be ≥32 chars)');
  }
  return s;
}

function getTtlMs(): number {
  const hours = Number(process.env.SESSION_TTL_HOURS ?? '12');
  return hours * 60 * 60 * 1000;
}

export function signSession(username: string): string {
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + getTtlMs(),
  };
  const encoded = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = hmac(getSecret(), encoded);
  return `${encoded}.${sig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;

  const expected = hmac(getSecret(), encoded);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(encoded).toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload.u !== 'string' || typeof payload.exp !== 'number') return null;
  if (Date.now() > payload.exp) return null;

  return payload;
}

export function cookieOptions() {
  const secure = (process.env.COOKIE_SECURE ?? 'false').toLowerCase() === 'true';
  return {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: getTtlMs(),
  };
}

export { COOKIE_NAME };

import type { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { username: string };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const session = verifySession(token);
  if (!session) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  req.user = { username: session.u };
  next();
}
