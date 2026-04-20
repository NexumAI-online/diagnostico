import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (dev local)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = buildApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API key loaded: ${process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO'}`);
  console.log(`Session secret loaded: ${process.env.SESSION_SECRET ? 'YES' : 'NO'}`);
  console.log(`Webhooks configured: login=${!!process.env.WEBHOOK_LOGIN_URL} email=${!!process.env.WEBHOOK_EMAIL_URL} save=${!!process.env.WEBHOOK_SAVE_URL}`);
});
