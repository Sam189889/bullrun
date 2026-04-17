import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function GET() {
    try {
        // Get total hidden NFTs
        const hiddenCount = await query<{ count: number }>('SELECT COUNT(*) as count FROM nft_controls WHERE is_hidden = TRUE');
        
        // Get all hidden NFT IDs
        const hiddenNFTs = await query<{ nft_id: number }>('SELECT nft_id FROM nft_controls WHERE is_hidden = TRUE ORDER BY nft_id LIMIT 20');
        
        // Get sample of hidden NFTs with timestamps
        const samples = await query<{ nft_id: number; hidden_by_admin_at: Date }>('SELECT nft_id, hidden_by_admin_at FROM nft_controls WHERE is_hidden = TRUE ORDER BY hidden_by_admin_at DESC LIMIT 10');
        
        return NextResponse.json({
            total_hidden: hiddenCount[0]?.count || 0,
            sample_hidden_ids: hiddenNFTs.map(r => r.nft_id),
            recent_hidden: samples
        });
    } catch (error) {
        console.error('[CHECK HIDDEN] Error:', error);
        return NextResponse.json({ 
            error: 'Failed to check database',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
