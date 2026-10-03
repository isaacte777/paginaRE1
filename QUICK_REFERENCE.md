# FlowLab - Quick Reference Guide

> **Status**: ✓ Production Ready  
> **Last Updated**: 2026-10-03  
> **Team**: Claude Code + Qwen Coder

---

## 🚀 Quick Start

### Launch FlowLab
```
http://localhost/paginaRE/coordination.html
```

### View Architecture
```
http://localhost/paginaRE/modules-dashboard.html
```

### Read Documentation
```
C:\xampp\htdocs\paginaRE\ARCHITECTURE.md
```

---

## 📁 File Structure at a Glance

```
paginaRE/
├── coordination.html          ← START HERE
├── ARCHITECTURE.md            ← Full documentation
├── modules-dashboard.html     ← Module overview
│
├── css/                       4 files (18.3 KB total)
│   ├── theme.css              Colors & animations
│   ├── layout.css             Structure & responsive
│   ├── nodes.css              Node styling
│   └── ui.css                 UI components
│
└── js/                        17 files (organized by function)
    ├── core/                  Configuration & state
    ├── utils/                 Helper functions
    ├── canvas/                Drawing & rendering
    ├── interaction/           User input handling
    ├── features/              Advanced features
    ├── ui/                    Visual components
    └── app.js                 Main orchestrator
```

---

## 🔌 Module Dependencies

### Loading Order (CRITICAL - DO NOT CHANGE)

```
1. constants.js
2. state.js
   ↓
3. helpers.js
4. storage.js
   ↓
5. render.js
6. viewport.js
7. minimap.js
   ↓
8. gestures.js
9. selection.js
10. editing.js
    ↓
11. history.js
12. templates.js
13. export.js
14. execution.js
    ↓
15. panel.js
16. console.js
    ↓
17. app.js ← Ready
```

Each phase depends on previous phases. Breaking this order causes errors.

---

## 🛠️ Common Tasks

### Add a New Node Type

1. **Define in constants.js**
   ```javascript
   NODE_TYPES: {
     mynewtype: { label: 'My Type', color: '#00ff00' }
   }
   ```

2. **Add styles in nodes.css**
   ```css
   .pv-mynewtype {
     width: 40px; height: 40px;
     background: #00ff00;
   }
   ```

3. **Use in templates.js** (optional)
   ```javascript
   const n = add('mynewtype', 'label', 100, 100);
   ```

### Debug an Error

1. Open DevTools: `F12`
2. Check Console for stack trace
3. Module name in stack trace → file location
4. Example: `render.js:45` → `js/canvas/render.js` line 45

### Save/Export State

- **Auto-save**: Happens automatically to localStorage
- **Manual export**: Button in UI → downloads JSON
- **Manual load**: Button in UI → imports from file

### Change Color Scheme

Edit `css/theme.css`:
```css
:root {
  --bg-primary: #0f0f0f;       /* Dark background */
  --text-primary: #e0e0e0;     /* Light text */
  --accent-primary: #00d9ff;   /* Cyan accent */
}
```

---

## 📊 Module Responsibilities

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| **constants.js** | Global config | CONFIG object |
| **state.js** | Global state | STATE, DOM, initDOM() |
| **helpers.js** | Utilities | generateUID, byId, createNode |
| **storage.js** | Persistence | saveState, loadState, export/import |
| **render.js** | Drawing | renderNodes, drawEdges, renderAll |
| **viewport.js** | View control | zoom, pan, fitView |
| **minimap.js** | Navigation | drawMinimap |
| **gestures.js** | User input | mouse, keyboard, drag events |
| **selection.js** | Selection | setSel, deleteSel |
| **editing.js** | Edit mode | startEdit, inline text editing |
| **history.js** | Undo/Redo | commitHistory, undo, redo |
| **templates.js** | Presets | getTemplate (orquestador, web, blank) |
| **export.js** | Import/Export | JSON save/load |
| **execution.js** | Simulation | simulateExecution animation |
| **panel.js** | Properties | updatePanel (node/edge properties) |
| **console.js** | Logs | log, console output |
| **app.js** | Bootstrap | initApp, registerEventListeners |

---

## 🔑 Key Objects & Functions

