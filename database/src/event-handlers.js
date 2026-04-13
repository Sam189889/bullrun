import { query } from './db.js';
import { evaluateQueueRules } from './queue-manager.js';
import { weiToDecimalFixed } from './utils.js';

/**
 * Handle UserRegistered event
 * Event fields: userId, wallet, referrerId, usernameId
 */
export async function handleUserRegistered(event) {
    const { userId, wallet, referrerId, usernameId } = event.args;
    
    await query(
        `INSERT INTO users (user_id, wallet_address, created_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE
         wallet_address = CASE 
             WHEN wallet_address = '0x0000000000000000000000000000000000000000' 
             THEN VALUES(wallet_address)
             ELSE wallet_address
         END`,
        [userId.toString(), wallet.toLowerCase()]
    );
    
    // Increment referrer's direct count (if has referrer)
    if (referrerId && referrerId.toString() !== '0') {
        await query(
            `UPDATE users 
             SET direct_referrals_count = direct_referrals_count + 1
             WHERE user_id = ?`,
            [referrerId.toString()]
        );
        
        // Re-evaluate referrer's queue (more directs = better queue rules)
        await evaluateQueueRules(referrerId.toString());
    }
    
    // Record transaction (with referrerId as related_user_id if exists)
    const refId = (referrerId && referrerId.toString() !== '0') ? referrerId : null;
    const userEventData = {
        usernameId: usernameId?.toString(),
        wallet: wallet.toLowerCase()
    };
    await recordTransaction(event, 'UserRegistered', userId, null, null, refId, userEventData);
    
    console.log(`✅ User registered: ${userId} (BULL${usernameId}, ${wallet})${refId ? ` → Referred by User ${refId}` : ''}`);
}

/**
 * Handle PackagePurchased event
 * Event fields: userId, packageLevel, price
 */
export async function handlePackagePurchased(event) {
    const { userId, packageLevel, price } = event.args;
    
    // Ensure user exists and update package level
    await query(
        `INSERT INTO users (user_id, wallet_address, package_level, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', ?, NOW())
         ON DUPLICATE KEY UPDATE
         package_level = VALUES(package_level)`,
        [userId.toString(), packageLevel.toString()]
    );
    
    // Re-evaluate queue (package upgrade might unlock better rules)
    await evaluateQueueRules(userId.toString());
    
    // Record transaction
    await recordTransaction(event, 'PackagePurchased', userId, null, weiToDecimalFixed(price));
    
    console.log(`✅ Package activated: User ${userId} Level ${packageLevel}`);
}

/**
 * Handle NFTCreated event (Virtual NFTs - Skip, track via NFTSold)
 */
export async function handleNFTCreated(event) {
    const { nftId, basePrice, listPrice } = event.args;
    
    // Virtual NFT - just log, actual tracking happens on NFTSold
    console.log(`📦 Virtual NFT created: ${nftId} (Base: ${basePrice}, List: ${listPrice})`);
}

/**
 * Handle NFTSold event - Create or update NFT
 * Event fields: nftId, sellerId, buyerId, sellerUsernameId, buyerUsernameId, price, appreciation
 */
export async function handleNFTSold(event) {
    const { nftId, sellerId, buyerId, sellerUsernameId, buyerUsernameId, price, appreciation } = event.args;
    
    // Insert or update NFT
    // Event gives: nftId, buyerId (new owner), price
    // Note: basePrice not in event, set same as currentPrice for now (will be updated by contract fetch if needed)
    const now = Math.floor(Date.now() / 1000);
    await query(
        `INSERT INTO nfts (
            nft_id, 
            owner_id, 
            cached_current_price,
            cached_base_price,
            cached_is_listed, 
            cached_created_at, 
            cached_last_traded_at, 
            cached_buy_count,
            last_synced_block, 
            created_at
        )
         VALUES (?, ?, ?, ?, true, ?, ?, 1, ?, NOW())
         ON DUPLICATE KEY UPDATE
         owner_id = VALUES(owner_id),
         cached_current_price = VALUES(cached_current_price),
         cached_last_traded_at = VALUES(cached_last_traded_at),
         cached_buy_count = cached_buy_count + 1,
         last_synced_block = VALUES(last_synced_block),
         updated_at = NOW()`,
        [
            nftId.toString(),
            buyerId.toString(),
            weiToDecimalFixed(price),
            weiToDecimalFixed(price),  // basePrice (same as current for events)
            now,  // createdAt (only for new NFTs)
            now,  // lastTradedAt
            event.blockNumber.toString()
        ]
    );
    
    // Ensure users exist
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [sellerId.toString()]
    );
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [buyerId.toString()]
    );
    
    // Update seller earnings only (don't touch nft_count - virtual NFTs)
    await query(
        `UPDATE users 
         SET total_earned = total_earned + ?
         WHERE user_id = ?`,
        [weiToDecimalFixed(appreciation), sellerId.toString()]
    );
    
    // Update buyer stats (NFT count only)
    await query(
        `UPDATE users 
         SET nft_count = nft_count + 1
         WHERE user_id = ?`,
        [buyerId.toString()]
    );
    
    // Re-evaluate queue rules for both users
    await evaluateQueueRules(sellerId.toString());
    await evaluateQueueRules(buyerId.toString());
    
    // Record transaction (buyerId = user_id, sellerId = related_user_id)
    const nftEventData = {
        sellerUsernameId: sellerUsernameId?.toString(),
        buyerUsernameId: buyerUsernameId?.toString(),
        appreciation: appreciation?.toString()
    };
    await recordTransaction(event, 'NFTSold', buyerId, nftId, weiToDecimalFixed(price), sellerId, nftEventData);
    
    console.log(`✅ NFT sold: #${nftId} from User ${sellerId} (BULL${sellerUsernameId}) → User ${buyerId} (BULL${buyerUsernameId}) - ${weiToDecimalFixed(price)} USDT`);
}

