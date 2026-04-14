import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function GET() {
    try {
        // Get all users with unlisted counts
        const users = await query<{ user_id: number; unlisted_count: number }>(
            'SELECT user_id, unlisted_count FROM user_unlisted_counts WHERE unlisted_count > 0'
        );
        
        return NextResponse.json({ 
            users: users.map(u => ({ 
                userId: u.user_id, 
                unlistedCount: u.unlisted_count 
            }))
        });
    } catch (error) {
        return NextResponse.json({ users: [] });
    }
}
