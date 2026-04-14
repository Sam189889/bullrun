import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'bull_run_admin',
    connectionLimit: 10,
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const [results] = await pool.execute(sql, params);
    return results as T[];
}
