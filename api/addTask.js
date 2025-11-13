
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Vercel automatically parses the body for POST requests with application/json
    const { text } = request.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return response.status(400).json({ message: 'Task text cannot be empty' });
    }

    await sql`INSERT INTO tasks (text) VALUES (${text});`;
    
    return response.status(201).json({ message: 'Task added successfully' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
