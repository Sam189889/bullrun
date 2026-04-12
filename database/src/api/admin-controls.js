import { query } from '../db.js';

/**
 * Admin Controls API Endpoints
 * Manage feature toggles and system settings
 */

/**
 * GET /api/admin/controls - Get all admin controls
 */
export async function getAllControls() {
    const controls = await query(
        'SELECT control_key, control_value, description, updated_at FROM admin_controls ORDER BY control_key'
    );
    
    // Group controls by category
    const grouped = controls.reduce((acc, control) => {
        const [category, ...rest] = control.control_key.split('_');
        const key = rest.join('_');
        
        if (!acc[category]) {
            acc[category] = {};
        }
        
        acc[category][key] = {
            value: control.control_value,
            description: control.description,
            updated_at: control.updated_at
        };
        
        return acc;
    }, {});
    
    return grouped;
}

/**
 * GET /api/admin/controls/:controlKey - Get single control
 */
export async function getControl(controlKey) {
    const [control] = await query(
        'SELECT control_key, control_value, description, updated_at FROM admin_controls WHERE control_key = ?',
        [controlKey]
    );
    
    if (!control) {
        throw new Error(`Control ${controlKey} not found`);
    }
    
    return control;
}

/**
 * PUT /api/admin/controls/:controlKey - Update control value
 */
export async function updateControl(controlKey, { value, description }) {
    // Check if control exists
    const [existing] = await query(
        'SELECT control_key FROM admin_controls WHERE control_key = ?',
        [controlKey]
    );
    
    if (!existing) {
        throw new Error(`Control ${controlKey} not found`);
    }
    
    const sql = `
        UPDATE admin_controls 
        SET control_value = ?, 
            description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE control_key = ?
    `;
    
    await query(sql, [value, description || null, controlKey]);
    
    return {
        success: true,
        control_key: controlKey,
        value,
        description
    };
}

/**
 * POST /api/admin/controls - Create new control
 */
export async function createControl({ control_key, control_value, description }) {
    // Check if control already exists
    const [existing] = await query(
        'SELECT control_key FROM admin_controls WHERE control_key = ?',
        [control_key]
    );
    
    if (existing) {
        throw new Error(`Control ${control_key} already exists`);
    }
    
    await query(
        'INSERT INTO admin_controls (control_key, control_value, description) VALUES (?, ?, ?)',
        [control_key, control_value, description || null]
    );
    
    return {
        success: true,
        control_key,
        value: control_value,
        description
    };
}

/**
 * DELETE /api/admin/controls/:controlKey - Delete control
 */
export async function deleteControl(controlKey) {
    const [result] = await query(
        'DELETE FROM admin_controls WHERE control_key = ?',
        [controlKey]
    );
    
    if (result.affectedRows === 0) {
        throw new Error(`Control ${controlKey} not found`);
    }
    
    return {
        success: true,
        control_key: controlKey
    };
}

/**
 * GET /api/admin/controls/claim - Get all claim-related controls
 */
export async function getClaimControls() {
    const controls = await query(
        `SELECT control_key, control_value, description 
         FROM admin_controls 
         WHERE control_key LIKE 'claim_%' 
         ORDER BY control_key`
    );
    
    return controls.reduce((acc, control) => {
        const key = control.control_key.replace('claim_', '');
        acc[key] = {
            enabled: control.control_value === 'true',
            description: control.description
        };
        return acc;
    }, {});
}

/**
 * PUT /api/admin/controls/claim/:claimType - Toggle claim control
 */
export async function toggleClaimControl(claimType, { enabled }) {
    const controlKey = `claim_${claimType}`;
    const value = enabled ? 'true' : 'false';
    
    return await updateControl(controlKey, { value });
}

/**
 * GET /api/admin/controls/queue - Get all queue-related controls
 */
export async function getQueueControls() {
    const controls = await query(
        `SELECT control_key, control_value, description 
         FROM admin_controls 
         WHERE control_key LIKE 'queue_%' 
         ORDER BY control_key`
    );
    
    return controls.reduce((acc, control) => {
        const key = control.control_key.replace('queue_', '');
        acc[key] = {
            value: control.control_value,
            description: control.description
        };
        return acc;
    }, {});
}

/**
 * PUT /api/admin/controls/queue/:setting - Update queue control
 */
export async function updateQueueControl(setting, { value }) {
    const controlKey = `queue_${setting}`;
    
    return await updateControl(controlKey, { value });
}

/**
 * GET /api/admin/controls/nft - Get all NFT-related controls
 */
export async function getNFTControls() {
    const controls = await query(
        `SELECT control_key, control_value, description 
         FROM admin_controls 
         WHERE control_key LIKE 'nft_%' 
         ORDER BY control_key`
    );
    
    return controls.reduce((acc, control) => {
        const key = control.control_key.replace('nft_', '');
        acc[key] = {
            enabled: control.control_value === 'true',
            description: control.description
        };
        return acc;
    }, {});
}

/**
 * PUT /api/admin/controls/nft/:feature - Toggle NFT control
 */
export async function toggleNFTControl(feature, { enabled }) {
    const controlKey = `nft_${feature}`;
    const value = enabled ? 'true' : 'false';
    
    return await updateControl(controlKey, { value });
}
