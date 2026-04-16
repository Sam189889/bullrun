import { NextRequest, NextResponse } from 'next/server';
import { query } from '@db/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nft_id, hidden } = body;

        if (!nft_id) {
            return NextResponse.json({ error: 'NFT ID required' }, { status: 400 });
        }

        const isHidden = hidden ? 1 : 0;

        // Upsert NFT control
        await query(
            `INSERT INTO nft_controls (nft_id, is_hidden, hidden_by_admin_at) 
             VALUES (?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE 
                is_hidden = ?, 
                hidden_by_admin_at = IF(? = 1, NOW(), hidden_by_admin_at)`,
            [nft_id, isHidden, isHidden, isHidden]
        );

        return NextResponse.json({ 
            success: true, 
            nft_id, 
            hidden: isHidden === 1 
        });
    } catch (error) {
        console.error('Error updating NFT hide status:', error);
        return NextResponse.json({ error: 'Failed to update NFT' }, { status: 500 });
    }
}
