import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { getPool, query, closePool } from './db.js';
import { EVENT_HANDLERS } from './event-handlers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from database directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const START_BLOCK = BigInt(process.env.START_BLOCK || '0');
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL || '5000');
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '1000');
const CHUNK_DELAY = parseInt(process.env.CHUNK_DELAY || '100'); // Delay between chunks (ms)
const QUIET_MODE = process.env.QUIET_MODE === 'true';

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load ABI (now database is inside frontend)
const abiPath = path.join(__dirname, '..', '..', 'src', 'abi', 'BullRunMainLogic.json');
const CONTRACT_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Setup provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// State tracking
let lastSyncedBlock = START_BLOCK;
let isSyncing = false;

/**
 * Get last synced block from database
 */
async function getLastSyncedBlock() {
    try {
        const result = await query(
            `SELECT MAX(block_number) as last_block FROM transaction_history`
        );
        
        if (result[0]?.last_block) {
            return BigInt(result[0].last_block);
        }
    } catch (error) {
        console.error('Error getting last synced block:', error);
    }
    
    return START_BLOCK;
}

/**
 * Fetch and process events in chunks
 */
async function syncEvents(fromBlock, toBlock) {
    const totalBlocks = toBlock - fromBlock;
    const startTime = Date.now();
    console.log(`📥 Syncing blocks ${fromBlock} to ${toBlock}... (${totalBlocks} blocks)`);
    
    const eventNames = CONTRACT_ABI
        .filter(item => item.type === 'event')
        .map(item => item.name);
    
    let totalProcessed = 0;
    let chunkCount = 0;
    
    // Fetch and process events in chunks
    let currentFrom = fromBlock;
    
    while (currentFrom <= toBlock) {
        const currentTo = currentFrom + BigInt(BATCH_SIZE) > toBlock 
            ? toBlock 
            : currentFrom + BigInt(BATCH_SIZE);
        
        try {
            const chunkEvents = [];
            
            // Fetch all event types in this range
            for (const eventName of eventNames) {
                if (!EVENT_HANDLERS[eventName]) continue;
                
                const filter = contract.filters[eventName]();
                const logs = await contract.queryFilter(
                    filter,
                    Number(currentFrom),
                    Number(currentTo)
                );
                
                chunkEvents.push(...logs.map(log => ({
                    ...log,
                    eventName
                })));
            }
            
            chunkCount++;
            
            // Show progress every 10 chunks in quiet mode, or every chunk in verbose
            if (!QUIET_MODE || chunkCount % 10 === 0) {
                const progress = ((currentTo - fromBlock) * BigInt(100) / totalBlocks);
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`  ✓ ${progress}% | Block ${currentTo} | ${chunkEvents.length} events | ${elapsed}s`);
            }
            
            // Process chunk events immediately
            if (chunkEvents.length > 0) {
                // Sort chunk events
                chunkEvents.sort((a, b) => {
                    if (a.blockNumber !== b.blockNumber) {
                        return a.blockNumber - b.blockNumber;
                    }
                    return a.logIndex - b.logIndex;
                });
                
                await processEvents(chunkEvents);
                totalProcessed += chunkEvents.length;
            }
            
        } catch (error) {
            console.error(`  ✗ Chunk ${currentFrom}-${currentTo} failed:`, error.message);
        }
        
        // Delay before next chunk to avoid rate limits
        if (CHUNK_DELAY > 0) {
            await delay(CHUNK_DELAY);
        }
        
        currentFrom = currentTo + BigInt(1);
    }
    
    console.log(`\n✅ Total events processed: ${totalProcessed}\n`);
}

/**
 * Process events and update database
 */
