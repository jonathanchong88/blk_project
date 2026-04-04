const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');
const { google } = require('googleapis');
const stream = require('stream');

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Increase limit for base64 images
        },
    },
};

const getDriveService = () => {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) return null;
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        return google.drive({ version: 'v3', auth });
    } catch(err) {
        console.error("Failed to init Drive Auth:", err);
        return null;
    }
};

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = await authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const drive = getDriveService();

    if (req.method === 'GET') {
        try {
            if (drive && process.env.GOOGLE_DRIVE_FOLDER_ID) {
                // Fetch from Google Drive
                const response = await drive.files.list({
                    q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
                    fields: 'files(id, name)',
                    pageSize: 100,
                    orderBy: 'createdTime desc'
                });
                const images = response.data.files.map(file => ({
                    name: file.name,
                    url: `https://drive.google.com/uc?export=view&id=${file.id}`
                }));
                return res.status(200).json(images);
            } else {
                // Fallback to Supabase Storage
                const { data, error } = await supabase.storage.from('uploads').list(`${user.id}`, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });
                if (error) throw error;

                const images = data.map(file => {
                    const filePath = `${user.id}/${file.name}`;
                    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
                    return { name: file.name, url: publicUrlData.publicUrl };
                });
                return res.status(200).json(images);
            }
        } catch (err) {
            console.error('List Images Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { image, filename, bucketName, folderPath } = req.body;
    if (!image || !filename) {
        return res.status(400).json({ message: 'Image and filename required' });
    }

    try {
        // Extract content type and base64 data
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
             return res.status(400).json({ message: 'Invalid image data' });
        }
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        const targetBucket = bucketName || 'uploads';
        const targetFolder = folderPath || user.id;
        
        const sanitizedFilename = filename.replace(/[^\x00-\x7F]/g, '_');
        
        if (drive && process.env.GOOGLE_DRIVE_FOLDER_ID) {
            // Upload to Google Drive
            const targetFolder = process.env.GOOGLE_DRIVE_FOLDER_ID;
            
            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);

            const fileMetadata = {
                name: `${Date.now()}_${sanitizedFilename}`,
                parents: [targetFolder]
            };
            const media = {
                mimeType: contentType,
                body: bufferStream
            };

            const uploadedFile = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id',
            });

            // Set file to be publicly readable
            await drive.permissions.create({
                fileId: uploadedFile.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const publicUrl = `https://drive.google.com/uc?export=view&id=${uploadedFile.data.id}`;
            return res.status(200).json({ url: publicUrl });
            
        } else {
            // Fallback to Supabase Storage
            const targetBucket = bucketName || 'uploads';
            const targetFolder = folderPath || user.id;
            const filePath = `${targetFolder}/${Date.now()}_${sanitizedFilename}`;

            const { data, error } = await supabase.storage.from(targetBucket).upload(filePath, buffer, {
                contentType,
                upsert: false
            });
            if (error) throw error;

            const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
            res.status(200).json({ url: publicUrlData.publicUrl });
        }
    } catch (err) {
        console.error('Upload API Error:', err);
        res.status(500).json({ error: err.message });
    }
}