import express from 'express';
import cors from 'cors';
import * as nftAPI from './admin-nfts.js';
import * as queueAPI from './queue-rules.js';
import * as userAPI from './admin-users.js';
import * as controlsAPI from './admin-controls.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================
// NFT ENDPOINTS
// ============================================================

// GET /api/user/nfts/:userId - Get user's NFTs
app.get('/api/user/nfts/:userId', asyncHandler(async (req, res) => {
    const filters = {
        sort_by: req.query.sort_by || 'nft_id',
        sort_order: req.query.sort_order || 'DESC'
    };

    const result = await nftAPI.getUserNFTs(req.params.userId, filters);
    res.json(result);
}));

// GET /api/marketplace/nfts - Get marketplace NFTs (excludes queued NFTs)
app.get('/api/marketplace/nfts', asyncHandler(async (req, res) => {
    const filters = {
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0,
        sort_by: req.query.sort_by || 'nft_id',
        sort_order: req.query.sort_order || 'DESC'
    };

    const result = await nftAPI.getMarketplaceNFTs(filters);
    res.json(result);
}));

// GET /api/admin/nfts - Get all NFTs
app.get('/api/admin/nfts', asyncHandler(async (req, res) => {
    const filters = {
        include_burned: req.query.include_burned === 'true',
        include_hidden: req.query.include_hidden !== 'false', // default true
        only_pinned: req.query.only_pinned === 'true',
        only_hidden: req.query.only_hidden === 'true',
        sort_by: req.query.sort_by || 'nft_id',
        sort_order: req.query.sort_order || 'DESC',
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
    };

    const result = await nftAPI.getAllNFTs(filters);
    res.json(result);
}));

// GET /api/admin/nfts/stats - Get NFT statistics
app.get('/api/admin/nfts/stats', asyncHandler(async (req, res) => {
    const stats = await nftAPI.getNFTStats();
    res.json(stats);
}));

// GET /api/admin/nfts/:nftId - Get single NFT
app.get('/api/admin/nfts/:nftId', asyncHandler(async (req, res) => {
    const nft = await nftAPI.getNFTById(req.params.nftId);
    res.json(nft);
}));

// PUT /api/admin/nfts/:nftId/hide - Hide/unhide NFT
app.put('/api/admin/nfts/:nftId/hide', asyncHandler(async (req, res) => {
    const result = await nftAPI.toggleNFTHidden(req.params.nftId, req.body);
    res.json(result);
}));

// PUT /api/admin/nfts/:nftId/pin - Pin/unpin NFT
app.put('/api/admin/nfts/:nftId/pin', asyncHandler(async (req, res) => {
    const result = await nftAPI.toggleNFTPinned(req.params.nftId, req.body);
    res.json(result);
}));

// POST /api/admin/nfts/bulk-pin - Reorder pinned NFTs
app.post('/api/admin/nfts/bulk-pin', asyncHandler(async (req, res) => {
    const result = await nftAPI.bulkReorderPins(req.body.pinned_nfts);
    res.json(result);
}));

// PUT /api/admin/nfts/:nftId/queue-override - Queue override
app.put('/api/admin/nfts/:nftId/queue-override', asyncHandler(async (req, res) => {
    const result = await nftAPI.setNFTQueueOverride(req.params.nftId, req.body);
    res.json(result);
}));

// PUT /api/admin/nfts/:nftId/notes - Update notes
app.put('/api/admin/nfts/:nftId/notes', asyncHandler(async (req, res) => {
    const result = await nftAPI.updateNFTNotes(req.params.nftId, req.body);
    res.json(result);
}));

// ============================================================
// QUEUE RULES ENDPOINTS
// ============================================================

// GET /api/admin/queue/rules - Get all queue rules
app.get('/api/admin/queue/rules', asyncHandler(async (req, res) => {
    const rules = await queueAPI.getAllQueueRules();
    res.json(rules);
}));

// GET /api/admin/queue/rules/:ruleId - Get single rule
app.get('/api/admin/queue/rules/:ruleId', asyncHandler(async (req, res) => {
    const rule = await queueAPI.getQueueRuleById(req.params.ruleId);
    res.json(rule);
}));

// POST /api/admin/queue/rules - Create rule
app.post('/api/admin/queue/rules', asyncHandler(async (req, res) => {
    const result = await queueAPI.createQueueRule(req.body);
    res.json(result);
}));

// PUT /api/admin/queue/rules/:ruleId - Update rule
app.put('/api/admin/queue/rules/:ruleId', asyncHandler(async (req, res) => {
    const result = await queueAPI.updateQueueRule(req.params.ruleId, req.body);
    res.json(result);
}));

// DELETE /api/admin/queue/rules/:ruleId - Delete rule
app.delete('/api/admin/queue/rules/:ruleId', asyncHandler(async (req, res) => {
    const result = await queueAPI.deleteQueueRule(req.params.ruleId);
    res.json(result);
}));

