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

    if (req.method === 'GET') {
        const { id, download, name } = req.query;
        if (!id) return res.status(400).send("File ID is required");

        const drive = getDriveService();
        if (!drive) return res.status(500).send("Google Drive not configured");

        try {
            // First get file metadata to get the real name and MIME type
            const meta = await drive.files.get({
                fileId: id,
                fields: 'name,mimeType'
            });
            const realName = name || meta.data.name || 'file';
            const realMime = meta.data.mimeType || 'application/octet-stream';

            // Stream the file binary from Google Drive
            const result = await drive.files.get(
                { fileId: id, alt: 'media' },
                { responseType: 'stream' }
            );

            const contentType = result.headers['content-type'] || realMime;
            res.setHeader('Content-Type', contentType);

            if (download === '1' || download === 'true') {
                // Force browser to download with the correct filename
                res.setHeader('Content-Disposition', `attachment; filename="${realName}"`);
            } else {
                // Allow images to render inline; cache aggressively
                res.setHeader('Content-Disposition', 'inline');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }

            return new Promise((resolve, reject) => {
                result.data
                    .on('end', () => resolve())
                    .on('error', err => {
                        console.error('Stream error:', err);
                        res.status(500).send("Error streaming file");
                        reject(err);
                    })
                    .pipe(res);
            });
        } catch(err) {
            console.error('File Fetch Error:', err.message);
            return res.status(404).json({ error: "File not found or access denied" });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
