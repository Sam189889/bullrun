import { NextRequest, NextResponse } from 'next/server';
import { query } from '@db/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { unlisted_count } = await request.json();
        const { userId } = await params;

        if (unlisted_count === 0) {
            // Delete row when count is 0 (clean up database)
            await query(
                'DELETE FROM user_unlisted_counts WHERE user_id = ?',
                [userId]
            );
        } else {
            // Insert or update unlisted count in database (UPSERT)
            await query(
                `INSERT INTO user_unlisted_counts (user_id, unlisted_count) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE unlisted_count = ?`,
                [userId, unlisted_count, unlisted_count]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating unlisted count:', error);
        return NextResponse.json(
            { error: 'Failed to update unlisted count' },
            { status: 500 }
        );
    }
}
