/**
 * Initial NFT Fetch from Contract
 * 
 * Fetches all NFTs directly from contract (1 to MAX_NFT_ID)
 * Gets complete struct data with all fields
 * Skips burned NFTs automatically
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
    console.log('⚠️ Historical NFT fetch is disabled on Railway.');
    console.log('✅ Live sync service (src/index.js) handles new NFTs automatically.');
    process.exit(0);
}

// Configuration
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const MAX_NFT_ID = parseInt(process.env.MAX_NFT_ID || '4200'); // Max NFT ID to check
const BATCH_SIZE = 50; // Fetch 50 NFTs at a time
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

/**
 * Fetch NFT from contract and insert into database
 */
async function fetchAndInsertNFT(nftId) {
    try {
        // Get NFT struct from contract (public mapping nfts)
        const nft = await contract.nfts(nftId);
        
        // Check if NFT is burned
        if (nft.isBurned) {
            console.log(`  ⏭️  NFT ${nftId} is burned, skipping...`);
            return { skipped: true, burned: true };
        }
        
        // Check if NFT exists (ownerId = 0 means not created)
        if (nft.ownerId === 0n) {
            return { skipped: true, notCreated: true };
        }
        
        // FIRST: Ensure owner exists in users table (before NFT insert - foreign key!)
        // Fetch wallet address from contract (allUsers[userId - 1])
        let ownerWallet = '0x0000000000000000000000000000000000000000';
        try {
            ownerWallet = await contract.allUsers(Number(nft.ownerId) - 1);
        } catch (err) {
            // User might not exist yet, use placeholder
            console.log(`  ⚠️  Could not fetch wallet for user ${nft.ownerId}`);
        }
        
        await query(
            `INSERT IGNORE INTO users (user_id, wallet_address, created_at)
             VALUES (?, ?, NOW())`,
            [nft.ownerId.toString(), ownerWallet]
        );
        
        // THEN: Insert NFT into database
        await query(
            `INSERT INTO nfts (
                nft_id, 
                owner_id, 
                cached_current_price, 
                cached_base_price,
                cached_buy_count,
                cached_created_at, 
                cached_last_traded_at, 
                cached_is_listed,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                owner_id = VALUES(owner_id),
                cached_current_price = VALUES(cached_current_price),
                cached_base_price = VALUES(cached_base_price),
                cached_buy_count = VALUES(cached_buy_count),
                cached_last_traded_at = VALUES(cached_last_traded_at),
                cached_is_listed = VALUES(cached_is_listed),
                updated_at = NOW()`,
            [
                nft.nftId.toString(),
                nft.ownerId.toString(),
                weiToDecimal(nft.currentPrice),
                weiToDecimal(nft.basePrice),
                Number(nft.buyCount),
                nft.createdAt.toString(),
                nft.lastTradedAt.toString(),
                nft.isListed
            ]
        );
        
        console.log(`  ✅ NFT ${nftId} → Owner: ${nft.ownerId}, Price: $${weiToDecimal(nft.currentPrice).toFixed(2)}`);
        return { skipped: false };
        
    } catch (error) {
        console.error(`  ❌ NFT ${nftId} fetch failed:`, error.message);
        return { skipped: true, error: true };
    }
}

/**
 * Fetch all NFTs from contract
 */
async function fetchAllNFTs() {
    console.log('═══════════════════════════════════════');
    console.log('  📦 Initial NFT Fetch from Contract');
    console.log('═══════════════════════════════════════');
    console.log(`📡 RPC: ${RPC_URL}`);
    console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`🔢 Max NFT ID: ${MAX_NFT_ID}`);
    console.log(`📦 Batch Size: ${BATCH_SIZE}`);
    console.log('═══════════════════════════════════════\n');
    
    const startTime = Date.now();
    let inserted = 0;
    let burned = 0;
    let notCreated = 0;
    let errors = 0;
    
    // Fetch in batches
    for (let batchStart = 1; batchStart <= MAX_NFT_ID; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, MAX_NFT_ID);
        console.log(`\n📥 Fetching NFTs ${batchStart} - ${batchEnd}...`);
        
        // Fetch batch in parallel
        const promises = [];
        for (let nftId = batchStart; nftId <= batchEnd; nftId++) {
            promises.push(fetchAndInsertNFT(nftId));
        }
        
        const results = await Promise.all(promises);
        
        // Count results
        results.forEach(result => {
            if (!result.skipped) {
                inserted++;
            } else if (result.burned) {
                burned++;
            } else if (result.notCreated) {
                notCreated++;
            } else if (result.error) {
                errors++;
            }
        });
        
        // Progress
        const progress = ((batchEnd / MAX_NFT_ID) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`  📊 Progress: ${progress}% | Inserted: ${inserted} | Burned: ${burned} | Not Created: ${notCreated} | Errors: ${errors} | Time: ${elapsed}s`);
        
        // Delay to avoid rate limits
        if (batchEnd < MAX_NFT_ID && DELAY_MS > 0) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Initial fetch complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Results:`);
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   🔥 Burned (skipped): ${burned}`);
    console.log(`   ⏭️  Not Created (skipped): ${notCreated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   ⏱️  Total Time: ${totalTime}s`);
    console.log('═══════════════════════════════════════\n');
}

// Run if called directly
// Check if this is the main module (works on Windows & Unix)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('initial-contract-fetch.js')) {
    fetchAllNFTs()
        .then(() => {
            console.log('📝 Next step: Run "npm start" to start event sync service\n');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { fetchAllNFTs };
