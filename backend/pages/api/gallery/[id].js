const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { google } = require('googleapis');

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
    } catch(err) {
        console.error("Failed to init Drive Auth:", err);
        return null;
    }
};

export default async function handler(req, res) {

  const user = await authenticateToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  // id = URL-encoded file name (the path within the bucket)
  const { id } = req.query;
  const filePath = decodeURIComponent(id);

  if (req.method === 'DELETE') {
    try {
      const drive = getDriveService();
      if (!drive || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
          return res.status(500).json({ message: "Google Drive is not configured." });
      }
      
      // In Google Drive mode, filePath is actually the Drive fileId
      await drive.files.delete({ fileId: filePath });
      return res.status(200).json({ message: 'Deleted successfully from Google Drive' });
      
    } catch (err) {
      console.error('Gallery DELETE error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