/**
 * Handle NFTListed event - Update NFT listing status
 * Event fields: nftId, price
 */
export async function handleNFTListed(event) {
    const { nftId, price } = event.args;
    
    // Update NFT listing status and price
    await query(
        `UPDATE nfts 
         SET cached_is_listed = true,
             cached_current_price = ?,
             last_synced_block = ?,
             updated_at = NOW()
         WHERE nft_id = ?`,
        [weiToDecimalFixed(price), event.blockNumber.toString(), nftId.toString()]
    );
    
    console.log(`📋 NFT listed: #${nftId} at ${weiToDecimalFixed(price)} USDT`);
}

/**
 * Handle NFTBurned event - DELETE from database
 */
export async function handleNFTBurned(event) {
    const { nftId, buyerId, finalPrice } = event.args;
    
    // Ensure user exists
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [buyerId.toString()]
    );
    
    // Delete burned NFT from database (no need to keep)
    await query(
        `DELETE FROM nfts WHERE nft_id = ?`,
        [nftId.toString()]
    );
    
    // Update user NFT count
    await query(
        `UPDATE users 
         SET nft_count = GREATEST(0, nft_count - 1)
         WHERE user_id = ?`,
        [buyerId.toString()]
    );
    
    // Record transaction
    await recordTransaction(event, 'NFTBurned', buyerId, nftId, finalPrice);
    
    console.log(`🔥 NFT burned (marked): ${nftId}`);
}

/**
 * Handle IncomeDistributed event
 * Event fields: toUserId, fromUserId, fromUsernameId, amount, incomeType, level
 */
