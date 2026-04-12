import { query } from '../db.js';

/**
 * Queue Rules API Endpoints
 * Manage global queue rules for marketplace
 */

/**
 * GET /api/admin/queue/rules
 * Get all queue rules
 */
export async function getAllQueueRules() {
    const rules = await query(`
        SELECT 
            rule_id,
            rule_name,
            enabled,
            priority,
            rule_type,
            config,
            created_at,
            updated_at
        FROM queue_rules
        ORDER BY priority DESC, rule_id ASC
    `);

    return rules.map(rule => ({
        ...rule,
        config: typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config
    }));
}

/**
 * GET /api/admin/queue/rules/:ruleId
 * Get single queue rule
 */
export async function getQueueRuleById(ruleId) {
    const [rule] = await query(
        'SELECT * FROM queue_rules WHERE rule_id = ?',
        [ruleId]
    );

    if (!rule) {
        throw new Error(`Queue rule ${ruleId} not found`);
    }

    return {
        ...rule,
        config: typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config
    };
}

/**
 * POST /api/admin/queue/rules
 * Create new queue rule
 */
export async function createQueueRule(ruleData) {
    const {
        rule_name,
        enabled = true,
        priority,
        rule_type,
        config
    } = ruleData;

    const sql = `
        INSERT INTO queue_rules 
        (rule_name, enabled, priority, rule_type, config, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await query(sql, [
        rule_name,
        enabled,
        priority,
        rule_type,
        JSON.stringify(config || {})
    ]);

    return {
        success: true,
        rule_id: result.insertId,
        rule_name
    };
}

/**
 * PUT /api/admin/queue/rules/:ruleId
 * Update existing queue rule
 */
export async function updateQueueRule(ruleId, ruleData) {
    const {
        rule_name,
        enabled,
        priority,
        rule_type,
        config
    } = ruleData;

    const sql = `
        UPDATE queue_rules
        SET 
            rule_name = ?,
            enabled = ?,
            priority = ?,
            rule_type = ?,
            config = ?,
            updated_at = NOW()
        WHERE rule_id = ?
    `;

    await query(sql, [
        rule_name,
        enabled,
        priority,
        rule_type,
        JSON.stringify(config || {}),
        ruleId
    ]);

    return {
        success: true,
        rule_id: ruleId
    };
}

/**
 * DELETE /api/admin/queue/rules/:ruleId
 * Delete queue rule
 */
export async function deleteQueueRule(ruleId) {
    await query('DELETE FROM queue_rules WHERE rule_id = ?', [ruleId]);

    return {
        success: true,
        rule_id: ruleId
    };
}

/**
 * PUT /api/admin/queue/rules/:ruleId/toggle
 * Enable/disable queue rule
 */
export async function toggleQueueRule(ruleId, enabled) {
    await query(
        'UPDATE queue_rules SET enabled = ?, updated_at = NOW() WHERE rule_id = ?',
        [enabled, ruleId]
    );

    return {
        success: true,
        rule_id: ruleId,
        enabled
    };
}

/**
 * POST /api/admin/queue/rules/reorder
 * Reorder queue rules by priority
 */
export async function reorderQueueRules(rules) {
    // rules = [{ rule_id, priority }, ...]
    for (const { rule_id, priority } of rules) {
        await query(
            'UPDATE queue_rules SET priority = ?, updated_at = NOW() WHERE rule_id = ?',
            [priority, rule_id]
        );
    }

    return {
        success: true,
        updated_count: rules.length
    };
}

/**
 * GET /api/admin/queue/affected-users/:ruleId
 * Get users affected by a specific rule
 */
export async function getAffectedUsers(ruleId) {
    const [rule] = await query(
        'SELECT config FROM queue_rules WHERE rule_id = ?',
        [ruleId]
    );

    if (!rule) {
        throw new Error('Rule not found');
    }

    const config = typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;

    // Build WHERE clause based on config
    let whereConditions = [];
    let params = [];

    if (config.min_direct_referrals || config.min_directs) {
        whereConditions.push('direct_referrals_count >= ?');
        params.push(config.min_direct_referrals || config.min_directs);
    }

    if (config.min_total_earned || config.threshold) {
        whereConditions.push('total_earned >= ?');
        params.push(config.min_total_earned || config.threshold);
    }

    if (config.min_package_level || config.package_id) {
        whereConditions.push('package_level >= ?');
        params.push(config.min_package_level || config.package_id);
    }

    if (config.min_nft_count) {
        whereConditions.push('nft_count >= ?');
        params.push(config.min_nft_count);
    }

    const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const sql = `
        SELECT 
            user_id,
            wallet_address,
            direct_referrals_count,
            total_earned,
            package_level,
            nft_count
        FROM users
        ${whereClause}
        ORDER BY user_id
    `;

    const users = await query(sql, params);

    return {
        rule_id: ruleId,
        affected_count: users.length,
        users: users.slice(0, 100) // Return first 100 for preview
    };
}

/**
 * GET /api/admin/queue/stats
 * Get queue system statistics
 */
export async function getQueueStats() {
    const stats = await query(`
        SELECT 
            COUNT(*) as total_rules,
            SUM(CASE WHEN enabled = TRUE THEN 1 ELSE 0 END) as enabled_rules,
            SUM(CASE WHEN enabled = FALSE THEN 1 ELSE 0 END) as disabled_rules
        FROM queue_rules
    `);

    const userStats = await query(`
        SELECT 
            COUNT(DISTINCT user_id) as total_users,
            AVG(nft_count) as avg_nfts_per_user,
            AVG(total_earned) as avg_earnings
        FROM users
        WHERE nft_count > 0
    `);

    return {
        ...stats[0],
        ...userStats[0]
    };
}
