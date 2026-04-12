import { query } from '../db.js';

/**
 * Admin User Management API Endpoints
 */

/**
 * GET /api/admin/users/:userId/queue-status
 * Get user's queue status
 */
export async function getUserQueueStatus(userId) {
    const sql = `
        SELECT 
            user_id,
            total_earnings,
            sponsor_count,
            queue_slots,
            queue_active,
            last_updated
        FROM user_queue_status
        WHERE user_id = ?
    `;

    const [status] = await query(sql, [userId]);

    if (!status) {
        // Create default entry if doesn't exist
        const insertSql = `
            INSERT INTO user_queue_status (user_id, queue_slots, queue_active)
            VALUES (?, 0, TRUE)
        `;
        await query(insertSql, [userId]);

        return {
            user_id: userId,
            total_earnings: '0',
            sponsor_count: 0,
            queue_slots: 0,
            queue_active: true,
            last_updated: new Date()
        };
    }

    return status;
}

/**
 * PUT /api/admin/users/:userId/queue-slots
 * Update user's queue slots (admin override)
 */
export async function updateUserQueueSlots(userId, queueSlots) {
    // Validate
    if (queueSlots < 0 || queueSlots > 10) {
        throw new Error('Queue slots must be between 0 and 10');
    }

    const sql = `
        INSERT INTO user_queue_status (user_id, queue_slots, queue_active)
        VALUES (?, ?, TRUE)
        ON DUPLICATE KEY UPDATE
            queue_slots = VALUES(queue_slots),
            last_updated = CURRENT_TIMESTAMP
    `;

    await query(sql, [userId, queueSlots]);

    return {
        user_id: userId,
        queue_slots: queueSlots,
        updated_at: new Date()
    };
}

/**
 * GET /api/admin/users/search
 * Search users by ID or username
 */
export async function searchUsers(searchTerm, limit = 20) {
    const sql = `
        SELECT 
            u.user_id,
            u.username_id,
            u.wallet_address,
            u.referrer_id,
            u.created_at,
            uqs.queue_slots,
            uqs.queue_active,
            COUNT(DISTINCT n.nft_id) as nft_count
        FROM users u
        LEFT JOIN user_queue_status uqs ON u.user_id = uqs.user_id
        LEFT JOIN nfts n ON u.user_id = n.owner_id AND n.cached_is_listed = FALSE
        WHERE u.user_id = ? OR u.username_id = ?
        GROUP BY u.user_id
        LIMIT ?
    `;

    const userId = parseInt(searchTerm) || 0;

    const results = await query(sql, [userId, userId, limit]);
    return results;
}
