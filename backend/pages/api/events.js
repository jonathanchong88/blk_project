const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const webpush = require('web-push');

webpush.setVapidDetails(
    'mailto:demo@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {

    const user = await authenticateToken(req);

    if (req.method === 'GET') {
        try {
            // Fetch all events, ordered by date
            const { data, error } = await supabase
                .from('events')
                .select('*, event_likes(count)')
                .order('date', { ascending: true });

            if (error) throw error;
            
            const eventsWithCounts = data.map(event => ({
                ...event,
                likes_count: event.event_likes[0]?.count || 0
            }));
            res.json(eventsWithCounts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError || !['admin', 'editor', 'developer'].includes(userData.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        const { title, date, end_date, description, location, image_url } = req.body;
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and Date are required' });
        }

        try {
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    title,
                    date,
                    end_date: end_date || null,
                    description,
                    location,
                    image_url,
                    user_id: user.id
                }])
                .select();

            if (error) throw error;
            const newEvent = data[0];

            try {
                const { data: subscriptions } = await supabase
                    .from('push_subscriptions')
                    .select('*');

                if (subscriptions && subscriptions.length > 0) {
                    const payload = JSON.stringify({
                        title: `New Event: ${newEvent.title}`,
                        body: newEvent.description || 'A new event was just created.',
                        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?event=${newEvent.id}`
                    });

                    await Promise.all(subscriptions.map(sub => 
                        webpush.sendNotification(sub.subscription, payload).catch(err => {
                            if (err.statusCode === 410) {
                                supabase.from('push_subscriptions').delete().eq('id', sub.id).then();
                            }
                        })
                    ));
                }
            } catch (pushErr) {
                console.error("Failed to send push notifications", pushErr);
            }

            res.status(201).json(newEvent);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}