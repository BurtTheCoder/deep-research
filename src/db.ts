import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If not using connection string, it will fall back to these env vars:
  // PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT
});

export interface Report {
  id: string;
  query: string;
  content?: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export function createClient() {
  return {
    async createReport(report: Report) {
      await pool.query(
        `INSERT INTO reports(id, query, content, status, error, created_at, completed_at) 
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [
          report.id,
          report.query,
          report.content,
          report.status,
          report.error,
          report.createdAt,
          report.completedAt
        ]
      );
    },

    async updateReport(id: string, update: Partial<Report>) {
      // Build dynamic update query
      const setFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if ('content' in update) {
        setFields.push(`content = $${paramIndex++}`);
        values.push(update.content);
      }
      
      if ('status' in update) {
        setFields.push(`status = $${paramIndex++}`);
        values.push(update.status);
      }
      
      if ('error' in update) {
        setFields.push(`error = $${paramIndex++}`);
        values.push(update.error);
      }
      
      if ('completedAt' in update) {
        setFields.push(`completed_at = $${paramIndex++}`);
        values.push(update.completedAt);
      }
      
      if (setFields.length === 0) return;
      
      values.push(id); // Add id as the last parameter
      
      await pool.query(
        `UPDATE reports SET ${setFields.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    },

    async getReports(): Promise<Report[]> {
      const result = await pool.query(
        'SELECT * FROM reports ORDER BY created_at DESC'
      );
      
      return result.rows.map(row => ({
        id: row.id,
        query: row.query,
        content: row.content,
        status: row.status,
        error: row.error,
        createdAt: row.created_at.toISOString(),
        completedAt: row.completed_at ? row.completed_at.toISOString() : undefined
      }));
    },

    async getReport(id: string): Promise<Report | null> {
      const result = await pool.query(
        'SELECT * FROM reports WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      
      return {
        id: row.id,
        query: row.query,
        content: row.content,
        status: row.status,
        error: row.error,
        createdAt: row.created_at.toISOString(),
        completedAt: row.completed_at ? row.completed_at.toISOString() : undefined
      };
    },
  };
}
