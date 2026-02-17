import db from '../../../db';
import { authenticateToken } from '../../../middleware/auth';
import { cors } from '../../../middleware/cors';

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    const { event_id } = req.query;
    try {
        // Fetch attendees with check-in status
        const { data, error } = await db
            .from('event_attendees') 
            .select(`
                user_id,
                checked_in,
                user:users(id, name, username, avatar_url, phone)
            `)
            .eq('event_id', event_id);
        
        if (error) throw error;
        
        // Flatten the structure
        const attendees = data.map(item => ({
            ...item.user,
            checked_in: item.checked_in
        }));

        res.json(attendees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
      const { event_id, user_id, checked_in } = req.body;
      try {
          const { error } = await db
            .from('event_attendees')
            .upsert({ event_id, user_id, checked_in }, { onConflict: 'event_id, user_id' });
          
          if (error) throw error;
          res.json({ success: true });
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
  } else if (req.method === 'PUT') {
      const { event_id, user_id, checked_in } = req.body;
      try {
          const { error } = await db
            .from('event_attendees')
            .update({ checked_in })
            .eq('event_id', event_id)
            .eq('user_id', user_id);
          
          if (error) throw error;
          res.json({ success: true });
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
  } else {
      res.status(405).json({ message: 'Method not allowed' });
  }
}