### Global Objects

```javascript
// Configuration
CONFIG.ZOOM_MIN       // 0.2
CONFIG.ZOOM_MAX       // 5
CONFIG.SNAP_GRID      // 10
CONFIG.CONSOLE_MAX_LINES  // 100

// Application State
STATE.nodes[]         // All nodes
STATE.edges[]         // All connections
STATE.zoom            // Current zoom level
STATE.pan             // {x, y} pan offset
STATE.sel             // Current selection
STATE.history[]       // Undo history

// DOM References
DOM.viewport          // Main viewport element
DOM.world             // Canvas parent
DOM.edgesG            // SVG edges group
DOM.panel             // Properties panel
DOM.console           // Console output area
```

### Essential Functions

```javascript
// Create elements
createNode(type, text, x, y)  // New node
createEdge(fromId, toId, label, kind)  // New connection

// Query
byId(id)              // Get node by ID
nodeEl(id)            // Get DOM element

// State management
saveState()           // Save to localStorage
loadState()           // Load from localStorage
commitHistory()       // Save to undo history

// Rendering
renderAll()           // Full redraw
renderNodes()         // Draw nodes only
drawEdges()           // Draw connections only

// UI
updatePanel()         // Update properties panel
log(type, msg)        // Console output
```

---

## 🎨 CSS Token System

### Colors (in theme.css)

```css
--bg-primary          /* Main background */
--bg-secondary        /* Secondary background */
--bg-tertiary         /* Tertiary background */
--text-primary        /* Main text */
--text-secondary      /* Secondary text */
--accent-primary      /* Primary accent (cyan) */
--accent-secondary    /* Secondary accent */
--success             /* Success color */
--warning             /* Warning color */
--error               /* Error color */
--border              /* Border color */
```

### Using Tokens

```css
element {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

---

## ⚡ Performance Tips

### Optimize Rendering
- Use `renderAll()` sparingly
- Target specific renders when possible:
  - `renderNodes()` for node changes
  - `drawEdges()` for connection changes

### Reduce Memory
- Clear `STATE.history` if it grows too large
- Monitor `localStorage` usage
- Use lazy loading for heavy features

### Debug Performance
1. Open DevTools Performance tab
2. Record user action
3. Check timeline for bottlenecks
4. Target module with slowdown

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Blank canvas | app.js not loaded | Check console for errors |
| Nodes not appearing | Constants not loaded | Verify loading order |
| Zoom not working | viewport.js missing | Ensure js/canvas/viewport.js exists |
| Save not working | storage.js error | Check localStorage permissions |
| Styles broken | CSS not loading | Verify all 4 CSS files present |
| Undo doesn't work | history.js not initialized | Call commitHistory() |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **ARCHITECTURE.md** | Full architecture documentation |
| **modules-dashboard.html** | Interactive module dashboard |
| **coordination.html** | Main application entry point |
| **QUICK_REFERENCE.md** | This file |

---

## 🤝 Collaboration Tips (Claude + Qwen)

### Work on Different Modules
- **Claude**: Canvas + rendering (render.js, viewport.js)
- **Qwen**: Interaction + features (gestures.js, templates.js)
- Avoid editing same module simultaneously

### Testing Locally
1. Make changes to your module
2. Refresh `coordination.html` (F5)
3. Test in browser
4. Check console for errors

### Merging Changes
- Each module is independent
- Order in coordination.html matters
- Test full app after any changes
- Commit working versions

---

## 📞 Support Reference

**Main Files to Check**:
- Error in rendering? → `js/canvas/render.js`
- Error in interaction? → `js/interaction/`
- Error in state? → `js/core/state.js`
- Error in styling? → `css/` files

**Quick Diagnostics**:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Module name tells you where to look

---

## ✅ Pre-Launch Checklist

- [ ] All 4 CSS files present
- [ ] All 17 JS files present
- [ ] coordination.html loads without errors
- [ ] Canvas appears on screen
- [ ] Buttons are clickable
- [ ] Can create nodes
- [ ] Can draw connections
- [ ] Undo/Redo work
- [ ] Save works (localStorage)
- [ ] Templates load

---

**Ready to develop!** 🚀
