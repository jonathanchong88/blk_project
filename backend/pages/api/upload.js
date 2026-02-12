const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb', // Increase limit for base64 images
        },
    },
};

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
        try {
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
        } catch (err) {
            console.error('List Images Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { image, filename } = req.body;
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

        const filePath = `${user.id}/${Date.now()}_${filename}`;

        const { data, error } = await supabase.storage.from('uploads').upload(filePath, buffer, {
            contentType,
            upsert: false
        });
        if (error) {
            throw error;
        }

        const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
        res.status(200).json({ url: publicUrlData.publicUrl });
    } catch (err) {
        console.error('Upload API Error:', err);
        res.status(500).json({ error: err.message });
    }
}