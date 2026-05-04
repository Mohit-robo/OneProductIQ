# Lessons Learned: UI Theme Synchronization

## UI Redesign Coordination (2026-05-03)
**Critical dependency discovered**: All visual changes require synchronized updates across the CSS ecosystem.

### Key Files & Dependencies:
1. **demo-app-client/src/index.css**  
   - Contains base theme definitions (slate-50 background, indigo accents)
   - Defines component styles (.panel, .field-group, .preview-box, .button-row)
   - *Must be updated simultaneously with any UI component changes*

2. **demo-app-client/src/App.jsx**  
   - Main UI component that references CSS classes
   - Requires matching class names/structure from index.css

3. **docs/todo.md**  
   - Must track CSS synchronization tasks as dependencies

### Consequences of Misalignment:
- **Visual regressions** when JSX updates don't match CSS classes
- **Broken styling** when theme variables change without CSS updates
- **Inconsistent user experience** across UI components

### Best Practice: Theme Synchronization Protocol
1. **At design initiation**: Identify all affected files (JSX, CSS, config)
2. **At code changes**: Verify CSS class names match index.css definitions
3. **At visual updates**: Check that theme variables (colors, spacing) are updated in index.css
4. **At final review**: Confirm CSS modifications align with new UI specifications

### Lessons Learned:
- UI redesigns are **system-wide operations**, not isolated component changes
- **index.css acts as the central theme registry** - all visual changes flow through it
- Failing to synchronize CSS causes **immediate visual breakdowns** that are hard to trace
- **Document CSS dependencies** in todo.md when making UI-related changes

> *Moving forward: All UI-related tasks must reference CSS synchronization requirements in their task descriptions to prevent recurrence of this issue.*