# Severity Classification System

**Feedback**: Add CRITICAL/MODERATE severity detection based on keywords in description.

**Keywords**:
**CRITICAL** (Red): no water, flush not working, very dirty, filthy, sewage, blocked, broken, unsafe, stinking, infection
**MODERATE** (Orange): dirty, needs cleaning, low water, water leaking, dim light, door issue, average
**Default**: LOW (Green)

**Plan**:
1. `src/utils/severityUtils.js` - `getSeverity(description)` returns 'CRITICAL'|'MODERATE'|'LOW'
2. `components/ComplaintCard.jsx` - Add severity badge + color
3. `src/pages/Dashboard.jsx` (user) - Update card with severity
4. `src/pages/AdminDashboard.jsx` - Update card with severity
5. AppContext `submitComplaint` - Auto-set severity

**Files to edit**:
- components/ComplaintCard.jsx
- pages/Dashboard.jsx  
- pages/AdminDashboard.jsx

Approve before proceeding?

