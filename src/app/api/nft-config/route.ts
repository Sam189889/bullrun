import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'data', 'nft-config.json');

// GET - Read NFT config
export async function GET() {
    try {
        const data = fs.readFileSync(configPath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch {
        return NextResponse.json({
            featuredNfts: [],
            hiddenNfts: [],
            displayOrder: {},
            sortMode: 'price_low_high'
        });
    }
}

// POST - Update NFT config (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate structure
        const config = {
            featuredNfts: Array.isArray(body.featuredNfts) ? body.featuredNfts : [],
            hiddenNfts: Array.isArray(body.hiddenNfts) ? body.hiddenNfts : [],
            displayOrder: typeof body.displayOrder === 'object' ? body.displayOrder : {},
            sortMode: body.sortMode || 'price_low_high'
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true, config });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}
