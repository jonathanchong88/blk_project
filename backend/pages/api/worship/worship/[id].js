// backend/pages/api/worship/events/[id].js
import db from '../../../../db';
import { authenticateToken } from '../../../../middleware/auth';
import { cors } from '../../../../middleware/cors';

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
  const { id } = req.query; // event_id

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await db
        .from('worship_event_details')
        .select('*')
        .eq('event_id', id)
        .single();
      
      // If no row found, return empty object instead of error
      if (error && error.code !== 'PGRST116') throw error;
      
      res.json(data || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST' || req.method === 'PUT') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { rehearsal_date, worship_leader_id } = req.body;

    try {
      // Upsert: insert if not exists, update if exists
      const { data, error } = await db
        .from('worship_event_details')
        .upsert({ 
            event_id: id, 
            rehearsal_date, 
            worship_leader_id 
        }, { onConflict: 'event_id' })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
