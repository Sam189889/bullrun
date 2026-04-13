import { query } from '../db.js';

/**
 * Admin NFT API Endpoints
 * Fast MySQL queries for admin panel
 */

/**
 * GET /api/user/nfts/:userId
 * Get NFTs owned by a specific user
 */
export async function getUserNFTs(userId, filters = {}) {
    const {
        sort_by = 'nft_id',
        sort_order = 'DESC'
    } = filters;

    const sql = `
        SELECT 
            nft_id,
            owner_id,
            cached_current_price,
            cached_base_price,
            cached_is_listed,
            cached_created_at,
            cached_last_traded_at,
            cached_buy_count,
            is_hidden,
            is_pinned,
            admin_override,
            queue_exempt,
            admin_notes,
            last_synced_at,
            created_at,
            updated_at
        FROM nfts
        WHERE owner_id = ?
        ORDER BY ${sort_by} ${sort_order}
    `;

    const nfts = await query(sql, [userId]);

    return {
        nfts,
        total: nfts.length,
        user_id: userId
    };
}

/**
 * GET /api/marketplace/nfts
 * Get marketplace NFTs (truly available for sale, excluding queued NFTs)
 */
export async function getMarketplaceNFTs(filters = {}) {
    const {
        limit = 100,
        offset = 0,
        sort_by = 'nft_id',
        sort_order = 'DESC'
    } = filters;

    // Get all listed NFTs with owner queue status and pin info
    const sql = `
        SELECT 
            n.nft_id,
            n.owner_id,
            n.cached_current_price,
            n.cached_base_price,
            n.cached_is_listed,
            n.cached_created_at,
            n.cached_last_traded_at,
            n.cached_buy_count,
            n.is_hidden,
            n.is_pinned,
            n.pin_order,
            n.admin_override,
            n.queue_exempt,
            COALESCE(uqs.queue_slots, 0) as owner_queue_slots
        FROM nfts n
        LEFT JOIN user_queue_status uqs ON n.owner_id = uqs.user_id
        WHERE n.cached_is_listed = 1 
          AND n.is_hidden = 0
          AND n.admin_override = 0
        ORDER BY 
            n.is_pinned DESC,
            n.pin_order DESC,
            n.${sort_by} ${sort_order}
    `;

    const allListedNFTs = await query(sql);

    // Group NFTs by owner to calculate queue status
    const ownerNFTs = {};
    allListedNFTs.forEach(nft => {
        if (!ownerNFTs[nft.owner_id]) {
            ownerNFTs[nft.owner_id] = [];
        }
        ownerNFTs[nft.owner_id].push(nft);
    });

    // Filter out NFTs that are in queue
    const marketplaceNFTs = [];
    
    for (const ownerId in ownerNFTs) {
        const nfts = ownerNFTs[ownerId];
        const queueSlots = nfts[0].owner_queue_slots || 0;
        
        // Sort by nft_id DESC (newest first) to identify queue NFTs
        const sortedNFTs = [...nfts].sort((a, b) => b.nft_id - a.nft_id);
        
        // First N NFTs are in queue, rest are truly available
        sortedNFTs.forEach((nft, index) => {
            const isInQueue = index < queueSlots && !nft.queue_exempt;
            if (!isInQueue) {
                // Remove owner_queue_slots from response
                const { owner_queue_slots, ...nftData } = nft;
                marketplaceNFTs.push(nftData);
            }
        });
    }

    // Sort final result: Pinned first, then by sort preference
    marketplaceNFTs.sort((a, b) => {
        // First priority: is_pinned (DESC - pinned first)
        if (a.is_pinned !== b.is_pinned) {
            return b.is_pinned - a.is_pinned;
        }
        
        // Second priority: pin_order (DESC - higher order first)
        if (a.is_pinned && b.is_pinned && a.pin_order !== b.pin_order) {
            return b.pin_order - a.pin_order;
        }
        
        // Third priority: user's sort preference
        if (sort_order === 'DESC') {
            return b[sort_by] - a[sort_by];
        } else {
            return a[sort_by] - b[sort_by];
        }
    });

    // Apply pagination
    const paginatedNFTs = marketplaceNFTs.slice(offset, offset + limit);

    return {
        nfts: paginatedNFTs,
        total: marketplaceNFTs.length,
        page_size: limit,
        offset: offset
    };
}

/**
 * GET /api/admin/nfts
 * Get all NFTs with filters
 */
