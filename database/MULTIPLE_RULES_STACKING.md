# 🎯 Multiple Rules Stacking - Complete Guide

## ✅ **How It Works:**

### **ADDITIVE SYSTEM** (All matching rules combine)

When multiple rules match, their `queue_slots` values **ADD TOGETHER**:

```
Total Queue Slots = Rule1 + Rule2 + Rule3 + ...
```

**Negative values** = Remove from queue (list more NFTs)  
**Positive values** = Add to queue (hide more NFTs)  
**Zero** = No change

---

## 📊 **Real Example:**

### **User Stats:**
- Direct Referrals: 12
- Total Earned: $1,500 USDT
- Package Level: 3

### **Active Rules:**
1. **Default Queue** (Priority 10)
   - Condition: None (always matches)
   - Slots: `+2` (2 oldest NFTs in queue)

2. **10 Directs Bonus** (Priority 70)
   - Condition: 10-19 direct referrals
   - Slots: `-10` (remove 10 from queue)

3. **$500 Earnings Tier** (Priority 80)
   - Condition: $500-999 earned
   - Slots: `-5` (remove 5 from queue)

4. **$1000 Earnings Tier** (Priority 85)
   - Condition: $1000-2499 earned
   - Slots: `-10` (remove 10 from queue)

### **Calculation:**

```javascript
Step 1: Default Queue          → +2  (matched)
Step 2: 10 Directs Bonus       → -10 (matched: has 12 directs)
Step 3: $500 Tier              → -5  (matched: has $1500)
Step 4: $1000 Tier             → -10 (matched: has $1500)

Total = 2 + (-10) + (-5) + (-10) = -23
Final = max(0, -23) = 0  ← No queue! All NFTs listed!
```

### **Console Output:**
```
🔄 Queue evaluated: User 5 → Rules: [Default Queue(+2), 10 Directs Bonus(-10), $500 Tier(-5), $1000 Tier(-10)] = 0 in queue, 25 listed
```

---

## 🎮 **Example Scenarios:**

### **Scenario 1: New User**
**Stats:**
- Directs: 0
- Earned: $0
- Registered: Today

**Matching Rules:**
- Default Queue: `+2`

**Result:** `2 NFTs in queue, rest listed`

---

### **Scenario 2: Active User**
**Stats:**
- Directs: 15
- Earned: $800
- Package: Level 2

**Matching Rules:**
- Default Queue: `+2`
- 10 Directs (10-19): `-10`
- $500 Tier ($500-999): `-5`

**Calculation:**
```
2 + (-10) + (-5) = -13
Final = max(0, -13) = 0
```
**Result:** `All NFTs listed (no queue)`

---

### **Scenario 3: VIP User**
**Stats:**
- Directs: 25
- Earned: $3,000
- Package: Level 4

**Matching Rules:**
- Default Queue: `+2`
- 20 Directs (20-29): `-15`
- $2500 Tier ($2500-4999): `-20`

**Calculation:**
```
2 + (-15) + (-20) = -33
Final = max(0, -33) = 0
```
**Result:** `All NFTs listed (no queue)`

---

### **Scenario 4: Whale User**
**Stats:**
- Directs: 50
- Earned: $10,000
- Package: Level 5

**Matching Rules:**
- Default Queue: `+2`
- 50 Directs (50+): `-50`
- $10k VIP Tier: `-999` (unlimited)

**Calculation:**
```
2 + (-50) + (-999) = -1047
Final = max(0, -1047) = 0
```
**Result:** `All NFTs listed (no queue)`

---

## 📋 **SQL Examples:**

### **Example 1: Tier-based System**

```sql
-- Default: 2 in queue
INSERT INTO queue_rules VALUES (
    NULL, 'Default Queue', 'custom', TRUE, 10,
    '{"queue_slots": 2}',
    NOW(), NOW()
);

-- Tier 1: $500+ → Remove 5
INSERT INTO queue_rules VALUES (
    NULL, 'Tier 1: $500', 'earnings_based', TRUE, 70,
    '{"min_earnings": 500, "max_earnings": 999, "slots_removed": -5}',
    NOW(), NOW()
);

-- Tier 2: $1000+ → Remove 10 more
INSERT INTO queue_rules VALUES (
    NULL, 'Tier 2: $1000', 'earnings_based', TRUE, 75,
    '{"min_earnings": 1000, "max_earnings": 2499, "slots_removed": -10}',
    NOW(), NOW()
);

-- Tier 3: $2500+ → Remove 20 more
INSERT INTO queue_rules VALUES (
    NULL, 'Tier 3: $2500', 'earnings_based', TRUE, 80,
    '{"min_earnings": 2500, "slots_removed": -20}',
    NOW(), NOW()
);
```

**User with $1500 earned:**
- Default: `+2`
- Tier 1 ($500): `-5`
- Tier 2 ($1000): `-10`
- **Total: `2 - 5 - 10 = -13 → 0 queue slots`**

