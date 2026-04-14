import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function PUT(req: Request, { params }: { params: Promise<{ nftId: string }> }) {
    try {
        const { nftId } = await params;
        const { is_hidden } = await req.json();
        await query(
            'INSERT INTO nft_controls (nft_id, is_hidden, hidden_by_admin_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE is_hidden = ?, hidden_by_admin_at = NOW()',
            [nftId, is_hidden, is_hidden]
        );
        return NextResponse.json({ success: true, nft_id: Number(nftId), is_hidden });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
