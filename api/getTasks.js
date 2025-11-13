
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    const { rows } = await sql`SELECT * FROM tasks ORDER BY created_at DESC;`;
    return response.status(200).json({ tasks: rows });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
