const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { cors, runMiddleware } = require('../../../middleware/cors');

const BUCKET = 'general';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const user = await authenticateToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  // id = URL-encoded file name (the path within the bucket)
  const { id } = req.query;
  const filePath = decodeURIComponent(id);

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
      if (error) throw error;
      return res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
      console.error('Gallery DELETE error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
