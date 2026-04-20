# Iniciación App

Sistema de onboarding para miembros de la comunidad de automatización/IA.

## Setup

### 1. Variables de entorno
El archivo `.env` en la raíz ya contiene la API key de Anthropic.

### 2. Instalar dependencias

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Levantar la app

**Frontend** (en una terminal):
```bash
cd client
npm run dev
# Corre en http://localhost:5173
```

**Backend** (en otra terminal):
```bash
cd server
npm run dev
# Corre en http://localhost:3001
```

## Webhooks N8N activos requeridos

| Webhook | URL | Propósito |
|---------|-----|-----------|
| Login | `https://n8n.nexumai.online/webhook/d836faa4-c15a-40b2-9b6d-8912ce35f1db` | Validación de usuario |
| Guardar Sheets | PLACEHOLDER (configurar en `client/src/lib/api.ts`) | Guardar diagnóstico en Google Sheets |
| Email | `https://n8n.nexumai.online/webhook/632b1583-1c44-4504-9a09-d8f95fcdfa32` | Envío de roadmap por mail |

## Arquitectura

```
Frontend (Vite :5173) → Backend Express (:3001) → Claude API
                       → Webhook Login (N8N)
                       → Webhook Guardar (N8N)
                       → Webhook Email (N8N)
```

## Configurar Webhook de Guardado en Sheets

1. Crear flujo en N8N:
   - Webhook POST recibe: `{ usuario, markdown_report, roadmap_json }`
   - Update Google Sheet: busca "Nombre de Usuario" = usuario → actualiza "Info Asociada" = markdown_report
   - Respond: `{ "res": "ok" }`
2. Reemplazar `PLACEHOLDER-GUARDAR-SHEETS` en `client/src/lib/api.ts` con la URL real

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + React Router v6
- **Backend**: Express.js + TypeScript + @anthropic-ai/sdk
- **Modelo IA**: claude-sonnet-4-20250514