export async function handleIncomeDistributed(event) {
    const { toUserId, fromUserId, fromUsernameId, amount, incomeType, level } = event.args;
    
    // Ensure user exists
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [toUserId.toString()]
    );
    
    // Determine earning type
    let earningType = 'level_income';
    if (incomeType.includes('DIRECT') || incomeType.includes('LEVEL')) earningType = 'level_income';
    else if (incomeType.includes('TRADING')) earningType = 'trading_level_bonus';
    else if (incomeType.includes('PROFIT') || incomeType.includes('SELLER')) earningType = 'nft_profit';
    
    // Record earning
    await query(
        `INSERT INTO earnings_history 
         (user_id, earning_type, amount, from_user_id, level, tx_hash, block_number, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            toUserId.toString(),
            earningType,
            weiToDecimalFixed(amount),
            fromUserId?.toString() || null,
            level?.toString() || 0,
            event.transactionHash,
            event.blockNumber.toString()
        ]
    );
    
    // Update user total earnings
    await query(
        `UPDATE users 
         SET total_earned = total_earned + ?
         WHERE user_id = ?`,
        [weiToDecimalFixed(amount), toUserId.toString()]
    );
    
    // Re-evaluate queue rules (earnings-based)
    await evaluateQueueRules(toUserId.toString());
    
    // Record transaction (with fromUserId as related_user_id and income details in event_data)
    const eventData = {
        incomeType: incomeType,           // "DIRECT_SPONSOR", "LEVEL_INCOME", etc.
        level: level.toString(),          // Level number (0-30)
        earningType: earningType,         // Database earning type
        fromUsernameId: fromUsernameId?.toString()
    };
    await recordTransaction(event, 'IncomeDistributed', toUserId, null, weiToDecimalFixed(amount), fromUserId, eventData);
    
    console.log(`💰 ${incomeType} (L${level}): ${weiToDecimalFixed(amount)} USDT from User ${fromUserId} → User ${toUserId}`);
}

/**
 * Handle RankAchieved event
 */
export async function handleRankAchieved(event) {
    const { userId } = event.args;
    
    // Ensure user exists
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [userId.toString()]
    );
    
    // Only record transaction (rank data in contract)
    await recordTransaction(event, 'RankAchieved', userId);
    
    console.log(`🏆 Rank achieved: User ${userId}`);
}

/**
 * Handle WeeklyPoolPaid event
 */
export async function handleWeeklyPoolPaid(event) {
    const { userId, week, amount, shares } = event.args;
    
    // Ensure user exists
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [userId.toString()]
    );
    
    // Record earning
    await query(
        `INSERT INTO earnings_history 
         (user_id, earning_type, amount, week_number, tx_hash, block_number, created_at)
         VALUES (?, 'weekly_pool', ?, ?, ?, ?, NOW())`,
        [
            userId.toString(),
            weiToDecimalFixed(amount),
            week.toString(),
            event.transactionHash,
            event.blockNumber.toString()
        ]
    );
    
    // Update user total
    await query(
        `UPDATE users 
         SET total_earned = total_earned + ?
         WHERE user_id = ?`,
        [weiToDecimalFixed(amount), userId.toString()]
    );
    
    // Record transaction
    await recordTransaction(event, 'WeeklyPoolPaid', userId, null, weiToDecimalFixed(amount));
    
    console.log(`📅 Weekly pool: User ${userId} Week ${week} = ${amount}`);
}

/**
 * Handle LuckyDrawWinner event
 * Event fields: userId, week, prize
 */
export async function handleLuckyDrawWinner(event) {
    const { userId, week, prize } = event.args;
    
    // Ensure user exists
    await query(
        `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
         VALUES (?, '0x0000000000000000000000000000000000000000', NOW())`,
        [userId.toString()]
    );
    
    // Record in lucky draw history
    await query(
        `INSERT INTO lucky_draw_history 
         (week_number, winner_user_id, winning_number, prize_amount, tx_hash, drawn_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
            week.toString(),
            userId.toString(),
            winningNumber.toString(),
            weiToDecimalFixed(prize),
            event.transactionHash
        ]
    );
    
    // Record earning
    await query(
        `INSERT INTO earnings_history 
         (user_id, earning_type, amount, week_number, tx_hash, block_number, created_at)
         VALUES (?, 'lucky_draw', ?, ?, ?, ?, NOW())`,
        [
            userId.toString(),
            weiToDecimalFixed(prize),
            week.toString(),
            event.transactionHash,
            event.blockNumber.toString()
        ]
    );
    
    // Update user total
    await query(
        `UPDATE users 
         SET total_earned = total_earned + ?
         WHERE user_id = ?`,
        [weiToDecimalFixed(prize), userId.toString()]
    );
    
    // Record transaction
    await recordTransaction(event, 'LuckyDrawWinner', userId, null, weiToDecimalFixed(prize));
    
    console.log(`🎰 Lucky draw: User ${userId} won ${prize} Week ${week}`);
}

/**
 * Handle SharesAwarded event
 */
export async function handleSharesAwarded(event) {
    const { userId } = event.args;
    
    // Shares tracked on-chain, just log
    await recordTransaction(event, 'SharesAwarded', userId);
    
    console.log(`📊 Shares awarded: User ${userId}`);
}

/**
 * Record transaction in history
 */
async function recordTransaction(event, eventType, userId, nftId = null, amount = null, relatedUserId = null, eventData = null) {
    // One transaction can have multiple events - no UNIQUE constraint on tx_hash
    await query(
        `INSERT INTO transaction_history 
         (tx_hash, block_number, event_type, user_id, related_user_id, nft_id, amount, event_data, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            event.transactionHash,
            event.blockNumber.toString(),
            eventType,
            userId?.toString() || null,
            relatedUserId?.toString() || null,
            nftId?.toString() || null,
            amount?.toString() || null,
            eventData ? JSON.stringify(eventData) : null
        ]
    );
}

/**
 * Event handler mapping
 */
export const EVENT_HANDLERS = {
    'UserRegistered': handleUserRegistered,
    'PackagePurchased': handlePackagePurchased,
    'NFTCreated': handleNFTCreated,
    'NFTListed': handleNFTListed,
    'NFTSold': handleNFTSold,
    'NFTBurned': handleNFTBurned,
    'IncomeDistributed': handleIncomeDistributed,
    'RankAchieved': handleRankAchieved,
    'WeeklyPoolPaid': handleWeeklyPoolPaid,
    'LuckyDrawWinner': handleLuckyDrawWinner,
    'SharesAwarded': handleSharesAwarded,
};
