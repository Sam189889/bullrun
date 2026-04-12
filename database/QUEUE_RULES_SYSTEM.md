# 🎯 Global Queue Rules System Design

## ✅ **MySQL Fully Supports This!**

Yes bhai, MySQL mein **JSON columns** aur **dynamic rule evaluation** easily ho sakta hai!

---

## 📋 **Schema Design:**

### **queue_rules Table (Already Created):**
```sql
CREATE TABLE queue_rules (
    rule_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    
    -- Condition (JSON)
    condition_type ENUM(
        'user_registered',
        'package_purchased', 
        'earnings_threshold',
        'direct_referrals',
        'nft_ownership',
        'rank_achieved',
        'custom'
    ) NOT NULL,
    
    condition_params JSON NOT NULL,
    
    -- Action
    queue_slots INT UNSIGNED DEFAULT 0,
    priority INT UNSIGNED DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_priority (priority)
);
```

---

## 🎯 **Rule Examples:**

### **1. No Queue - New User + Package Purchased**
```sql
INSERT INTO queue_rules (
    rule_name,
    rule_description,
    condition_type,
    condition_params,
    queue_slots,
    priority,
    is_active
) VALUES (
    'New User Bonus',
    'User just registered and purchased package = No Queue',
    'package_purchased',
    JSON_OBJECT(
        'min_package_level', 1,
        'max_days_since_registration', 1
    ),
    999,  -- Unlimited queue slots
    100,  -- Highest priority
    TRUE
);
```

### **2. Earned $500 → X NFTs in Queue**
```sql
INSERT INTO queue_rules (
    rule_name,
    rule_description,
    condition_type,
    condition_params,
    queue_slots,
    priority
) VALUES (
    'Earnings $500 Tier',
    'User earned $500 = 5 NFTs in queue',
    'earnings_threshold',
    JSON_OBJECT(
        'min_earnings', 500,
        'max_earnings', 999.99
    ),
    5,    -- 5 queue slots
    80    -- High priority
);
```

### **3. X Direct Referrals → Y in Queue**
```sql
INSERT INTO queue_rules (
    rule_name,
    rule_description,
    condition_type,
    condition_params,
    queue_slots,
    priority
) VALUES (
    '10 Directs = 10 Queue',
    'User has 10 direct referrals = 10 NFTs in queue',
    'direct_referrals',
    JSON_OBJECT(
        'min_referrals', 10,
        'max_referrals', 19
    ),
    10,   -- 10 queue slots
    70
);
```

### **4. Earned $XXXX → Z in Queue**
```sql
INSERT INTO queue_rules (
    rule_name,
    rule_description,
    condition_type,
    condition_params,
    queue_slots,
    priority
) VALUES (
    'Earnings $5000+ VIP',
    'User earned $5000+ = 20 NFTs in queue',
    'earnings_threshold',
    JSON_OBJECT(
        'min_earnings', 5000
    ),
    20,   -- 20 queue slots
    90    -- Very high priority
);
```

### **5. Custom Rule (Admin can add):**
```sql
INSERT INTO queue_rules (
    rule_name,
    rule_description,
    condition_type,
    condition_params,
    queue_slots,
    priority
) VALUES (
    'Whale Tier',
    'Package Level 5 + 50 Directs + $10k Earnings',
    'custom',
    JSON_OBJECT(
        'min_package_level', 5,
        'min_direct_referrals', 50,
        'min_earnings', 10000
    ),
    50,   -- 50 queue slots!
    95    -- Highest tier
);
```

---

## 🔍 **Rule Evaluation Logic:**

### **JavaScript Code (queue-manager.js):**

```javascript
async function evaluateQueueRules(userId) {
    try {
        // 1. Get user stats
        const [userStats] = await query(
            `SELECT 
                u.user_id,
                u.total_earned,
                u.created_at,
                COUNT(DISTINCT r.user_id) as direct_referrals,
                MAX(ue.package_level) as package_level
             FROM users u
             LEFT JOIN users r ON r.referrer_id = u.user_id
             LEFT JOIN user_earnings ue ON ue.user_id = u.user_id
             WHERE u.user_id = ?
             GROUP BY u.user_id`,
            [userId]
        );
        
        if (!userStats) return;
        
        // 2. Get all active rules (ordered by priority DESC)
        const rules = await query(
            `SELECT * FROM queue_rules 
             WHERE is_active = TRUE 
             ORDER BY priority DESC`
        );
        
        // 3. Find matching rule with highest priority
        let matchedRule = null;
        let maxQueueSlots = 0;
        
        for (const rule of rules) {
            const params = JSON.parse(rule.condition_params);
            let matches = false;
            
            switch (rule.condition_type) {
                case 'package_purchased':
                    const daysSinceReg = (Date.now() - new Date(userStats.created_at)) / (1000 * 60 * 60 * 24);
                    matches = userStats.package_level >= params.min_package_level &&
                              daysSinceReg <= params.max_days_since_registration;
                    break;
                    
                case 'earnings_threshold':
                    const earnings = parseFloat(userStats.total_earned || 0);
                    matches = earnings >= params.min_earnings &&
                              (!params.max_earnings || earnings <= params.max_earnings);
                    break;
                    
                case 'direct_referrals':
                    matches = userStats.direct_referrals >= params.min_referrals &&
                              (!params.max_referrals || userStats.direct_referrals <= params.max_referrals);
                    break;
                    
                case 'custom':
                    // All conditions must match
                    matches = true;
                    if (params.min_package_level && userStats.package_level < params.min_package_level) matches = false;
                    if (params.min_direct_referrals && userStats.direct_referrals < params.min_direct_referrals) matches = false;
                    if (params.min_earnings && parseFloat(userStats.total_earned) < params.min_earnings) matches = false;
                    break;
            }
            
            if (matches && rule.queue_slots > maxQueueSlots) {
                matchedRule = rule;
                maxQueueSlots = rule.queue_slots;
            }
        }
        
        // 4. Apply the rule
        const queueSlots = maxQueueSlots || 0; // Default 0 if no rule matches
        
        // ... rest of queue logic (get user NFTs, sort, update queue status)
        
        console.log(`🎯 Rule Applied: ${matchedRule?.rule_name || 'None'} → ${queueSlots} slots for User ${userId}`);
        
    } catch (error) {
        console.error(`❌ Queue rule evaluation failed:`, error);
    }
}
```

