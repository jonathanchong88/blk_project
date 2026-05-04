/**
 * Next.js Instrumentation hook (runs once on server startup).
 * Starts the keep-alive self-ping to prevent Render free-tier sleep.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on the server (Node.js runtime), not in the browser bundle.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startKeepAlive } = await import('./lib/keepAlive.js');

    // RENDER_EXTERNAL_URL is set automatically by Render for every service.
    // You can also set NEXT_PUBLIC_BACKEND_URL manually in your Render env vars.
    // startKeepAlive();
  }
}
