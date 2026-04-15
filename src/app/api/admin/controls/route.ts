import { NextRequest, NextResponse } from 'next/server';
import { query } from '@db/db';

// GET - Fetch admin controls
export async function GET() {
    try {
        // Create table if not exists
        await query(`
            CREATE TABLE IF NOT EXISTS admin_controls (
                id INT PRIMARY KEY DEFAULT 1,
                claim_rank_emi_enabled TINYINT(1) DEFAULT 1,
                claim_fast_bonus_enabled TINYINT(1) DEFAULT 1,
                claim_withdraw_enabled TINYINT(1) DEFAULT 1
            )
        `);

        const result = await query<{
            claim_rank_emi_enabled: number;
            claim_fast_bonus_enabled: number;
            claim_withdraw_enabled: number;
        }>('SELECT * FROM admin_controls LIMIT 1');

        // If no row exists, insert default values
        if (result.length === 0) {
            await query(
                `INSERT INTO admin_controls (id, claim_rank_emi_enabled, claim_fast_bonus_enabled, claim_withdraw_enabled) 
                 VALUES (1, 1, 1, 1)`
            );
            return NextResponse.json({
                claim_rank_emi_enabled: true,
                claim_fast_bonus_enabled: true,
                claim_withdraw_enabled: true
            });
        }

        return NextResponse.json({
            claim_rank_emi_enabled: result[0].claim_rank_emi_enabled === 1,
            claim_fast_bonus_enabled: result[0].claim_fast_bonus_enabled === 1,
            claim_withdraw_enabled: result[0].claim_withdraw_enabled === 1
        });
    } catch (error) {
        console.error('Error fetching admin controls:', error);
        // Return defaults on error
        return NextResponse.json({
            claim_rank_emi_enabled: true,
            claim_fast_bonus_enabled: true,
            claim_withdraw_enabled: true
        });
    }
}

// PUT - Update admin controls
export async function PUT(request: NextRequest) {
    try {
        // Create table if not exists
        await query(`
            CREATE TABLE IF NOT EXISTS admin_controls (
                id INT PRIMARY KEY DEFAULT 1,
                claim_rank_emi_enabled TINYINT(1) DEFAULT 1,
                claim_fast_bonus_enabled TINYINT(1) DEFAULT 1,
                claim_withdraw_enabled TINYINT(1) DEFAULT 1
            )
        `);

        const body = await request.json();
        const { claim_rank_emi_enabled, claim_fast_bonus_enabled, claim_withdraw_enabled } = body;

        // Update or insert
        await query(
            `INSERT INTO admin_controls (id, claim_rank_emi_enabled, claim_fast_bonus_enabled, claim_withdraw_enabled) 
             VALUES (1, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
                claim_rank_emi_enabled = ?, 
                claim_fast_bonus_enabled = ?, 
                claim_withdraw_enabled = ?`,
            [
                claim_rank_emi_enabled ? 1 : 0,
                claim_fast_bonus_enabled ? 1 : 0,
                claim_withdraw_enabled ? 1 : 0,
                claim_rank_emi_enabled ? 1 : 0,
                claim_fast_bonus_enabled ? 1 : 0,
                claim_withdraw_enabled ? 1 : 0
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating admin controls:', error);
        return NextResponse.json(
            { error: 'Failed to update controls' },
            { status: 500 }
        );
    }
}
