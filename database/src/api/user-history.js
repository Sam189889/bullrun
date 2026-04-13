import { query } from '../db.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abiPath = path.join(__dirname, '..', '..', '..', 'src', 'abi', 'BullRunMainLogic.json');
const CONTRACT_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

/**
 * Get username_id from blockchain for a given user_id
 */
async function getUsernameId(userId) {
    try {
        if (!userId || userId === 0) return 0;
        const usernameId = await contract.getUsernameId(BigInt(userId));
        return Number(usernameId);
    } catch (error) {
        console.error(`Error fetching username_id for user ${userId}:`, error.message);
        return userId; // Fallback to user_id if contract call fails
    }
}

/**
 * GET /api/user/:userId/history
 * Get user transaction history from database
 */
export async function getUserHistory(userId, filters = {}) {
    const {
        event_types = [],
        limit = 100,
        offset = 0
    } = filters;

    let whereClause = 'WHERE user_id = ?';
    const params = [parseInt(userId)];

    // Filter by event types if provided
    if (event_types.length > 0) {
        const placeholders = event_types.map(() => '?').join(',');
        whereClause += ` AND event_type IN (${placeholders})`;
        params.push(...event_types);
    }

    const sql = `
        SELECT 
            tx_id,
            user_id,
            event_type,
            nft_id,
            amount,
            related_user_id,
            block_number,
            tx_hash,
            created_at,
            event_data
        FROM transaction_history
        ${whereClause}
        ORDER BY block_number DESC, tx_id DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const transactions = await query(sql, params);

    // Get total count - use same params but without limit/offset
    const countParams = [parseInt(userId)];
    if (event_types.length > 0) {
        countParams.push(...event_types);
    }

    const countSql = `
        SELECT COUNT(*) as total
        FROM transaction_history
        ${whereClause}
    `;

    const [countRow] = await query(countSql, countParams);
    const total = countRow?.total || 0;

    return {
        transactions,
        total,
        limit,
        offset
    };
}

/**
 * GET /api/user/:userId/history/packages
 * Get user package purchase history (activation, topup, upgrade)
 */
export async function getUserPackageHistory(userId) {
    const sql = `
        SELECT 
            tx_id,
            event_type,
            amount,
            block_number,
            tx_hash,
            created_at,
            event_data
        FROM transaction_history
        WHERE user_id = ?
        AND event_type IN ('PackageActivated', 'PackageUpgraded', 'PackageToppedUp')
        ORDER BY block_number DESC, tx_id DESC
    `;

    const transactions = await query(sql, [parseInt(userId)]);
    return { transactions };
}

/**
 * GET /api/user/:userId/history/trading
 * Get user NFT trading history (buy/sell)
 */
export async function getUserTradingHistory(userId) {
    const sql = `
        SELECT 
            tx_id,
            event_type,
            nft_id,
            amount,
            related_user_id,
            block_number,
            tx_hash,
            created_at,
            event_data
        FROM transaction_history
        WHERE user_id = ?
        AND event_type IN ('NFTPurchased', 'NFTSold')
        ORDER BY block_number DESC, tx_id DESC
    `;

    const transactions = await query(sql, [parseInt(userId)]);
    return { transactions };
}

/**
 * GET /api/user/:userId/history/burning
 * Get user NFT burning history
 */
export async function getUserBurningHistory(userId) {
    const sql = `
        SELECT 
            tx_id,
            event_type,
            nft_id,
            amount,
            block_number,
            tx_hash,
            created_at,
            event_data
        FROM transaction_history
        WHERE user_id = ?
        AND event_type = 'NFTBurned'
        ORDER BY block_number DESC, tx_id DESC
    `;

    const transactions = await query(sql, [parseInt(userId)]);
    return { transactions };
}

/**
 * GET /api/user/:userId/history/withdrawals
 * Get user withdrawal history
 */
export async function getUserWithdrawalHistory(userId) {
    const sql = `
        SELECT 
            tx_id,
            event_type,
            amount,
            block_number,
            tx_hash,
            created_at,
            event_data
        FROM transaction_history
        WHERE user_id = ?
        AND event_type = 'Withdrawn'
        ORDER BY block_number DESC, tx_id DESC
    `;

    const transactions = await query(sql, [parseInt(userId)]);
    return { transactions };
}

/**
 * GET /api/user/:userId/history/income
 * Get user income/earnings history from earnings_history table
 */
export async function getUserIncomeHistory(userId) {
    const sql = `
        SELECT 
            earning_id,
            user_id,
            earning_type,
            amount,
            from_user_id,
            level,
            nft_id,
            week_number,
            tx_hash,
            block_number,
            created_at
        FROM earnings_history
        WHERE user_id = ?
        ORDER BY block_number DESC, earning_id DESC
    `;

    const earnings = await query(sql, [parseInt(userId)]);
    
    // Fetch username_ids from blockchain for all unique from_user_ids
    const uniqueFromUserIds = [...new Set(earnings.map(e => e.from_user_id).filter(id => id && id !== 0))];
    const usernameIdMap = {};
    
    await Promise.all(
        uniqueFromUserIds.map(async (fromUserId) => {
            usernameIdMap[fromUserId] = await getUsernameId(fromUserId);
        })
    );
    
    // Add from_username_id to each earning
    const earningsWithUsernameId = earnings.map(earning => ({
        ...earning,
        from_username_id: earning.from_user_id && earning.from_user_id !== 0 
            ? usernameIdMap[earning.from_user_id] 
            : 0
    }));
    
    return { earnings: earningsWithUsernameId };
}
