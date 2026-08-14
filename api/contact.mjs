// api/contact.mjs
// Vercel Serverless Function (Node runtime) — not a Next.js Route Handler,
// this is a Vite SPA. Deployed automatically at /api/contact because it
// lives under the top-level api/ directory. See
// docs/engineering/CONTACT_FORM_ARCHITECTURE.md for the full decision.
//
// .mjs (not .js) deliberately: eslint.config.js only lints **/*.{js,jsx}
// with browser globals, so a Node file here would fail on `process`/req/res
// — the same reason scripts/prerender-meta.mjs is .mjs. This file inherits
// that existing exemption instead of needing an ESLint override.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Solarisx Contact <onboarding@resend.dev>";

const MIN_FILL_MS = 3000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const LIMITS = {
  name: 100,
  email: 254,
  messageMin: 10,
  messageMax: 2000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort only — resets on cold start/redeploy and isn't shared across
// concurrent instances. See CONTACT_FORM_ARCHITECTURE.md §4 for why that
// tradeoff is acceptable here rather than adding a KV/Redis dependency.
const submissions = new Map();

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (submissions.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  hits.push(now);
  submissions.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function validate(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const errors = {};
  if (!name) errors.name = "Name is required.";
  else if (name.length > LIMITS.name) errors.name = "Name is too long.";

  if (!email) errors.email = "Email is required.";
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!message) errors.message = "Message is required.";
  else if (message.length < LIMITS.messageMin) {
    errors.message = `Message should be at least ${LIMITS.messageMin} characters.`;
  } else if (message.length > LIMITS.messageMax) {
    errors.message = "Message is too long.";
  }

  return { name, email, message, errors };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, error: "Too many requests. Please try again later." });
  }

  const body = req.body ?? {};

  // Honeypot: real visitors never populate this field. Bots that do get a
  // silent success — no signal that anything was filtered.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  // Minimum fill time: elapsedMs is client-measured (Date.now() at submit
  // minus Date.now() at mount), not an absolute timestamp — comparing a
  // client clock to the server's would silently drop genuine submissions
  // whenever the visitor's clock runs fast. Missing/invalid is treated as
  // suspicious rather than skipped, since a legitimate client always sends
  // a valid number.
  const elapsedMs = Number(body.elapsedMs);
  if (!Number.isFinite(elapsedMs) || elapsedMs < MIN_FILL_MS) {
    return res.status(200).json({ ok: true });
  }

  const { name, email, message, errors } = validate(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    console.error("contact: missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return res.status(500).json({
      ok: false,
      error: "Message could not be sent right now. Please try again later.",
    });
  }

  try {
    const resendRes = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: [toEmail],
        reply_to: email,
        subject: `New message from ${name} — Solarisx`,
        text: `${message}\n\n— ${name} (${email})`,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => "");
      console.error("contact: resend error", resendRes.status, detail);
      return res.status(502).json({
        ok: false,
        error: "Message could not be sent right now. Please try again later.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact: unexpected error", err);
    return res.status(500).json({
      ok: false,
      error: "Something went wrong. Please try again later.",
    });
  }
}
