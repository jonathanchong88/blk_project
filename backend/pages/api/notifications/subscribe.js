const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { cors, runMiddleware } = require('../../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = await authenticateToken(req);

    if (req.method === 'POST') {
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ message: 'Invalid subscription object' });
        }

        try {
            const { data: existingSubs } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', user.id);

            const isDuplicate = existingSubs?.some(sub => sub.subscription?.endpoint === subscription.endpoint);
            if (isDuplicate) {
                return res.status(200).json({ message: 'Subscription already exists' });
            }

            const { data, error } = await supabase
                .from('push_subscriptions')
                .insert([{
                    user_id: user.id,
                    subscription: subscription
                }])
                .select();

            if (error) throw error;
            res.status(201).json({ message: 'Subscription saved successfully', data: data[0] });
        } catch (err) {
            console.error("Push Subscription Error:", err);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
