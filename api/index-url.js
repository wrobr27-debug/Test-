// api/index-url.js
// Vercel Serverless Function — Google Indexing API Notifier
// POST /api/index-url  { url: "https://developerbilaspur.in/news-detail.html?id=xyz", type: "URL_UPDATED" }
// GET  /api/index-url?url=https://...&type=URL_UPDATED

import crypto from 'crypto';

// ── Service Account credentials (hardcoded — server-only, never sent to browser) ──
const SERVICE_ACCOUNT = {
  client_email: 'developerbilaspur@neural-proton-330507.iam.gserviceaccount.com',
  // Private key stored in Vercel Environment Variable: GOOGLE_PRIVATE_KEY
  // Set it in: Vercel Dashboard → Project → Settings → Environment Variables
};

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const TOKEN_URL      = 'https://oauth2.googleapis.com/token';
const INDEXING_URL   = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

/**
 * Create a signed JWT for Google service account auth (RS256).
 * Uses Node's built-in `crypto` module — no external dependencies needed.
 */
function createJWT(privateKeyPem) {
  const now   = Math.floor(Date.now() / 1000);
  const header  = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss:   SERVICE_ACCOUNT.client_email,
    scope: INDEXING_SCOPE,
    aud:   TOKEN_URL,
    iat:   now,
    exp:   now + 3600,
  };

  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const signingInput = `${b64(header)}.${b64(payload)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  sign.end();

  const signature = sign.sign(privateKeyPem, 'base64url');
  return `${signingInput}.${signature}`;
}

/**
 * Exchange JWT for a short-lived OAuth2 access token.
 */
async function getAccessToken(privateKeyPem) {
  const jwt = createJWT(privateKeyPem);
  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Submit a URL notification to Google Indexing API.
 */
async function notifyGoogle(url, type, accessToken) {
  const res = await fetch(INDEXING_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ url, type }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Indexing API error: ${err}`);
  }

  return res.json();
}

// ── Vercel Edge Function handler ──
export default async function handler(req, res) {
  // CORS for local admin panel calls
  res.setHeader('Access-Control-Allow-Origin', 'https://developerbilaspur.in');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Parse URL + type from query or body
  let url, type;
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    url  = body?.url;
    type = body?.type || 'URL_UPDATED';
  } else {
    url  = req.query?.url;
    type = req.query?.type || 'URL_UPDATED';
  }

  if (!url) {
    return res.status(400).json({ error: 'Missing required parameter: url' });
  }

  if (!['URL_UPDATED', 'URL_DELETED'].includes(type)) {
    return res.status(400).json({ error: 'type must be URL_UPDATED or URL_DELETED' });
  }

  // Load private key from Vercel env (newlines escaped as \\n in the env var)
  const privateKeyPem = (process.env.GOOGLE_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n');

  if (!privateKeyPem) {
    return res.status(500).json({
      error: 'GOOGLE_PRIVATE_KEY environment variable is not set.',
      hint:  'Go to Vercel → Project → Settings → Environment Variables and add GOOGLE_PRIVATE_KEY',
    });
  }

  try {
    const accessToken = await getAccessToken(privateKeyPem);
    const result      = await notifyGoogle(url, type, accessToken);

    return res.status(200).json({
      success: true,
      url,
      type,
      googleResponse: result,
    });
  } catch (err) {
    console.error('[index-url]', err);
    return res.status(500).json({ error: err.message });
  }
}
