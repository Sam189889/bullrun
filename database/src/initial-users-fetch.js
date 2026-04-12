/**
 * Initial Users Fetch from Contract
 * 
 * Fetches all existing users from contract
 * - Wallet addresses from allUsers array
 * - User struct data (referrer, package level, etc.)
 * - Calculate direct referrals count
 * 
 * Run once for initial setup, then use events for updates
 */

import { ethers } from 'ethers';
import { query } from './db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from database directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// SAFETY: Prevent running on Railway (historical fetch is local only)
if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    console.log('⚠️ Historical users fetch is disabled on Railway.');
    console.log('✅ Live sync service (src/index.js) handles new users automatically.');
    process.exit(0);
}

// Configuration
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const BATCH_SIZE = 100; // Fetch 100 users at a time
const DELAY_MS = 3000; // 3 second delay between batches to avoid rate limiting

// Load ABI
const abiPath = path.join(__dirname, '..', '..', 'src', 'abi', 'BullRunMainLogic.json');
const CONTRACT_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Setup provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Helper to convert wei to decimal
function weiToDecimal(wei) {
    return parseFloat(ethers.formatUnits(wei, 18));
}

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch user data and insert into database
 */
async function fetchAndInsertUser(userId) {
    try {
        // Get wallet address from allUsers array (userId - 1 = index)
        const wallet = await contract.allUsers(userId - 1);
        
        if (wallet === ethers.ZeroAddress) {
            return { userId, status: 'skip', reason: 'Zero address' };
        }
        
        // Get user struct data
        const user = await contract.users(userId);
        
        // Insert into database
        await query(
            `INSERT INTO users 
             (user_id, wallet_address, package_level, created_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
             wallet_address = VALUES(wallet_address),
             package_level = VALUES(package_level)`,
            [
                userId.toString(),
                wallet.toLowerCase(),
                user.packageLevel.toString()
            ]
        );
        
        return { userId, status: 'success', wallet, packageLevel: user.packageLevel.toString() };
        
    } catch (error) {
        console.error(`  ✗ Error fetching user ${userId}:`, error.message);
        return { userId, status: 'error', error: error.message };
    }
}

/**
 * Calculate and update direct referrals count for all users
 */
async function updateDirectReferralsCounts() {
    console.log('\n📊 Calculating direct referrals counts...');
    
    try {
        // Get all users with their referrers from contract
        const users = await query(`SELECT user_id FROM users ORDER BY user_id`);
        
        // Count referrals for each user
        const referralCounts = {};
        
        for (const { user_id } of users) {
            try {
                const user = await contract.users(user_id);
                const referrerId = user.referrerId.toString();
                
                if (referrerId !== '0') {
                    referralCounts[referrerId] = (referralCounts[referrerId] || 0) + 1;
                }
            } catch (error) {
                // Skip if user doesn't exist in contract
            }
        }
        
        // Update database
        for (const [referrerId, count] of Object.entries(referralCounts)) {
            await query(
                `UPDATE users SET direct_referrals_count = ? WHERE user_id = ?`,
                [count, referrerId]
            );
        }
        
        console.log(`✅ Updated direct referrals for ${Object.keys(referralCounts).length} users`);
        
    } catch (error) {
        console.error('❌ Error calculating referral counts:', error);
    }
}

/**
 * Main fetch function
 */
async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  📥 Initial Users Fetch from Contract');
    console.log('═══════════════════════════════════════');
    console.log(`📡 RPC: ${RPC_URL}`);
    console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`📦 Batch Size: ${BATCH_SIZE}`);
    console.log('═══════════════════════════════════════\n');
    
    const startTime = Date.now();
    
    try {
        // Get total user count from contract
        const totalUsers = await contract.totalUsers();
        const userCount = Number(totalUsers); // totalUsers is the actual count
        
        console.log(`👥 Total Users to fetch: ${userCount}\n`);
        
        if (userCount === 0) {
            console.log('⚠️  No users found in contract');
            return;
        }
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        
        // Fetch users in batches
        for (let i = 1; i <= userCount; i += BATCH_SIZE) {
            const batchEnd = Math.min(i + BATCH_SIZE - 1, userCount);
            console.log(`📥 Fetching users ${i} - ${batchEnd}...`);
            
            // Fetch batch in parallel
            const promises = [];
            for (let userId = i; userId <= batchEnd; userId++) {
                promises.push(fetchAndInsertUser(userId));
            }
            
            const results = await Promise.all(promises);
            
            // Process results
            for (const result of results) {
                if (result.status === 'success') {
                    console.log(`  ✅ User ${result.userId} → ${result.wallet} (Package ${result.packageLevel})`);
                    inserted++;
                } else if (result.status === 'skip') {
                    console.log(`  ⏭️  User ${result.userId} skipped: ${result.reason}`);
                    skipped++;
                } else {
                    errors++;
                }
            }
            
            // Progress
            const progress = ((batchEnd / userCount) * 100).toFixed(1);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`  📊 Progress: ${progress}% | Inserted: ${inserted} | Skipped: ${skipped} | Errors: ${errors} | Time: ${elapsed}s\n`);
            
            // Delay between batches
            if (batchEnd < userCount && DELAY_MS > 0) {
                await delay(DELAY_MS);
            }
        }
        
        // Calculate direct referrals counts
        await updateDirectReferralsCounts();
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log('\n═══════════════════════════════════════');
        console.log('✅ Initial users fetch complete!');
        console.log('═══════════════════════════════════════');
        console.log('📊 Results:');
        console.log(`   ✅ Inserted: ${inserted}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   ⏱️  Total Time: ${totalTime}s`);
        console.log('═══════════════════════════════════════\n');
        
        console.log('📝 Next step: Run "npm run fetch-events" to get historical transactions');
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await query('SELECT 1'); // Keep connection alive
        console.log('✅ MySQL connection pool closed');
        process.exit(0);
    }
}

// Run
main().catch(console.error);
