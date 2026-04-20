import { Router } from 'express';
import { requireAuth } from '../lib/session.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const username = req.user!.username;
  const { mail } = req.body ?? {};

  if (typeof mail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    res.status(400).json({ res: 'Mail inválido' });
    return;
  }

  const url = process.env.WEBHOOK_EMAIL_URL;
  if (!url) {
    res.status(500).json({ res: 'Configuración faltante' });
    return;
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30000);
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: username, mail }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!r.ok) throw new Error('Webhook email failed');
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(502).json({ res: 'Error de conexión. Intentá de nuevo.' });
  }
});

export default router;
