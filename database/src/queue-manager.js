import { query } from './db.js';

/**
 * Evaluate queue rules for a specific user and update NFT visibility
 */
export async function evaluateQueueRules(userId) {
    try {
        // Check if queue system is enabled
        const [control] = await query(
            `SELECT control_value FROM admin_controls WHERE control_key = 'queue_system_enabled'`
        );
        
        if (control?.control_value === 'false') {
            // Queue disabled - list all user NFTs
            await query(
                `UPDATE nfts SET is_listed = true WHERE owner_id = ? AND is_burned = false`,
                [userId]
            );
            return;
        }
        
        // Get active queue rules sorted by priority
        const rules = await query(
            `SELECT * FROM queue_rules 
             WHERE enabled = true 
             ORDER BY priority DESC, rule_id ASC`
        );
        
        if (rules.length === 0) {
            // No rules - default: list all
            await query(
                `UPDATE nfts SET is_listed = true WHERE owner_id = ? AND is_burned = false`,
                [userId]
            );
            return;
        }
        
        // Get user stats (minimal fields)
        const [user] = await query(
            `SELECT user_id, total_earned, direct_referrals_count, nft_count
             FROM users WHERE user_id = ?`,
            [userId]
        );
        
        if (!user) return;
        
        // Calculate queue slots from rules (ADDITIVE - all matching rules stack)
        let totalQueueSlots = 0;
        let appliedRules = [];
        
        for (const rule of rules) {
            const slots = await calculateQueueSlots(rule, user);
            if (slots !== null) {  // Rule matched
                totalQueueSlots += slots;
                appliedRules.push({ name: rule.rule_name, slots });
            }
        }
        
        // Ensure non-negative (can't have negative queue)
        totalQueueSlots = Math.max(0, totalQueueSlots);
        
        // Get user's NFTs (oldest first) - EXCLUDE admin overrides
        // Note: Burned NFTs are deleted from DB, so no need to filter them
        const userNFTs = await query(
            `SELECT nft_id FROM nfts 
             WHERE owner_id = ? AND admin_override = false
             ORDER BY cached_created_at ASC`,
            [userId]
        );
        
        if (userNFTs.length === 0) return;
        
        // Apply queue slots
        const queuedNFTs = userNFTs.slice(0, totalQueueSlots);
        const listedNFTs = userNFTs.slice(totalQueueSlots);
        
        // Update queued NFTs (unlisted) - only non-overridden
        if (queuedNFTs.length > 0) {
            const queuedIds = queuedNFTs.map(n => n.nft_id);
            await query(
                `UPDATE nfts SET is_listed = false 
                 WHERE nft_id IN (${queuedIds.map(() => '?').join(',')}) 
                 AND admin_override = false`,
                queuedIds
            );
        }
        
        // Update listed NFTs - only non-overridden
        if (listedNFTs.length > 0) {
            const listedIds = listedNFTs.map(n => n.nft_id);
            await query(
                `UPDATE nfts SET cached_is_listed = true 
                 WHERE nft_id IN (${listedIds.map(() => '?').join(',')}) 
                 AND is_hidden = false AND admin_override = false`,
                listedIds
            );
        }
        
        // Log applied rules
        if (appliedRules.length > 0) {
            const rulesSummary = appliedRules.map(r => `${r.name}(${r.slots > 0 ? '+' : ''}${r.slots})`).join(', ');
            console.log(`🔄 Queue evaluated: User ${userId} → Rules: [${rulesSummary}] = ${totalQueueSlots} in queue, ${listedNFTs.length} listed`);
        } else {
            console.log(`🔄 Queue evaluated: User ${userId} → No rules matched → ${totalQueueSlots} in queue, ${listedNFTs.length} listed`);
        }
        
    } catch (error) {
        console.error(`❌ Queue evaluation failed for user ${userId}:`, error);
    }
}

/**
 * Calculate queue slots based on rule type and user stats
 */
async function calculateQueueSlots(rule, user) {
    // MySQL returns JSON as object, not string
    const config = rule.config ? (typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config) : {};
    
    switch (rule.rule_type) {
        case 'disabled':
            return null; // Rule doesn't apply
            
        case 'direct_based':
            // Example: 10+ directs = remove 10 from queue
            const minDirects = config.min_directs || 0;
            const maxDirects = config.max_directs || Infinity;
            
            if (user.direct_referrals_count >= minDirects && user.direct_referrals_count <= maxDirects) {
                return config.queue_slots || 0;
            }
            return null; // Rule doesn't match
            
        case 'earnings_based':
            // Example: $500+ earned = remove 5 from queue
            const earned = parseFloat(user.total_earned) / 1e18; // Convert from wei
            const minEarnings = config.threshold || config.min_earnings || 0;
            const maxEarnings = config.max_earnings || Infinity;
            
            if (earned >= minEarnings && earned <= maxEarnings) {
                return config.slots_removed || config.queue_slots || 0;
            }
            return null; // Rule doesn't match
            
        case 'custom':
            // Admin-defined custom logic (JSON-based)
            return evaluateCustomRule(config, user);
            
        default:
            return null;
    }
}

