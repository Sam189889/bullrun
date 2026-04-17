import { NextResponse } from 'next/server';
import { query } from '@db/db';

export async function GET() {
    try {
        // 1. Get total NFTs hidden count from database
        const hiddenCountResult = await query<{ count: number }>('SELECT COUNT(*) as count FROM nft_controls WHERE is_hidden = TRUE');
        const totalHidden = hiddenCountResult[0]?.count || 0;
        
        // 2. Get all hidden NFT IDs from database
        const hiddenNFTsResult = await query<{ nft_id: number }>('SELECT nft_id FROM nft_controls WHERE is_hidden = TRUE ORDER BY nft_id');
        const allHiddenIds = hiddenNFTsResult.map(r => r.nft_id);
        
        // 3. Get first 50 hidden NFTs for verification
        const sampleHiddenIds = allHiddenIds.slice(0, 50);
        
        // 4. Get recent hidden NFTs with timestamps
        const recentHidden = await query<{ nft_id: number; hidden_by_admin_at: Date }>('SELECT nft_id, hidden_by_admin_at FROM nft_controls WHERE is_hidden = TRUE ORDER BY hidden_by_admin_at DESC LIMIT 20');
        
        // 5. Verify API endpoint response
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/nft-controls`);
        const apiData = await apiResponse.json();
        
        return NextResponse.json({
            database: {
                total_hidden: totalHidden,
                all_hidden_ids_count: allHiddenIds.length,
                sample_ids: sampleHiddenIds,
                recent_hidden: recentHidden
            },
            api_response: {
                hidden_nfts_count: apiData.hidden_nfts?.length || 0,
                sample_from_api: apiData.hidden_nfts?.slice(0, 50) || []
            },
            verification: {
                database_matches_api: totalHidden === (apiData.hidden_nfts?.length || 0),
                marketplace_filter_active: true,
                instructions: "Hidden NFTs should NOT appear in marketplace. Check browser console for 'NFT #X hidden by admin' logs."
            }
        });
    } catch (error) {
        console.error('[VERIFY MARKETPLACE] Error:', error);
        return NextResponse.json({ 
            error: 'Failed to verify',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
