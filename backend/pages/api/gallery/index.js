const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { cors, runMiddleware } = require('../../../middleware/cors');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const BUCKET = 'general';
const PAGE_SIZE = 12;

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  // ──────────────────────────────────────────────
  // GET /api/gallery  – list images with pagination & sort
  // ──────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || PAGE_SIZE);
      const sortOrder = req.query.sort === 'asc' ? 'asc' : 'desc';

      // Supabase Storage list() doesn't support server-side pagination,
      // so we fetch all files and paginate in-process.
      const { data, error } = await supabase.storage.from(BUCKET).list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: sortOrder },
      });

      if (error) throw error;

      // Filter to image files only (skip .emptyFolderPlaceholder etc.)
      const imageFiles = (data || []).filter(f =>
        f.name && /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(f.name)
      );

      const total = imageFiles.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;
      const pageFiles = imageFiles.slice(offset, offset + limit);

      const images = pageFiles.map(file => {
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(file.name);
        return {
          id: file.id || file.name,
          name: file.name,
          url: urlData.publicUrl,
          createdAt: file.created_at || null,
          size: file.metadata?.size || null,
        };
      });

      return res.status(200).json({ images, total, page, totalPages });
    } catch (err) {
      console.error('Gallery GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ──────────────────────────────────────────────
  // POST /api/gallery  – upload a new image (auth required)
  // ──────────────────────────────────────────────
  if (req.method === 'POST') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { image, filename } = req.body;
    if (!image || !filename) {
      return res.status(400).json({ message: 'image and filename are required' });
    }

    try {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ message: 'Invalid image data' });
      }
      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      // Sanitize and build path: flat in 'general' bucket root
      const safe = filename.replace(/[^\x00-\x7F]/g, '_').replace(/\s+/g, '_');
      const filePath = `${Date.now()}_${safe}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType, upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      return res.status(200).json({
        name: filePath,
        url: urlData.publicUrl,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Gallery POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