export async function getAllNFTs(filters = {}) {
    const {
        include_hidden = false,
        only_pinned = false,
        only_hidden = false,
        sort_by = 'nft_id',
        sort_order = 'DESC',
        limit: limitParam = 50,
        offset: offsetParam = 0
    } = filters;

    // Convert to numbers (in case they come as strings from URL params)
    const limit = parseInt(limitParam) || 50;
    const offset = parseInt(offsetParam) || 0;

    let conditions = [];
    let params = [];

    // Note: Burned NFTs are DELETED from database, not cached
    // So include_burned filter is not needed - they don't exist in DB

    // Filter hidden NFTs
    if (!include_hidden && !only_hidden) {
        conditions.push('is_hidden = FALSE');
    }

    // Show only pinned
    if (only_pinned) {
        conditions.push('is_pinned = TRUE');
    }

    // Show only hidden
    if (only_hidden) {
        conditions.push('is_hidden = TRUE');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY
    let orderBy = 'ORDER BY ';
    if (only_pinned) {
        orderBy += 'pin_order ASC, ';
    }
    orderBy += `${sort_by} ${sort_order}`;

    const sql = `
        SELECT 
            nft_id,
            owner_id,
            cached_current_price,
            cached_base_price,
            cached_is_listed,
            cached_created_at,
            cached_last_traded_at,
            cached_buy_count,
            is_hidden,
            is_pinned,
            pin_order,
            admin_override,
            queue_exempt,
            admin_notes,
            hide_reason,
            hidden_by,
            hidden_at,
            last_synced_at,
            created_at,
            updated_at
        FROM nfts
        ${whereClause}
        ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
    `;

    const nfts = await query(sql, params);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM nfts ${whereClause}`;
    const [countResult] = await query(countSql, []);

    return {
        nfts,
        total: countResult.total,
        limit,
        offset
    };
}

/**
 * GET /api/admin/nfts/:nftId
 * Get single NFT with full details
 */
export async function getNFTById(nftId) {
    const sql = `
        SELECT 
            n.*,
            u.wallet_address as owner_wallet,
            u.total_earned as owner_total_earned,
            u.direct_referrals_count as owner_direct_count
        FROM nfts n
        LEFT JOIN users u ON n.owner_id = u.user_id
        WHERE n.nft_id = ?
    `;

    const [nft] = await query(sql, [nftId]);

    if (!nft) {
        throw new Error(`NFT ${nftId} not found`);
    }

    // Get trade history
    const trades = await query(
        `SELECT 
            user_id as buyer_id,
            related_user_id as seller_id,
            amount as price,
            created_at,
            tx_hash
        FROM transaction_history
        WHERE event_type = 'NFTSold' AND nft_id = ?
        ORDER BY created_at DESC
        LIMIT 10`,
        [nftId]
    );

    return {
        ...nft,
        trade_history: trades
    };
}

/**
 * PUT /api/admin/nfts/:nftId/hide
 * Hide or unhide NFT
 */
export async function toggleNFTHidden(nftId, { is_hidden, hide_reason, admin_wallet }) {
    const sql = `
        UPDATE nfts
        SET 
            is_hidden = ?,
            hide_reason = ?,
            hidden_by = ?,
            hidden_at = ${is_hidden ? 'NOW()' : 'NULL'}
        WHERE nft_id = ?
    `;

    await query(sql, [is_hidden, hide_reason || null, admin_wallet || null, nftId]);

    return {
        success: true,
        nft_id: nftId,
        is_hidden
    };
}

/**
 * PUT /api/admin/nfts/:nftId/pin
 * Pin or unpin NFT
 */
export async function toggleNFTPinned(nftId, { is_pinned, pin_order }) {
    if (is_pinned && !pin_order) {
        // Auto-assign next pin order
        const [maxPin] = await query('SELECT MAX(pin_order) as max_order FROM nfts WHERE is_pinned = TRUE');
        pin_order = (maxPin.max_order || 0) + 1;
    }

    const sql = `
        UPDATE nfts
        SET 
            is_pinned = ?,
            pin_order = ?
        WHERE nft_id = ?
    `;

    await query(sql, [is_pinned, is_pinned ? pin_order : 0, nftId]);

    return {
        success: true,
        nft_id: nftId,
        is_pinned,
        pin_order: is_pinned ? pin_order : 0
    };
}

/**
 * POST /api/admin/nfts/bulk-pin
 * Reorder multiple pinned NFTs
 */
export async function bulkReorderPins(pinned_nfts) {
    for (const { nft_id, pin_order } of pinned_nfts) {
        await query(
            'UPDATE nfts SET pin_order = ? WHERE nft_id = ? AND is_pinned = TRUE',
            [pin_order, nft_id]
        );
    }

    return {
        success: true,
        updated_count: pinned_nfts.length
    };
}

/**
 * PUT /api/admin/nfts/:nftId/queue-override
 * Override queue rules for specific NFT
 */
export async function setNFTQueueOverride(nftId, { admin_override, queue_exempt }) {
    const sql = `
        UPDATE nfts
        SET 
            admin_override = ?,
            queue_exempt = ?
        WHERE nft_id = ?
    `;

    await query(sql, [admin_override, queue_exempt, nftId]);

    return {
        success: true,
        nft_id: nftId,
        admin_override,
        queue_exempt
    };
}

/**
 * PUT /api/admin/nfts/:nftId/notes
 * Update admin notes
 */
export async function updateNFTNotes(nftId, { admin_notes }) {
    await query(
        'UPDATE nfts SET admin_notes = ? WHERE nft_id = ?',
        [admin_notes, nftId]
    );

    return {
        success: true,
        nft_id: nftId
    };
}

/**
 * GET /api/admin/nfts/stats
 * Get NFT statistics
 */
export async function getNFTStats() {
    // NFTs in database (burned ones are deleted, so all are active)
    const stats = await query(`
        SELECT 
            COUNT(*) as total,
            COUNT(*) as active,
            SUM(CASE WHEN is_hidden = TRUE THEN 1 ELSE 0 END) as hidden,
            SUM(CASE WHEN is_pinned = TRUE THEN 1 ELSE 0 END) as pinned,
            SUM(CASE WHEN cached_is_listed = TRUE THEN 1 ELSE 0 END) as listed,
            AVG(cached_current_price) as avg_price,
            SUM(cached_buy_count) as total_trades
        FROM nfts
    `);

    // Get burned count from transaction history
    const [burnedStats] = await query(`
        SELECT COUNT(DISTINCT nft_id) as burned
        FROM transaction_history
        WHERE event_type = 'NFTBurned'
    `);

    return {
        ...stats[0],
        burned: burnedStats.burned || 0
    };
}
