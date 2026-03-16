/**
 * keepAlive.js
 * Pings this service's own /api/ping endpoint every 14 minutes so that
 * Render's free-tier instance never goes to sleep.
 *
 * Usage – call startKeepAlive() once during app initialisation,
 * e.g. in pages/_app.js (server side) or a Next.js instrumentation hook.
 */

const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

let timer = null;

/**
 * @param {string} baseUrl  Full origin of the deployed service,
 *                          e.g. "https://my-app.onrender.com"
 *                          Falls back to NEXT_PUBLIC_BACKEND_URL or
 *                          RENDER_EXTERNAL_URL env vars automatically.
 */
function startKeepAlive(baseUrl) {
  const url =
    baseUrl ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!url) {
    console.warn(
      '[keep-alive] No base URL provided and no RENDER_EXTERNAL_URL / ' +
        'NEXT_PUBLIC_BACKEND_URL env var set. Keep-alive disabled.'
    );
    return;
  }

  if (timer) {
    console.log('[keep-alive] Already running – skipping duplicate start.');
    return;
  }

  const pingUrl = `${url.replace(/\/$/, '')}/api/ping`;
  console.log(`[keep-alive] Started. Will ping ${pingUrl} every 14 minutes.`);

  const ping = async () => {
    try {
      const res = await fetch(pingUrl);
      console.log(
        `[keep-alive] Ping → ${pingUrl} | status: ${res.status} | ${new Date().toISOString()}`
      );
    } catch (err) {
      console.error(`[keep-alive] Ping failed: ${err.message}`);
    }
  };

  // Fire immediately, then on every interval
  ping();
  timer = setInterval(ping, INTERVAL_MS);
}

function stopKeepAlive() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[keep-alive] Stopped.');
  }
}

module.exports = { startKeepAlive, stopKeepAlive };
