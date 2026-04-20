import { Router } from 'express';
import { requireAuth } from '../lib/session.js';

const router = Router();

const QUESTION_LABELS: Record<string, string> = {
  respuesta_a_pregunta_1: 'Rango de edad',
  respuesta_a_pregunta_2: 'País',
  respuesta_a_pregunta_3: 'Situación laboral',
  respuesta_a_pregunta_4: 'Qué quiere lograr en los próximos meses',
  respuesta_a_pregunta_5: 'Su meta única resumida',
  respuesta_a_pregunta_6: 'Qué le entusiasma más del modelo',
  respuesta_a_pregunta_7: 'Nivel en automatizaciones (n8n, Make, Zapier)',
  respuesta_a_pregunta_8: 'Nivel en IA (prompts, agentes, tools)',
  respuesta_a_pregunta_9: 'Nivel en Ventas',
  respuesta_a_pregunta_10: 'Experiencia con clientes',
  respuesta_a_pregunta_11: 'Herramientas que ya usó',
  respuesta_a_pregunta_12: 'Tipo de cliente que le gustaría ayudar primero',
  respuesta_a_pregunta_13: 'Problemas que le gustaría resolver',
  respuesta_a_pregunta_14: 'Qué le frena o da miedo hoy',
  respuesta_a_pregunta_15: 'Qué lo hizo decidir empezar ahora',
  respuesta_a_pregunta_16: 'Comodidad para grabar contenido',
  respuesta_a_pregunta_17: 'Compromiso mínimo diario',
};

function formatAnswersAsMarkdown(answers: Record<string, string | string[]>): string {
  const lines = ['# Respuestas del Cuestionario', ''];
  for (const [key, label] of Object.entries(QUESTION_LABELS)) {
    const val = answers[key];
    if (!val) continue;
    const display = Array.isArray(val) ? val.join(', ') : val;
    lines.push(`**${label}:** ${display}`);
    lines.push('');
  }
  return lines.join('\n');
}

router.post('/', requireAuth, async (req, res) => {
  const username = req.user!.username;
  const { answers, markdown_report, roadmap_json } = req.body ?? {};

  if (!answers || typeof markdown_report !== 'string') {
    res.status(400).json({ error: 'Payload inválido' });
    return;
  }

  const url = process.env.WEBHOOK_SAVE_URL;
  if (!url) {
    res.status(500).json({ error: 'Configuración faltante' });
    return;
  }

  const respuestasMarkdown = formatAnswersAsMarkdown(answers);
  const emailContent = `${respuestasMarkdown}\n\n---\n\n${markdown_report}`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: username,
        respuestas: answers,
        respuestas_markdown: respuestasMarkdown,
        markdown_report,
        email_content: emailContent,
        roadmap_json,
      }),
    });
    if (!r.ok) throw new Error('Save webhook failed');
    res.json({ ok: true });
  } catch {
    res.status(502).json({ error: 'No se pudo guardar' });
  }
});

export default router;
