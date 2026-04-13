const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { google } = require('googleapis');
const stream = require('stream');

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '25mb', // Support PDFs, images and documents
        },
    },
};

const getDriveService = () => {
    try {
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
            const auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );
            auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
            return google.drive({ version: 'v3', auth });
        } else
            if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
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

// Find a subfolder by name inside a parent folder, or create it if it doesn't exist
async function getOrCreateSubfolder(drive, parentFolderId, subfolderName) {
    // Sanitize folder name (Drive doesn't allow certain characters)
    const safeName = subfolderName.replace(/[\/\\:*?"<>|]/g, '_').trim() || 'Untitled';

    const checkRes = await drive.files.list({
        q: `'${parentFolderId}' in parents and name='${safeName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (checkRes.data.files.length > 0) {
        return checkRes.data.files[0].id;
    }

    const createRes = await drive.files.create({
        requestBody: {
            name: safeName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
        },
        fields: 'id',
    });
    return createRes.data.id;
}

export default async function handler(req, res) {

    const user = await authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const drive = getDriveService();

    if (req.method === 'GET') {
        try {
            if (!drive || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
                return res.status(500).json({ message: "Google Drive is not configured." });
            }

            // Fetch from Google Drive
            const response = await drive.files.list({
                q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
                fields: 'files(id, name)',
                pageSize: 100,
                orderBy: 'createdTime desc'
            });
            const images = response.data.files.map(file => ({
                name: file.name,
                url: `/api/image?id=${file.id}`
            }));
            return res.status(200).json(images);
        } catch (err) {
            console.error('List Images Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }


    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Accept both 'file' (new) and 'image' (legacy) field names
    const { filename, bucketName, folderPath } = req.body;
    const fileData = req.body.file || req.body.image;
    if (!fileData || !filename) {
        return res.status(400).json({ message: 'File data and filename required' });
    }

    try {
        // Extract content type and base64 data
        const matches = fileData.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid file data format' });
        }
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        const sanitizedFilename = filename.replace(/[^\x00-\x7F]/g, '_');

        if (!drive || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
            return res.status(500).json({ message: "Google Drive is not configured." });
        }

        let targetFolder = process.env.GOOGLE_DRIVE_HOME_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;

        // Route to specific folder based on the 'folder' field
        if (req.body.folder === 'profile') {
            if (!process.env.GOOGLE_DRIVE_PROFILE_FOLDER_ID) {
                return res.status(500).json({ message: "Google Drive Profile Folder is not configured." });
            }
            targetFolder = process.env.GOOGLE_DRIVE_PROFILE_FOLDER_ID;
        } else if (req.body.folder === 'song') {
            if (!process.env.GOOGLE_DRIVE_SONG_FOLDER_ID) {
                return res.status(500).json({ message: "Google Drive Song Folder is not configured." });
            }
            const songTitle = req.body.songTitle || 'Untitled';
            // Get or create a subfolder named after the song title
            targetFolder = await getOrCreateSubfolder(drive, process.env.GOOGLE_DRIVE_SONG_FOLDER_ID, songTitle);
        } else if (req.body.folder === 'news') {
            if (!process.env.GOOGLE_DRIVE_NEWS_FOLDER_ID) {
                return res.status(500).json({ message: "Google Drive News Folder is not configured." });
            }
            const newsTitle = req.body.newsTitle || 'Untitled';
            // Get or create a subfolder named after the news title
            targetFolder = await getOrCreateSubfolder(drive, process.env.GOOGLE_DRIVE_NEWS_FOLDER_ID, newsTitle);
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const fileMetadata = {
            name: `${Date.now()}_${sanitizedFilename}`,
            parents: [targetFolder]
        };
        const media = {
            mimeType: contentType,
            body: stream.Readable.from(buffer)
        };

        const uploadedFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
            supportsAllDrives: true,
            enforceSingleParent: true,
            ignoreDefaultVisibility: true
        });

        // Set file to be publicly readable
        await drive.permissions.create({
            fileId: uploadedFile.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        // Embed the MIME type in the URL so the frontend can detect it for previews
        const encodedType = encodeURIComponent(contentType);
        const driveId = uploadedFile.data.id;
        const isDocument = !contentType.startsWith('image/');
        const publicUrl = isDocument
            ? `/api/image?id=${driveId}&download=1&name=${encodeURIComponent(sanitizedFilename)}&type=${encodedType}`
            : `/api/image?id=${driveId}&type=${encodedType}`;

        // Return driveId so the frontend can delete from Drive if needed
        return res.status(200).json({
            driveId,
            url: publicUrl,
            name: sanitizedFilename,
            contentType,
            isDocument,
        });

    } catch (err) {
        console.error('Upload API Error:', err);
        res.status(500).json({ error: err.message });
    }
}