// PUT /api/admin/queue/rules/:ruleId/toggle - Toggle rule
app.put('/api/admin/queue/rules/:ruleId/toggle', asyncHandler(async (req, res) => {
    const result = await queueAPI.toggleQueueRule(req.params.ruleId, req.body.enabled);
    res.json(result);
}));

// POST /api/admin/queue/rules/reorder - Reorder rules
app.post('/api/admin/queue/rules/reorder', asyncHandler(async (req, res) => {
    const result = await queueAPI.reorderQueueRules(req.body.rules);
    res.json(result);
}));

// GET /api/admin/queue/affected-users/:ruleId - Get affected users
app.get('/api/admin/queue/affected-users/:ruleId', asyncHandler(async (req, res) => {
    const result = await queueAPI.getAffectedUsers(req.params.ruleId);
    res.json(result);
}));

// GET /api/admin/queue/stats - Get queue stats
app.get('/api/admin/queue/stats', asyncHandler(async (req, res) => {
    const stats = await queueAPI.getQueueStats();
    res.json(stats);
}));

// ============================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================

// GET /api/admin/users/search - Search users
app.get('/api/admin/users/search', asyncHandler(async (req, res) => {
    const searchTerm = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    const results = await userAPI.searchUsers(searchTerm, limit);
    res.json(results);
}));

// GET /api/admin/users/:userId/queue-status - Get user queue status
app.get('/api/admin/users/:userId/queue-status', asyncHandler(async (req, res) => {
    const status = await userAPI.getUserQueueStatus(req.params.userId);
    res.json(status);
}));

// PUT /api/admin/users/:userId/queue-slots - Update user queue slots
app.put('/api/admin/users/:userId/queue-slots', asyncHandler(async (req, res) => {
    const { queue_slots } = req.body;
    const result = await userAPI.updateUserQueueSlots(req.params.userId, queue_slots);
    res.json(result);
}));

// ============================================================
// ADMIN CONTROLS ENDPOINTS
// ============================================================

// GET /api/admin/controls - Get all controls
app.get('/api/admin/controls', asyncHandler(async (req, res) => {
    const controls = await controlsAPI.getAllControls();
    res.json(controls);
}));

// GET /api/admin/controls/:controlKey - Get single control
app.get('/api/admin/controls/:controlKey', asyncHandler(async (req, res) => {
    const control = await controlsAPI.getControl(req.params.controlKey);
    res.json(control);
}));

// PUT /api/admin/controls/:controlKey - Update control
app.put('/api/admin/controls/:controlKey', asyncHandler(async (req, res) => {
    const result = await controlsAPI.updateControl(req.params.controlKey, req.body);
    res.json(result);
}));

// POST /api/admin/controls - Create control
app.post('/api/admin/controls', asyncHandler(async (req, res) => {
    const result = await controlsAPI.createControl(req.body);
    res.json(result);
}));

// DELETE /api/admin/controls/:controlKey - Delete control
app.delete('/api/admin/controls/:controlKey', asyncHandler(async (req, res) => {
    const result = await controlsAPI.deleteControl(req.params.controlKey);
    res.json(result);
}));

// GET /api/admin/controls/claim - Get claim controls
app.get('/api/admin/controls/claim', asyncHandler(async (req, res) => {
    const controls = await controlsAPI.getClaimControls();
    res.json(controls);
}));

// PUT /api/admin/controls/claim/:claimType - Toggle claim control
app.put('/api/admin/controls/claim/:claimType', asyncHandler(async (req, res) => {
    const result = await controlsAPI.toggleClaimControl(req.params.claimType, req.body);
    res.json(result);
}));

// GET /api/admin/controls/queue - Get queue controls
app.get('/api/admin/controls/queue', asyncHandler(async (req, res) => {
    const controls = await controlsAPI.getQueueControls();
    res.json(controls);
}));

// PUT /api/admin/controls/queue/:setting - Update queue control
app.put('/api/admin/controls/queue/:setting', asyncHandler(async (req, res) => {
    const result = await controlsAPI.updateQueueControl(req.params.setting, req.body);
    res.json(result);
}));

// GET /api/admin/controls/nft - Get NFT controls
app.get('/api/admin/controls/nft', asyncHandler(async (req, res) => {
    const controls = await controlsAPI.getNFTControls();
    res.json(controls);
}));

// PUT /api/admin/controls/nft/:feature - Toggle NFT control
app.put('/api/admin/controls/nft/:feature', asyncHandler(async (req, res) => {
    const result = await controlsAPI.toggleNFTControl(req.params.feature, req.body);
    res.json(result);
}));

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: err.message || 'Internal server error',
        success: false
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`🚀 Admin API Server running on http://localhost:${PORT}`);
    console.log(`📊 NFT endpoints: http://localhost:${PORT}/api/admin/nfts`);
    console.log(`🎯 Queue endpoints: http://localhost:${PORT}/api/admin/queue/rules`);
    console.log(`👤 User endpoints: http://localhost:${PORT}/api/admin/users`);
});

export default app;
