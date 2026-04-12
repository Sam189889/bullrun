/**
 * Initial Events Fetch - Income & Transaction History
 * 
 * Fetches all historical events from START_BLOCK to current
 * Populates transaction_history and earnings_history tables
 * 
 * Run once for initial setup
 */

import { ethers } from 'ethers';
import { query } from './db.js';
import { EVENT_HANDLERS } from './event-handlers.js';
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
    console.log('⚠️ Historical event fetch is disabled on Railway.');
    console.log('✅ Live sync service (src/index.js) handles new events automatically.');
    process.exit(0);
}

// Configuration
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const START_BLOCK = BigInt(process.env.START_BLOCK || '0');
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100');
const CHUNK_DELAY = parseInt(process.env.CHUNK_DELAY || '500'); // 500ms delay between chunks

// Load ABI
const abiPath = path.join(__dirname, '..', '..', 'src', 'abi', 'BullRunMainLogic.json');
const CONTRACT_ABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Setup provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process events batch
 */
async function processEventsBatch(events) {
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const event of events) {
        const handler = EVENT_HANDLERS[event.eventName];
        
        if (!handler) {
            skipped++;
            continue;
        }
        
        try {
            await handler(event);
            processed++;
        } catch (error) {
            console.error(`  ❌ Error processing ${event.eventName}:`, error.message);
            errors++;
        }
    }
    
    return { processed, skipped, errors };
}

/**
 * Fetch events in chunks
 */
async function fetchHistoricalEvents() {
    console.log('\n📜 Initial Events Fetch');
    console.log('═══════════════════════════════════════');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const START_BLOCK = BigInt(process.env.START_BLOCK || '0');
    const currentBlockNumber = await provider.getBlockNumber();
    const END_BLOCK = BigInt(currentBlockNumber);
    
    console.log(`📍 From Block: ${START_BLOCK}`);
    console.log(`📍 To Block: ${END_BLOCK}`);
    
    const totalBlocks = END_BLOCK - START_BLOCK + BigInt(1);
    console.log(`📊 Total Blocks: ${totalBlocks.toLocaleString()}\n`);
    
    // Adaptive batch sizing
    let currentBatchSize = BigInt(BATCH_SIZE);
    const MAX_BATCH = BigInt(500);  // Maximum batch size (safe for RPC limits)
    let emptyChunksInRow = 0;
    
    // Get event names from ABI
    const eventNames = CONTRACT_ABI
        .filter(item => item.type === 'event')
        .map(item => item.name);
    
    console.log(`📋 Events to fetch: ${eventNames.join(', ')}\n`);
    
    const startTime = Date.now();  // Track total execution time
    
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let chunkCount = 0;
    
    let currentFrom = START_BLOCK;
    
    while (currentFrom <= END_BLOCK) {
        const currentTo = currentFrom + currentBatchSize > END_BLOCK 
            ? END_BLOCK 
            : currentFrom + currentBatchSize;
        
        try {
            // Fetch all event types in PARALLEL (much faster!)
            const eventPromises = eventNames
                .filter(name => EVENT_HANDLERS[name])
                .map(async (eventName) => {
                    const filter = contract.filters[eventName]();
                    const logs = await contract.queryFilter(
                        filter,
                        Number(currentFrom),
                        Number(currentTo)
                    );
                    return logs.map(log => ({ ...log, eventName }));
                });
            
            const eventResults = await Promise.all(eventPromises);
            const chunkEvents = eventResults.flat();
            
            chunkCount++;
            
            // Adaptive batch sizing logic
            if (chunkEvents.length > 0) {
                // Found events - reset to normal batch size
                emptyChunksInRow = 0;
                currentBatchSize = BigInt(BATCH_SIZE);
                
                // Sort by block and log index
                chunkEvents.sort((a, b) => {
                    if (a.blockNumber !== b.blockNumber) {
                        return a.blockNumber - b.blockNumber;
                    }
                    return a.logIndex - b.logIndex;
                });
                
                const result = await processEventsBatch(chunkEvents);
                totalProcessed += result.processed;
                totalSkipped += result.skipped;
                totalErrors += result.errors;
            } else {
                // No events - increase batch size for faster scanning
                emptyChunksInRow++;
                if (emptyChunksInRow >= 3) {
                    currentBatchSize = currentBatchSize * BigInt(2);
                    if (currentBatchSize > MAX_BATCH) {
                        currentBatchSize = MAX_BATCH;
                    }
                    emptyChunksInRow = 0; // Reset counter
                }
            }
            
            // Show progress
            const progress = ((currentTo - START_BLOCK) * BigInt(100) / totalBlocks);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const batchInfo = currentBatchSize > BigInt(BATCH_SIZE) ? ` [Batch: ${currentBatchSize}]` : '';
            console.log(`  ✓ ${progress}% | Block ${currentTo} | Events: ${chunkEvents.length} | Processed: ${totalProcessed}${batchInfo} | Time: ${elapsed}s`);
            
            // Delay to avoid rate limits (much shorter delay for empty chunks)
            if (CHUNK_DELAY > 0 && currentTo < END_BLOCK) {
                const delay_ms = chunkEvents.length > 0 ? CHUNK_DELAY : Math.floor(CHUNK_DELAY / 10);
                await delay(delay_ms);
            }
            
        } catch (error) {
            console.error(`  ✗ Chunk ${currentFrom}-${currentTo} failed:`, error.message);
        }
        
        currentFrom = currentTo + BigInt(1);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Event fetch complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Results:`);
    console.log(`   ✅ Processed: ${totalProcessed}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log(`   ⏱️  Total Time: ${totalTime}s`);
    console.log('═══════════════════════════════════════\n');
}

// Run if called directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('initial-events-fetch.js')) {
    fetchHistoricalEvents()
        .then(() => {
            console.log('📝 Next step: Run "npm run check" to verify data\n');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { fetchHistoricalEvents };