---

### **Example 2: Multiple Condition Stacking**

```sql
-- Rule 1: 10+ Directs
INSERT INTO queue_rules VALUES (
    NULL, '10 Directs', 'direct_based', TRUE, 60,
    '{"min_directs": 10, "max_directs": 19, "queue_slots": -10}',
    NOW(), NOW()
);

-- Rule 2: 20+ Directs (STACKS with above!)
INSERT INTO queue_rules VALUES (
    NULL, '20 Directs Bonus', 'direct_based', TRUE, 65,
    '{"min_directs": 20, "max_directs": 29, "queue_slots": -10}',
    NOW(), NOW()
);

-- Rule 3: 30+ Directs (STACKS again!)
INSERT INTO queue_rules VALUES (
    NULL, '30 Directs VIP', 'direct_based', TRUE, 70,
    '{"min_directs": 30, "queue_slots": -15}',
    NOW(), NOW()
);
```

**User with 35 directs:**
- Default: `+2`
- 10 Directs: `❌ Not matched` (has 35, out of 10-19 range)
- 20 Directs: `❌ Not matched` (has 35, out of 20-29 range)
- 30 Directs: `-15` ✅
- **Total: `2 - 15 = -13 → 0 queue slots`**

**⚠️ Issue:** Ranges prevent stacking!

**✅ Better Design: Cumulative Bonuses**

```sql
-- Rule 1: 10+ Directs
INSERT INTO queue_rules VALUES (
    NULL, '10+ Directs', 'custom', TRUE, 60,
    '{"conditions": [{"field": "direct_referrals_count", "operator": ">=", "value": 10}], "match": "all", "queue_slots": -10}',
    NOW(), NOW()
);

-- Rule 2: 20+ Directs (ADDS to above)
INSERT INTO queue_rules VALUES (
    NULL, '20+ Directs Bonus', 'custom', TRUE, 65,
    '{"conditions": [{"field": "direct_referrals_count", "operator": ">=", "value": 20}], "match": "all", "queue_slots": -10}',
    NOW(), NOW()
);

-- Rule 3: 30+ Directs (ADDS again)
INSERT INTO queue_rules VALUES (
    NULL, '30+ Directs VIP', 'custom', TRUE, 70,
    '{"conditions": [{"field": "direct_referrals_count", "operator": ">=", "value": 30}], "match": "all", "queue_slots": -15}',
    NOW(), NOW()
);
```

**User with 35 directs:**
- Default: `+2`
- 10+ Directs: `-10` ✅
- 20+ Directs: `-10` ✅
- 30+ Directs: `-15` ✅
- **Total: `2 - 10 - 10 - 15 = -33 → 0 queue slots`**

---

## 🎯 **Best Practices:**

### **1. Use `>=` for Cumulative Bonuses**
```json
// ✅ GOOD - Stacks properly
{"field": "direct_referrals_count", "operator": ">=", "value": 10}
{"field": "direct_referrals_count", "operator": ">=", "value": 20}
{"field": "direct_referrals_count", "operator": ">=", "value": 30}

// ❌ BAD - Won't stack (ranges)
{"min_directs": 10, "max_directs": 19}
{"min_directs": 20, "max_directs": 29}
```

### **2. Set Proper Priorities**
Higher priority rules evaluated first, but ALL matching rules apply:
- Default: 10
- Basic tiers: 50-70
- Advanced tiers: 75-85
- VIP tiers: 90-95
- Special bonuses: 100

### **3. Use Negative Slots to Remove from Queue**
```json
"queue_slots": -10  // Remove 10 from queue
"queue_slots": -5   // Remove 5 from queue
"queue_slots": 0    // No queue (unlimited)
"queue_slots": 2    // Add 2 to queue
```

---

## 🔍 **Debugging:**

Check which rules applied:
```javascript
// Console output shows all applied rules:
🔄 Queue evaluated: User 5 → Rules: [Default(+2), 10 Directs(-10), $500 Tier(-5)] = 0 in queue, 25 listed
```

View active rules:
```sql
SELECT 
    rule_id,
    rule_name,
    priority,
    JSON_PRETTY(config) as config,
    enabled
FROM queue_rules 
WHERE enabled = TRUE
ORDER BY priority DESC;
```

---

## ✅ **Summary:**

| Feature | Status |
|---------|--------|
| Multiple rules can match | ✅ YES |
| Rules stack additively | ✅ YES |
| Negative values remove from queue | ✅ YES |
| Priority affects order | ✅ YES (eval order) |
| All matching rules apply | ✅ YES |
| Console shows applied rules | ✅ YES |

**Example:**
```
User: 15 directs, $1200 earned
Rules matched:
  - Default: +2
  - 10+ Directs: -10
  - $500 Tier: -5
  - $1000 Tier: -10
Total: 2 - 10 - 5 - 10 = -23 → 0 queue slots ✅
```

**Sare rules ek saath lag jayenge!** 💪🎯