---

## 📊 **Default Rules (Initial Data):**

```sql
-- Rule 1: New User Advantage (First 24 hours)
INSERT INTO queue_rules VALUES (
    1, 'New User Bonus', 'User registered + package in first 24h = unlimited queue',
    'package_purchased',
    '{"min_package_level": 1, "max_days_since_registration": 1}',
    999, 100, TRUE, NOW(), NOW()
);

-- Rule 2: $500 Tier
INSERT INTO queue_rules VALUES (
    2, 'Earnings $500 Tier', 'Earned $500-999 = 5 queue slots',
    'earnings_threshold',
    '{"min_earnings": 500, "max_earnings": 999.99}',
    5, 80, TRUE, NOW(), NOW()
);

-- Rule 3: $1000 Tier
INSERT INTO queue_rules VALUES (
    3, 'Earnings $1000 Tier', 'Earned $1000-2499 = 10 queue slots',
    'earnings_threshold',
    '{"min_earnings": 1000, "max_earnings": 2499.99}',
    10, 85, TRUE, NOW(), NOW()
);

-- Rule 4: 10 Direct Referrals
INSERT INTO queue_rules VALUES (
    4, '10 Direct Referrals', '10+ direct referrals = 10 queue slots',
    'direct_referrals',
    '{"min_referrals": 10, "max_referrals": 19}',
    10, 70, TRUE, NOW(), NOW()
);

-- Rule 5: $5000 VIP Tier
INSERT INTO queue_rules VALUES (
    5, 'Earnings $5000+ VIP', 'Earned $5000+ = 20 queue slots',
    'earnings_threshold',
    '{"min_earnings": 5000}',
    20, 90, TRUE, NOW(), NOW()
);

-- Rule 6: Default (No rule matched)
INSERT INTO queue_rules VALUES (
    6, 'Default - No Queue', 'Fallback: No queue slots',
    'custom',
    '{}',
    0, 0, TRUE, NOW(), NOW()
);
```

---

## 🎛️ **Admin Controls:**

### **Add New Rule (API/Admin Panel):**
```javascript
async function addQueueRule(ruleName, description, conditionType, conditionParams, queueSlots, priority) {
    await query(
        `INSERT INTO queue_rules 
         (rule_name, rule_description, condition_type, condition_params, queue_slots, priority, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [ruleName, description, conditionType, JSON.stringify(conditionParams), queueSlots, priority]
    );
}
```

### **Update Rule:**
```javascript
async function updateQueueRule(ruleId, updates) {
    const { ruleName, conditionParams, queueSlots, priority, isActive } = updates;
    
    await query(
        `UPDATE queue_rules SET
         rule_name = COALESCE(?, rule_name),
         condition_params = COALESCE(?, condition_params),
         queue_slots = COALESCE(?, queue_slots),
         priority = COALESCE(?, priority),
         is_active = COALESCE(?, is_active),
         updated_at = NOW()
         WHERE rule_id = ?`,
        [ruleName, JSON.stringify(conditionParams), queueSlots, priority, isActive, ruleId]
    );
}
```

### **Delete Rule:**
```javascript
async function deleteQueueRule(ruleId) {
    // Soft delete
    await query(`UPDATE queue_rules SET is_active = FALSE WHERE rule_id = ?`, [ruleId]);
    
    // Or hard delete
    // await query(`DELETE FROM queue_rules WHERE rule_id = ?`, [ruleId]);
}
```

---

## ✅ **Benefits:**

1. **Dynamic:** Admin can add/edit rules without code changes
2. **Flexible:** JSON params allow any condition
3. **Priority-based:** Highest priority rule wins
4. **Scalable:** MySQL handles JSON queries efficiently
5. **Auditable:** All rules logged with timestamps

---

## 🚀 **MySQL JSON Query Examples:**

```sql
-- Get all rules with min_earnings > 1000
SELECT * FROM queue_rules 
WHERE JSON_EXTRACT(condition_params, '$.min_earnings') > 1000;

-- Get rules for direct referrals
SELECT * FROM queue_rules 
WHERE condition_type = 'direct_referrals'
  AND JSON_EXTRACT(condition_params, '$.min_referrals') <= 10;

-- Update a JSON field
UPDATE queue_rules 
SET condition_params = JSON_SET(condition_params, '$.min_earnings', 2000)
WHERE rule_id = 2;
```

---

## 📝 **Summary:**

**YES! MySQL fully supports this system:**
- ✅ JSON columns for flexible conditions
- ✅ Dynamic rule evaluation
- ✅ Admin can add/edit rules anytime
- ✅ Priority-based matching
- ✅ No code changes needed

**Aapke sare examples implement ho sakte hain!** 💪🎯
