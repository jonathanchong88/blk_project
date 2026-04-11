const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { google } = require('googleapis');
const stream = require('stream');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const BUCKET = 'general';
const PAGE_SIZE = 12;

const getDriveService = () => {
  try {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      return google.drive({ version: 'v3', auth });
    } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      return google.drive({ version: 'v3', auth });
    }
    return null;
  } catch (err) {
    console.error("Failed to init Drive Auth:", err);
    return null;
  }
};

export default async function handler(req, res) {

  // ──────────────────────────────────────────────
  // GET /api/gallery  – list images with pagination & sort
  // ──────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || PAGE_SIZE);
      const sortOrder = req.query.sort === 'asc' ? 'asc' : 'desc';

      const drive = getDriveService();

      if (!drive || !process.env.GOOGLE_DRIVE_HOME_FOLDER_ID) {
        return res.status(500).json({ message: "Google Drive is not configured." });
      }

      const response = await drive.files.list({
        q: `'${process.env.GOOGLE_DRIVE_HOME_FOLDER_ID}' in parents and trashed = false`,
        fields: 'files(id, name, createdTime, size)',
        pageSize: 1000,
        orderBy: sortOrder === 'desc' ? 'createdTime desc' : 'createdTime asc'
      });

      const imageFiles = (response.data.files || []).filter(f =>
        f.name && /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(f.name)
      );

      const total = imageFiles.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;
      const pageFiles = imageFiles.slice(offset, offset + limit);

      const images = pageFiles.map(file => ({
        id: file.id,
        name: file.name,
        url: `/api/image?id=${file.id}`,
        createdAt: file.createdTime || null,
        size: file.size || null,
      }));

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
    const user = await authenticateToken(req);
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

      const drive = getDriveService();
      if (!drive || !process.env.GOOGLE_DRIVE_HOME_FOLDER_ID) {
        return res.status(500).json({ message: "Google Drive is not configured." });
      }

      const targetFolder = process.env.GOOGLE_DRIVE_HOME_FOLDER_ID;
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      const fileMetadata = { name: filePath, parents: [targetFolder] };
      const media = { mimeType: contentType, body: bufferStream };

      const uploadedFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, createdTime',
      });

      await drive.permissions.create({
        fileId: uploadedFile.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      return res.status(200).json({
        name: uploadedFile.data.id, // Store Drive ID as the 'name' so Delete works
        url: `/api/image?id=${uploadedFile.data.id}`,
        createdAt: uploadedFile.data.createdTime || new Date().toISOString(),
      });

    } catch (err) {
      console.error('Gallery POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