async function processEvents(events) {
    if (!QUIET_MODE) {
        console.log(`⚙️  Processing ${events.length} events...\n`);
    }
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const event of events) {
        const { eventName } = event;
        const handler = EVENT_HANDLERS[eventName];
        
        if (!handler) {
            if (!QUIET_MODE) console.log(`  ⏭️  No handler for: ${eventName}`);
            skipped++;
            continue;
        }
        
        try {
            // Check if already processed
            const existing = await query(
                `SELECT tx_id FROM transaction_history WHERE tx_hash = ?`,
                [event.transactionHash]
            );
            
            if (existing.length > 0) {
                skipped++;
                continue;
            }
            
            // Process event
            if (!QUIET_MODE) {
                console.log(`  🔄 Processing: ${eventName} (tx: ${event.transactionHash.substring(0, 10)}...)`);
            }
            await handler(event);
            processed++;
            
        } catch (error) {
            console.error(`  ❌ Error processing ${eventName}:`, error.message);
            if (!QUIET_MODE) console.error(`     Stack:`, error.stack);
            errors++;
        }
    }
    
    if (!QUIET_MODE || errors > 0) {
        console.log(`✅ Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`);
    }
}

/**
 * Main sync loop
 */
async function sync() {
    if (isSyncing) {
        console.log('⏭️  Sync already in progress, skipping...');
        return;
    }
    
    isSyncing = true;
    
    try {
        const currentBlock = await provider.getBlockNumber();
        
        if (lastSyncedBlock >= currentBlock) {
            console.log(`✓ Up to date (block ${currentBlock})`);
            return;
        }
        
        // Sync and process in chunks (processEvents called inside syncEvents)
        await syncEvents(lastSyncedBlock + BigInt(1), BigInt(currentBlock));
        
        lastSyncedBlock = BigInt(currentBlock);
        console.log(`✅ Synced to block ${currentBlock}\n`);
        
    } catch (error) {
        console.error('❌ Sync error:', error.message);
    } finally {
        isSyncing = false;
    }
}

/**
 * Check if NFTs already exist in database
 */
async function hasNFTs() {
    const result = await query('SELECT COUNT(*) as count FROM nfts');
    return result[0].count > 0;
}

/**
 * Initial full sync
 */
async function initialSync() {
    console.log('🚀 Starting initial sync...\n');
    
    // Get last synced block from transaction history
    const dbLastBlock = await getLastSyncedBlock();
    
    // Use the greater of START_BLOCK or last synced block
    lastSyncedBlock = dbLastBlock > START_BLOCK ? dbLastBlock : START_BLOCK;
    
    console.log(`📍 START_BLOCK: ${START_BLOCK}`);
    console.log(`📍 Last synced block in DB: ${dbLastBlock}`);
    console.log(`📍 Syncing from block: ${lastSyncedBlock}\n`);
    
    // Check if NFTs already loaded from contract
    const nftsExist = await hasNFTs();
    if (nftsExist) {
        console.log('✅ NFTs already in database (loaded from contract fetch)');
        console.log('🔄 Syncing events from block ' + lastSyncedBlock + '\n');
    } else {
        console.log('� No NFTs found, syncing from events...\n');
    }
    
    // Do initial sync from specified block
    await sync();
    
    console.log('✅ Initial sync complete!\n');
}

/**
 * Start service
 */
async function start() {
    console.log('═══════════════════════════════════════');
    console.log('  🐂 Bull Run - MySQL Sync Service');
    console.log('═══════════════════════════════════════');
    console.log(`📡 RPC: ${RPC_URL}`);
    console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`⏱️  Sync Interval: ${SYNC_INTERVAL}ms`);
    console.log(`📦 Batch Size: ${BATCH_SIZE} blocks`);
    console.log(`⏳ Chunk Delay: ${CHUNK_DELAY}ms`);
    console.log('═══════════════════════════════════════\n');
    
    // Test database connection
    const pool = await getPool();
    console.log('✅ Database connected\n');
    
    // Do initial sync
    await initialSync();
    
    // Start polling loop
    console.log(`🔄 Starting sync loop (every ${SYNC_INTERVAL}ms)...\n`);
    
    setInterval(async () => {
        await sync();
    }, SYNC_INTERVAL);
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    await closePool();
    console.log('✅ Goodbye!\n');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Shutting down...');
    await closePool();
    console.log('✅ Goodbye!\n');
    process.exit(0);
});

// Start the service
start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
