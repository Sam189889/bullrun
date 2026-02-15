import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'nft-controls.json');

// GET: Read current controls
export async function GET() {
    try {
        const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(fileContent);
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error reading NFT controls:', error);
        return NextResponse.json({ 
            pinnedNFTIds: [], 
            hiddenNFTIds: [] 
        });
    }
}

// POST: Update controls (pin/unpin/hide/show)
export async function POST(request: NextRequest) {
    try {
        const { action, nftId } = await request.json();

        // Read current config
        const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(fileContent);

        const id = Number(nftId);

        // Handle action
        switch (action) {
            case 'pin':
                if (!config.pinnedNFTIds.includes(id)) {
                    config.pinnedNFTIds.push(id);
                }
                break;

            case 'unpin':
                config.pinnedNFTIds = config.pinnedNFTIds.filter((n: number) => n !== id);
                break;

            case 'hide':
                if (!config.hiddenNFTIds.includes(id)) {
                    config.hiddenNFTIds.push(id);
                }
                break;

            case 'show':
                config.hiddenNFTIds = config.hiddenNFTIds.filter((n: number) => n !== id);
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Update timestamp
        config.lastUpdated = new Date().toISOString();

        // Save
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true, ...config });
    } catch (error) {
        console.error('Error updating NFT controls:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
