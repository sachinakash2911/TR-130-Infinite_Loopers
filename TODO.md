# Fix Issue Detection - Show All Issues + Sanitization

**Information Gathered:**
- `src/utils/complaintUtils.js`: `extractTags()` gets multiple tags, `detectIssueType()` returns only 1st
- `src/pages/ReportPage.jsx`: Displays single issue type in UI
- ReportPage calls `detectIssueType(description)` - shows one issue only

**Plan Complete:**
1. **src/utils/complaintUtils.js** ✓:
   - 'Cleanliness' → 'Sanitization' updated
   - `getAllIssueTypes()` added returning all tags
2. **src/pages/ReportPage.jsx** ✓:
   - UI now shows all issues: `getAllIssueTypes().join(', ')`
   - Import updated
3. **Next:** Test + `npm run dev`

**Follow-up steps:**
- Test ReportPage with sentence mentioning multiple issues (e.g. "no water and dirty")
- Run `npm run dev` to verify
- Update TODO on completion

Approve plan before edits?