/**
 * Evaluate custom rule (flexible JSON-based logic)
 */
function evaluateCustomRule(config, user) {
    // Example custom rule:
    // {
    //   "conditions": [
    //     {"field": "total_earned", "operator": ">=", "value": 1000},
    //     {"field": "direct_referrals_count", "operator": ">=", "value": 5}
    //   ],
    //   "match": "all",  // "all" or "any"
    //   "queue_slots": 0
    // }
    
    if (!config.conditions || config.conditions.length === 0) {
        // No conditions = always match (use for default rules)
        return config.queue_slots || 0;
    }
    
    const results = config.conditions.map(cond => {
        const userValue = parseFloat(user[cond.field] || 0);
        const targetValue = parseFloat(cond.value);
        
        switch (cond.operator) {
            case '>=': return userValue >= targetValue;
            case '>': return userValue > targetValue;
            case '<=': return userValue <= targetValue;
            case '<': return userValue < targetValue;
            case '==': return userValue === targetValue;
            default: return false;
        }
    });
    
    const match = config.match === 'all' 
        ? results.every(r => r) 
        : results.some(r => r);
    
    return match ? (config.queue_slots || 0) : null; // null = doesn't match
}

/**
 * Re-evaluate queue rules for all users (admin trigger)
 */
export async function reevaluateAllQueues() {
    console.log('🔄 Re-evaluating queue rules for all users...');
    
    const users = await query(`SELECT user_id FROM users WHERE nft_count > 0`);
    
    for (const user of users) {
        await evaluateQueueRules(user.user_id);
    }
    
    console.log(`✅ Queue re-evaluation complete for ${users.length} users`);
}

/**
 * Admin: Hide/show specific NFT
 */
export async function setNFTHidden(nftId, hidden) {
    await query(
        `UPDATE nfts SET is_hidden = ?, is_listed = ? WHERE nft_id = ?`,
        [hidden, !hidden, nftId]
    );
    
    console.log(`👁️ NFT ${nftId} ${hidden ? 'hidden' : 'shown'}`);
}

/**
 * Admin: Pin/unpin NFT (for featured NFTs)
 */
export async function setNFTPinned(nftId, pinned, order = 0) {
    await query(
        `UPDATE nfts SET is_pinned = ?, pin_order = ? WHERE nft_id = ?`,
        [pinned, order, nftId]
    );
    
    console.log(`📌 NFT ${nftId} ${pinned ? 'pinned' : 'unpinned'}`);
}

// ============ ADMIN: QUEUE RULE MANAGEMENT ============

/**
 * Admin: Enable/disable specific queue rule
 */
