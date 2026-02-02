import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'public/config/marketplace-config.json');

// GET - Read current config
export async function GET() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(configData);

        return NextResponse.json({
            success: true,
            config,
        });
    } catch (error: any) {
        console.error('Error reading marketplace config:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Update config
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { hideUserId1, defaultSort } = body;

        // Validate hideUserId1
        if (hideUserId1 !== undefined && typeof hideUserId1 !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'hideUserId1 must be boolean' },
                { status: 400 }
            );
        }

        // Validate defaultSort
        if (defaultSort !== undefined && typeof defaultSort !== 'string') {
            return NextResponse.json(
                { success: false, error: 'defaultSort must be string' },
                { status: 400 }
            );
        }

        const validSorts = ['newest', 'oldest', 'price-low', 'price-high', 'sales-low', 'sales-high'];
        if (defaultSort && !validSorts.includes(defaultSort)) {
            return NextResponse.json(
                { success: false, error: 'Invalid sort option' },
                { status: 400 }
            );
        }

        // Read current config
        const currentConfigData = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const currentConfig = JSON.parse(currentConfigData);

        // Create updated config (merge with existing)
        const updatedConfig = {
            ...currentConfig,
            hideUserId1: hideUserId1 ?? currentConfig.hideUserId1 ?? true,
            defaultSort: defaultSort ?? currentConfig.defaultSort ?? 'newest',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin',
        };

        // Write to file
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));

        return NextResponse.json({
            success: true,
            message: 'Marketplace config updated successfully',
            config: updatedConfig,
        });
    } catch (error: any) {
        console.error('Error updating marketplace config:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
