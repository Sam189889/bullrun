import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function GET() {
    try {
        const hidden = await query<{ nft_id: number }>('SELECT nft_id FROM nft_controls WHERE is_hidden = TRUE');
        const pinned = await query<{ nft_id: number; pin_order: number }>('SELECT nft_id, pin_order FROM nft_controls WHERE is_pinned = TRUE ORDER BY pin_order');
        
        return NextResponse.json({
            hidden_nfts: hidden.map(r => r.nft_id),
            pinned_nfts: pinned.map(r => ({ nft_id: r.nft_id, pin_order: r.pin_order }))
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ hidden_nfts: [], pinned_nfts: [] });
    }
}
