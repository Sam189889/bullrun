import { NextRequest, NextResponse } from 'next/server';
import { query } from '@db/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nft_id, pinned, pin_order = 0 } = body;

        if (!nft_id) {
            return NextResponse.json({ error: 'NFT ID required' }, { status: 400 });
        }

        const isPinned = pinned ? 1 : 0;

        // Upsert NFT control
        await query(
            `INSERT INTO nft_controls (nft_id, is_pinned, pin_order, pinned_by_admin_at) 
             VALUES (?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE 
                is_pinned = ?, 
                pin_order = ?,
                pinned_by_admin_at = IF(? = 1, NOW(), pinned_by_admin_at)`,
            [nft_id, isPinned, pin_order, isPinned, pin_order, isPinned]
        );

        return NextResponse.json({ 
            success: true, 
            nft_id, 
            pinned: isPinned === 1,
            pin_order 
        });
    } catch (error) {
        console.error('Error updating NFT pin status:', error);
        return NextResponse.json({ error: 'Failed to update NFT' }, { status: 500 });
    }
}
