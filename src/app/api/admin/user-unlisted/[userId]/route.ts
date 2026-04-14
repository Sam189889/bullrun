import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function PUT(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        const { unlisted_count } = await req.json();
        
        if (unlisted_count === 0) {
            await query('DELETE FROM user_unlisted_counts WHERE user_id = ?', [userId]);
            return NextResponse.json({ success: true, user_id: Number(userId), unlisted_count: 0, deleted: true });
        }
        
        await query(
            'INSERT INTO user_unlisted_counts (user_id, unlisted_count, set_by_admin_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE unlisted_count = ?, set_by_admin_at = NOW()',
            [userId, unlisted_count, unlisted_count]
        );
        return NextResponse.json({ success: true, user_id: Number(userId), unlisted_count });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
