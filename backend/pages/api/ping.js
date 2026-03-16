/**
 * Health check / keep-alive endpoint.
 * Render (and UptimeRobot / cron-job.org) can ping GET /api/ping
 * every 10-14 minutes to prevent the free-tier service from sleeping.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
