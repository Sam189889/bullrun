import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'nft-display-config.json');

// GET - Read config
export async function GET() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(configData);
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error reading NFT display config:', error);
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
}

// POST - Update config
export async function POST(request: NextRequest) {
    try {
        const updates = await request.json();

        // Read existing config
        const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(configData);

        // Merge updates
        const updatedConfig = {
            ...config,
            filters: { ...config.filters, ...updates.filters },
            sorting: { ...config.sorting, ...updates.sorting },
            display: { ...config.display, ...updates.display },
            marketplace: { ...config.marketplace, ...updates.marketplace },
            lastUpdated: new Date().toISOString(),
            updatedBy: updates.updatedBy || 'admin'
        };

        // Write back
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));

        return NextResponse.json({ success: true, config: updatedConfig });
    } catch (error) {
        console.error('Error updating NFT display config:', error);
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}