export async function toggleQueueRule(ruleId, enabled) {
    await query(
        `UPDATE queue_rules SET enabled = ? WHERE rule_id = ?`,
        [enabled, ruleId]
    );
    
    console.log(`🔧 Queue rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
    
    // Re-evaluate all queues after rule change
    await reevaluateAllQueues();
}

/**
 * Admin: Create new queue rule
 */
export async function createQueueRule(name, type, config, priority = 0) {
    const result = await query(
        `INSERT INTO queue_rules (rule_name, rule_type, config, priority, enabled)
         VALUES (?, ?, ?, ?, true)`,
        [name, type, JSON.stringify(config), priority]
    );
    
    console.log(`✅ Queue rule created: ${name} (ID: ${result.insertId})`);
    
    // Apply new rule
    await reevaluateAllQueues();
    
    return result.insertId;
}

/**
 * Admin: Update existing queue rule
 */
export async function updateQueueRule(ruleId, updates) {
    const { name, type, config, priority, enabled } = updates;
    
    const setClauses = [];
    const values = [];
    
    if (name !== undefined) {
        setClauses.push('rule_name = ?');
        values.push(name);
    }
    if (type !== undefined) {
        setClauses.push('rule_type = ?');
        values.push(type);
    }
    if (config !== undefined) {
        setClauses.push('config = ?');
        values.push(JSON.stringify(config));
    }
    if (priority !== undefined) {
        setClauses.push('priority = ?');
        values.push(priority);
    }
    if (enabled !== undefined) {
        setClauses.push('enabled = ?');
        values.push(enabled);
    }
    
    if (setClauses.length === 0) return;
    
    values.push(ruleId);
    
    await query(
        `UPDATE queue_rules SET ${setClauses.join(', ')} WHERE rule_id = ?`,
        values
    );
    
    console.log(`🔧 Queue rule ${ruleId} updated`);
    
    // Re-evaluate all queues
    await reevaluateAllQueues();
}

/**
 * Admin: Delete queue rule
 */
export async function deleteQueueRule(ruleId) {
    await query(`DELETE FROM queue_rules WHERE rule_id = ?`, [ruleId]);
    
    console.log(`🗑️ Queue rule ${ruleId} deleted`);
    
    // Re-evaluate all queues
    await reevaluateAllQueues();
}

/**
 * Admin: Get all queue rules
 */
export async function getAllQueueRules() {
    const rules = await query(
        `SELECT * FROM queue_rules ORDER BY priority DESC, rule_id ASC`
    );
    
    return rules.map(rule => ({
        ...rule,
        config: rule.config ? JSON.parse(rule.config) : null
    }));
}

/**
 * Admin: Toggle global queue system
 */
export async function toggleQueueSystem(enabled) {
    await query(
        `UPDATE admin_controls 
         SET control_value = ? 
         WHERE control_key = 'queue_system_enabled'`,
        [enabled ? 'true' : 'false']
    );
    
    console.log(`🔧 Queue system ${enabled ? 'enabled' : 'disabled'}`);
    
    // Re-evaluate all queues
    await reevaluateAllQueues();
}

// ============ ADMIN: MANUAL QUEUE OVERRIDE ============

/**
 * Admin: Manually list/unlist specific NFT (override rules)
 */
export async function adminSetNFTListed(nftId, listed) {
    await query(
        `UPDATE nfts SET is_listed = ?, admin_override = true WHERE nft_id = ?`,
        [listed, nftId]
    );
        
    console.log(`👨‍💼 Admin override: NFT ${nftId} ${listed ? 'listed' : 'unlisted'} (locked)`);
}

/**
 * Admin: Manually list/unlist all NFTs of a user (override rules)
 */
export async function adminSetUserNFTsListed(userId, listed) {
    const result = await query(
        `UPDATE nfts SET is_listed = ?, admin_override = true 
         WHERE owner_id = ? AND is_burned = false`,
        [listed, userId]
    );
    
    console.log(`👨‍💼 Admin override: ${result.affectedRows} NFTs of User ${userId} ${listed ? 'listed' : 'unlisted'} (locked)`);
    
    return result.affectedRows;
}

/**
 * Admin: Manually put N oldest NFTs of user in queue (override rules)
 */
export async function adminSetUserQueueSlots(userId, queueSlots) {
    // Get user's NFTs (oldest first)
    const userNFTs = await query(
        `SELECT nft_id FROM nfts 
         WHERE owner_id = ? AND is_burned = false
         ORDER BY created_at ASC`,
        [userId]
    );
    
    if (userNFTs.length === 0) {
        console.log(`👨‍💼 Admin: User ${userId} has no NFTs`);
        return;
    }
    
    // Split into queued and listed
    const queuedNFTs = userNFTs.slice(0, queueSlots);
    const listedNFTs = userNFTs.slice(queueSlots);
    
    // Update queued NFTs (unlisted) with override flag
    if (queuedNFTs.length > 0) {
        const queuedIds = queuedNFTs.map(n => n.nft_id);
        await query(
            `UPDATE nfts SET is_listed = false, admin_override = true 
             WHERE nft_id IN (${queuedIds.map(() => '?').join(',')})`,
            queuedIds
        );
    }
    
    // Update listed NFTs with override flag
    if (listedNFTs.length > 0) {
        const listedIds = listedNFTs.map(n => n.nft_id);
        await query(
            `UPDATE nfts SET is_listed = true, admin_override = true 
             WHERE nft_id IN (${listedIds.map(() => '?').join(',')}) 
             AND is_hidden = false`,
            listedIds
        );
    }
    
    console.log(`👨‍💼 Admin override: User ${userId} → ${queueSlots} in queue, ${listedNFTs.length} listed (locked)`);
    
    return {
        queued: queuedNFTs.length,
        listed: listedNFTs.length
    };
}

/**
 * Admin: Release override and reapply auto rules
 */
export async function adminReleaseOverride(nftId) {
    await query(
        `UPDATE nfts SET admin_override = false WHERE nft_id = ?`,
        [nftId]
    );
    
    // Get NFT owner to re-evaluate
    const [nft] = await query(
        `SELECT owner_id FROM nfts WHERE nft_id = ?`,
        [nftId]
    );
    
    if (nft) {
        await evaluateQueueRules(nft.owner_id);
        console.log(`🔓 Admin override released: NFT ${nftId} (auto-rules reapplied)`);
    }
}

/**
 * Admin: Release all overrides for a user
 */
export async function adminReleaseUserOverrides(userId) {
    await query(
        `UPDATE nfts SET admin_override = false WHERE owner_id = ?`,
        [userId]
    );
    
    // Reapply auto rules
    await evaluateQueueRules(userId);
    
    console.log(`🔓 Admin overrides released for User ${userId} (auto-rules reapplied)`);
}

/**
 * Admin: Get user's current queue status
 */
export async function getUserQueueStatus(userId) {
    const nfts = await query(
        `SELECT nft_id, is_listed, is_hidden, admin_override, created_at
         FROM nfts 
         WHERE owner_id = ? AND is_burned = false
         ORDER BY created_at ASC`,
        [userId]
    );
    
    const queued = nfts.filter(n => !n.is_listed).length;
    const listed = nfts.filter(n => n.is_listed && !n.is_hidden).length;
    const hidden = nfts.filter(n => n.is_hidden).length;
    const overridden = nfts.filter(n => n.admin_override).length;
    
    return {
        total: nfts.length,
        queued,
        listed,
        hidden,
        overridden,
        nfts
    };
}
