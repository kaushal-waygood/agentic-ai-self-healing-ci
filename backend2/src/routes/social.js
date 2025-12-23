// routes/social.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { earnCreditsForAction } from '../utils/credits.js'; // adjust path
import { User } from '../models/User.model.js';

const router = express.Router();

// Simple rate limiter to prevent auto-claim abuse: 10 requests / minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Allowed follow actions (whitelist)
const ALLOWED_FOLLOW_ACTIONS = new Set([
  'FOLLOW_LINKEDIN',
  'FOLLOW_INSTAGRAM',
  'FOLLOW_FACEBOOK',
  'FOLLOW_YOUTUBE',
  'FOLLOW_TIKTOK',
]);

/**
 * GET /api/v1/social/redirect
 *
 * Query params:
 *  - action: one of FOLLOW_LINKEDIN/FOLLOW_INSTAGRAM/...
 *  - url: the social profile URL to open (encoded)
 *  - platform: optional friendly name
 *
 * Behavior:
 *  - requires auth (req.user)
 *  - returns an HTML interstitial that opens the social url in a new tab and after 10s
 *    calls POST /api/v1/social/claim to auto-claim the reward.
 */
router.get('/redirect', limiter, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send('Unauthorized');

    const { action, url: socialUrl, platform } = req.query;
    if (!action || !socialUrl) {
      return res.status(400).send('Missing action or url');
    }
    if (!ALLOWED_FOLLOW_ACTIONS.has(action)) {
      return res.status(400).send('Invalid action');
    }

    // Build the claim payload the interstitial will POST to
    const claimEndpoint = '/api/v1/social/claim';

    // Escape for inclusion in HTML
    const escapedUrl = String(socialUrl).replace(/"/g, '&quot;');
    const escapedAction = String(action).replace(/"/g, '&quot;');
    const escapedPlatform = platform
      ? String(platform).replace(/"/g, '&quot;')
      : '';

    // Render minimal HTML that opens social link in a new tab and calls claim after 10s
    // It uses fetch with credentials so session cookie (or whatever) is used.
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta name="robots" content="noindex,nofollow" />
    <style>
      body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f8fafc; color:#0f172a; }
      .card { background:white; padding:24px; border-radius:12px; box-shadow:0 6px 24px rgba(15,23,42,0.06); max-width:520px; text-align:center; }
      a.button { display:inline-block; margin-top:12px; padding:10px 14px; border-radius:8px; background:linear-gradient(90deg,#2563eb,#7c3aed); color:#fff; text-decoration:none; }
      .muted { color:#64748b; font-size:13px; margin-top:8px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Opening ${
        escapedPlatform || escapedAction.replace('FOLLOW_', '')
      }</h2>
      <p class="muted">A new tab will open to the social page. After 10 seconds we'll automatically grant your reward.</p>
      <div id="status" class="muted">Opening...</div>
      <a class="button" id="openNow" href="${escapedUrl}" target="_blank" rel="noopener noreferrer">Open Now</a>
      <div class="muted" style="margin-top:12px; font-size:12px;">If nothing happens, click the button above.</div>
    </div>

    <script>
      (function(){
        const socialUrl = "${escapedUrl}";
        const action = "${escapedAction}";
        const claimEndpoint = "${claimEndpoint}";
        const status = document.getElementById('status');

        // open in new tab
        try {
          const win = window.open(socialUrl, '_blank', 'noopener,noreferrer');
          if (win) {
            win.focus();
            status.textContent = 'Opened social page in new tab. Claiming reward in 10s...';
          } else {
            status.textContent = 'Pop-up blocked — please click \"Open Now\". Claiming in 10s if you open the page.';
          }
        } catch (e) {
          status.textContent = 'Could not open new tab — please click "Open Now".';
        }

        // Wait 10 seconds then call claim API
        const WAIT_MS = 10000;
        setTimeout(async () => {
          status.textContent = 'Attempting to claim reward...';
          try {
            const resp = await fetch(claimEndpoint, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action, meta: { platform: "${escapedPlatform}" } })
            });
            const json = await resp.json();
            if (!resp.ok) {
              status.textContent = 'Claim failed: ' + (json?.message || resp.statusText);
              return;
            }
            status.textContent = 'Success! ' + (json?.message || 'Reward claimed.');
            // Optionally redirect back to app dashboard after a short delay
            setTimeout(() => {
              try { window.location.href = '/dashboard/rewards'; } catch(e) {}
            }, 1500);
          } catch (err) {
            status.textContent = 'Network error while claiming: ' + (err && err.message ? err.message : String(err));
          }
        }, WAIT_MS);
      })();
    </script>
  </body>
</html>`);
  } catch (err) {
    console.error('social redirect error', err);
    res.status(500).send('Server error');
  }
});

/**
 * POST /api/v1/social/claim
 *
 * Body: { action: 'FOLLOW_LINKEDIN', meta: { platform: 'LinkedIn' } }
 * Requires auth: req.user
 * This route calls your existing earnCreditsForAction and returns success/failure JSON.
 */
router.post('/claim', limiter, async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { action, meta = {} } = req.body || {};
    if (!action || !ALLOWED_FOLLOW_ACTIONS.has(action)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or missing action' });
    }

    // Optional: simple server-side cooldown to avoid repeated rapid claims per user+action (e.g., 1 per 24h)
    // You can customize per-action rules; here we allow one follow claim per platform per day as example.
    const userDoc = await User.findById(user._id).lean();
    const recentSame = (userDoc.creditTransactions || []).find((t) => {
      return (
        t.kind === action &&
        Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000
      );
    });
    if (recentSame) {
      return res
        .status(409)
        .json({ success: false, message: 'Already claimed recently' });
    }

    // Call your existing earn function (make sure import path is correct)
    const result = await earnCreditsForAction(user._id, action, meta);

    // Optionally include redirectUrl so client can navigate somewhere useful after claim
    const redirectUrl =
      (result.tx && result.tx.meta && result.tx.meta.redirectUrl) || null;

    return res.json({
      success: true,
      message: `Claimed ${result.tx.amount} credits`,
      tx: result.tx,
      balance: result.balance,
      redirectUrl,
    });
  } catch (err) {
    console.error('social claim error', err);
    const status = err && err.status ? err.status : 500;
    return res
      .status(status)
      .json({ success: false, message: err.message || 'Server error' });
  }
});

export default router;
