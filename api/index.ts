import type { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../server/app.js';

// Single Express instance reutilizada entre invocaciones (warm starts).
const app = buildApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}

// Vercel: extender maxDuration a 5 min (requiere Pro plan para que surta efecto).
// En Hobby el tope queda en 60s igualmente, sin romper — solo se corta antes.
export const config = {
  maxDuration: 300,
};
