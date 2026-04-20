import type { LoginResponse, EmailResponse, RoadmapData } from '../types';

const BACKEND_URL = '/api';

// Todas las llamadas incluyen credentials: 'include' para enviar la cookie de sesión
const withCreds = (init: RequestInit = {}): RequestInit => ({
  ...init,
  credentials: 'include',
});

export async function loginUser(usuario: string, contrasena: string): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BACKEND_URL}/login`, withCreds({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena }),
      signal: controller.signal,
    }));
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok && typeof data?.respuesta !== 'string') {
      throw new Error('Network error');
    }
    return data as LoginResponse;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await fetch(`${BACKEND_URL}/logout`, withCreds({ method: 'POST' })).catch(() => {});
}

export async function fetchMe(): Promise<{ authenticated: boolean; usuario?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/me`, withCreds());
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}

export async function generateRoadmap(
  _usuario: string,
  answers: Record<string, string | string[]>
): Promise<RoadmapData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 min

  try {
    const res = await fetch(`${BACKEND_URL}/generate-roadmap`, withCreds({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
      signal: controller.signal,
    }));
    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('UNAUTHORIZED');
      throw new Error(errorData.error || 'Backend error');
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function saveToSheets(
  _usuario: string,
  answers: Record<string, string | string[]>,
  markdownReport: string,
  roadmapJson: string
): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/save-sheets`, withCreds({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        markdown_report: markdownReport,
        roadmap_json: roadmapJson,
      }),
    }));
    if (!res.ok) throw new Error('Save failed');
  } catch (err) {
    console.error('Error saving to sheets (non-blocking):', err);
    throw err;
  }
}

export async function sendEmail(_usuario: string, mail: string): Promise<EmailResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${BACKEND_URL}/send-email`, withCreds({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail }),
      signal: controller.signal,
    }));
    clearTimeout(timeout);

    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      return data as EmailResponse;
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}
