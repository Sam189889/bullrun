import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        const result = await query<{ unlisted_count: number }>('SELECT unlisted_count FROM user_unlisted_counts WHERE user_id = ?', [userId]);
        return NextResponse.json({ unlisted_count: result[0]?.unlisted_count || 0 });
    } catch (error) {
        return NextResponse.json({ unlisted_count: 0 });
    }
}
