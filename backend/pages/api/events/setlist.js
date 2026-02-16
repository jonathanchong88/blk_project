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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { event_id } = req.query;
    if (!event_id) return res.status(400).json({ message: 'Event ID required' });

    try {
      const { data, error } = await db
        .from('event_songs')
        .select(`
          id,
          sequence_number,
          key_note,
          song:songs (id, title, author, locale)
        `)
        .eq('event_id', event_id)
        .order('sequence_number', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { event_id, song_id, key_note } = req.body;
    try {
      // Get current max sequence to append to the end
      const { data: maxData } = await db
        .from('event_songs')
        .select('sequence_number')
        .eq('event_id', event_id)
        .order('sequence_number', { ascending: false })
        .limit(1);
      
      const nextSeq = (maxData && maxData.length > 0) ? maxData[0].sequence_number + 1 : 1;

      const { data, error } = await db
        .from('event_songs')
        .insert({ event_id, song_id, key_note, sequence_number: nextSeq })
        .select(`
          id,
          sequence_number,
          key_note,
          song:songs (id, title, author, locale)
        `)
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PUT') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id, key_note, sequence_number } = req.body;
    
    try {
      const updateData = {};
      if (key_note !== undefined) updateData.key_note = key_note;
      if (sequence_number !== undefined) updateData.sequence_number = sequence_number;

      const { data, error } = await db
        .from('event_songs')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          sequence_number,
          key_note,
          song:songs (id, title, author, locale)
        `)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.query;
    try {
      const { error } = await db.from('event_songs').delete().eq('id', id);
      if (error) throw error;
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}