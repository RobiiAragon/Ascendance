// ========== Migration Function: Update "Carlos Admin" to "VSU Admin" ==========
// Auto-run on load to fix existing records
(async function migrateCarlosAdminToVSUAdmin() {
    // Wait for Firebase to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.log('Firebase not ready for migration');
        return;
    }

    const db = firebase.firestore();
    const collections = ['cashOutRecords', 'invoices', 'issues', 'gifts', 'changeRecords', 'clockRecords'];
    let totalUpdated = 0;

    console.log('🔄 Auto-migration: Carlos Admin -> VSU Admin');

    for (const collectionName of collections) {
        try {
            const snapshot = await db.collection(collectionName).where('createdBy', '==', 'Carlos Admin').get();

            if (!snapshot.empty) {
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { createdBy: 'VSU Admin' });
                });
                await batch.commit();
                console.log(`✅ Updated ${snapshot.size} records in ${collectionName}`);
                totalUpdated += snapshot.size;
            }
        } catch (error) {
            // Collection might not exist, ignore
        }
    }

    // Also check for 'recordedBy' field
    for (const collectionName of collections) {
        try {
            const snapshot = await db.collection(collectionName).where('recordedBy', '==', 'Carlos Admin').get();

            if (!snapshot.empty) {
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { recordedBy: 'VSU Admin' });
                });
                await batch.commit();
                totalUpdated += snapshot.size;
            }
        } catch (error) {
            // Silently ignore
        }
    }

    if (totalUpdated > 0) {
        console.log(`✅ Migration complete! Updated ${totalUpdated} records to VSU Admin`);
    }
})();

// =============================================================================
// G-LABS MODULE - Simple Spreadsheet for Number Crunching
// =============================================================================

// G-Labs state
let glabsSheets = {};
let glabsCurrentSheet = 'Sheet 1';
let glabsRows = 15;
let glabsCols = 10;
let glabsSelectedCell = null;
let glabsColWidths = {};
let glabsRowHeights = {};
let glabsCellStyles = {};

// Undo/Redo history
let glabsUndoStack = [];
let glabsRedoStack = [];
let glabsMaxHistory = 50;

// Clipboard
let glabsClipboard = null;

// Month navigation state
let glabsCurrentMonth = new Date().getMonth();
let glabsCurrentYear = new Date().getFullYear();

// Get month key for storage
function glabsGetMonthKey() {
    return `${glabsCurrentYear}-${String(glabsCurrentMonth + 1).padStart(2, '0')}`;
}

// Get month display name
function glabsGetMonthName() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[glabsCurrentMonth]} ${glabsCurrentYear}`;
}

// Navigate to previous month
function glabsPrevMonth() {
    glabsCurrentMonth--;
    if (glabsCurrentMonth < 0) {
        glabsCurrentMonth = 11;
        glabsCurrentYear--;
    }
    glabsLoadDataForMonth();
    renderGLabs();
}

// Navigate to next month
function glabsNextMonth() {
    glabsCurrentMonth++;
    if (glabsCurrentMonth > 11) {
        glabsCurrentMonth = 0;
        glabsCurrentYear++;
    }
    glabsLoadDataForMonth();
    renderGLabs();
}

// Go to current month
function glabsGoToCurrentMonth() {
    glabsCurrentMonth = new Date().getMonth();
    glabsCurrentYear = new Date().getFullYear();
    glabsLoadDataForMonth();
    renderGLabs();
}

// Initialize G-Labs data structure
function glabsInitSheet(sheetName) {
    if (!glabsSheets[sheetName]) {
        glabsSheets[sheetName] = {
            data: [],
            colWidths: {},
            rowHeights: {},
            cellStyles: {}
        };
        for (let i = 0; i < glabsRows; i++) {
            glabsSheets[sheetName].data[i] = [];
            for (let j = 0; j < glabsCols; j++) {
                glabsSheets[sheetName].data[i][j] = '';
            }
        }
    }
}

// Load G-Labs from localStorage for current month
function glabsLoadData() {
    glabsLoadDataForMonth();
}

// Load data for specific month from Firebase
async function glabsLoadDataForMonth() {
    const monthKey = glabsGetMonthKey();

    try {
        // Try Firebase first
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const doc = await db.collection('glabs').doc(monthKey).get();

            if (doc.exists) {
                const data = doc.data();
                glabsSheets = data.sheets || {};
                glabsCurrentSheet = data.currentSheet || 'Sheet 1';
                console.log('✅ G-Labs loaded from Firebase:', monthKey);
            } else {
                // No data in Firebase, check localStorage as fallback for migration
                const saved = localStorage.getItem(`glabs_month_${monthKey}`);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        glabsSheets = parsed.sheets || {};
                        glabsCurrentSheet = parsed.currentSheet || 'Sheet 1';
                        // Migrate to Firebase
                        glabsSaveData();
                        console.log('✅ G-Labs migrated from localStorage to Firebase:', monthKey);
                    } catch (e) {
                        glabsSheets = {};
                    }
                } else {
                    glabsSheets = {};
                }
            }
        } else {
            // Fallback to localStorage if Firebase not available
            const saved = localStorage.getItem(`glabs_month_${monthKey}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                glabsSheets = parsed.sheets || {};
                glabsCurrentSheet = parsed.currentSheet || 'Sheet 1';
            } else {
                glabsSheets = {};
            }
        }
    } catch (error) {
        console.error('Error loading G-Labs from Firebase:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(`glabs_month_${monthKey}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                glabsSheets = parsed.sheets || {};
                glabsCurrentSheet = parsed.currentSheet || 'Sheet 1';
            } catch (e) {
                glabsSheets = {};
            }
        } else {
            glabsSheets = {};
        }
    }

    if (Object.keys(glabsSheets).length === 0) {
        glabsInitSheet('Sheet 1');
    }
}

// Save G-Labs to Firebase for current month
async function glabsSaveData() {
    const monthKey = glabsGetMonthKey();
    const data = {
        sheets: glabsSheets,
        currentSheet: glabsCurrentSheet,
        updatedAt: new Date().toISOString()
    };

    try {
        // Save to Firebase
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('glabs').doc(monthKey).set(data, { merge: true });
            console.log('✅ G-Labs saved to Firebase:', monthKey);
        }

        // Also save to localStorage as backup
        localStorage.setItem(`glabs_month_${monthKey}`, JSON.stringify({
            sheets: glabsSheets,
            currentSheet: glabsCurrentSheet
        }));
    } catch (error) {
        console.error('Error saving G-Labs to Firebase:', error);
        // Fallback to localStorage only
        localStorage.setItem(`glabs_month_${monthKey}`, JSON.stringify({
            sheets: glabsSheets,
            currentSheet: glabsCurrentSheet
        }));
    }

    // Update saved indicator
    const savedEl = document.getElementById('glabs-saved');
    if (savedEl) {
        savedEl.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Synced';
        savedEl.style.color = '#10b981';
    }
}

// Save state for undo
function glabsSaveUndoState() {
    const state = JSON.stringify({
        sheets: glabsSheets,
        currentSheet: glabsCurrentSheet
    });
    glabsUndoStack.push(state);
    if (glabsUndoStack.length > glabsMaxHistory) {
        glabsUndoStack.shift();
    }
    // Clear redo stack when new action is performed
    glabsRedoStack = [];
}

// Undo last action
function glabsUndo() {
    if (glabsUndoStack.length === 0) return;

    // Save current state to redo stack
    const currentState = JSON.stringify({
        sheets: glabsSheets,
        currentSheet: glabsCurrentSheet
    });
    glabsRedoStack.push(currentState);

    // Restore previous state
    const prevState = JSON.parse(glabsUndoStack.pop());
    glabsSheets = prevState.sheets;
    glabsCurrentSheet = prevState.currentSheet;

    glabsSaveData();
    renderGLabs();
}

// Redo last undone action
function glabsRedo() {
    if (glabsRedoStack.length === 0) return;

    // Save current state to undo stack
    const currentState = JSON.stringify({
        sheets: glabsSheets,
        currentSheet: glabsCurrentSheet
    });
    glabsUndoStack.push(currentState);

    // Restore redo state
    const redoState = JSON.parse(glabsRedoStack.pop());
    glabsSheets = redoState.sheets;
    glabsCurrentSheet = redoState.currentSheet;

    glabsSaveData();
    renderGLabs();
}

// Copy selected cells
function glabsCopy() {
    if (!glabsSelectedCell && (!glabsSelectionStart || !glabsSelectionEnd)) return;

    const sheet = glabsSheets[glabsCurrentSheet];

    if (glabsSelectionStart && glabsSelectionEnd) {
        // Copy range
        const startRow = Math.min(glabsSelectionStart.row, glabsSelectionEnd.row);
        const endRow = Math.max(glabsSelectionStart.row, glabsSelectionEnd.row);
        const startCol = Math.min(glabsSelectionStart.col, glabsSelectionEnd.col);
        const endCol = Math.max(glabsSelectionStart.col, glabsSelectionEnd.col);

        glabsClipboard = {
            type: 'range',
            data: [],
            styles: []
        };

        for (let r = startRow; r <= endRow; r++) {
            const rowData = [];
            const rowStyles = [];
            for (let c = startCol; c <= endCol; c++) {
                rowData.push(sheet.data[r]?.[c] || '');
                rowStyles.push(sheet.cellStyles?.[`${r}-${c}`] || {});
            }
            glabsClipboard.data.push(rowData);
            glabsClipboard.styles.push(rowStyles);
        }
    } else if (glabsSelectedCell) {
        // Copy single cell
        const { row, col } = glabsSelectedCell;
        glabsClipboard = {
            type: 'single',
            data: sheet.data[row]?.[col] || '',
            style: sheet.cellStyles?.[`${row}-${col}`] || {}
        };
    }
}

// Paste clipboard content
function glabsPaste() {
    if (!glabsClipboard || !glabsSelectedCell) return;

    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    const { row, col } = glabsSelectedCell;

    if (!sheet.cellStyles) sheet.cellStyles = {};

    if (glabsClipboard.type === 'single') {
        if (!sheet.data[row]) sheet.data[row] = [];
        sheet.data[row][col] = glabsClipboard.data;
        sheet.cellStyles[`${row}-${col}`] = { ...glabsClipboard.style };
    } else if (glabsClipboard.type === 'range') {
        for (let r = 0; r < glabsClipboard.data.length; r++) {
            for (let c = 0; c < glabsClipboard.data[r].length; c++) {
                const targetRow = row + r;
                const targetCol = col + c;
                if (!sheet.data[targetRow]) sheet.data[targetRow] = [];
                sheet.data[targetRow][targetCol] = glabsClipboard.data[r][c];
                sheet.cellStyles[`${targetRow}-${targetCol}`] = { ...glabsClipboard.styles[r][c] };
            }
        }
    }

    glabsSaveData();
    renderGLabs();
}

// Delete content of selected cells
function glabsDeleteContent() {
    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];

    if (glabsSelectionStart && glabsSelectionEnd) {
        // Delete range
        const startRow = Math.min(glabsSelectionStart.row, glabsSelectionEnd.row);
        const endRow = Math.max(glabsSelectionStart.row, glabsSelectionEnd.row);
        const startCol = Math.min(glabsSelectionStart.col, glabsSelectionEnd.col);
        const endCol = Math.max(glabsSelectionStart.col, glabsSelectionEnd.col);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (sheet.data[r]) sheet.data[r][c] = '';
            }
        }
    } else if (glabsSelectedCell) {
        // Delete single cell
        const { row, col } = glabsSelectedCell;
        if (sheet.data[row]) sheet.data[row][col] = '';
    }

    glabsSaveData();
    renderGLabs();
}

// Navigate with arrow keys
function glabsNavigate(direction) {
    if (!glabsSelectedCell) return;

    const { row, col } = glabsSelectedCell;
    const sheet = glabsSheets[glabsCurrentSheet];
    const maxRow = sheet.data.length || glabsRows;
    const maxCol = sheet.data[0]?.length || glabsCols;

    let newRow = row;
    let newCol = col;

    switch (direction) {
        case 'up': newRow = Math.max(0, row - 1); break;
        case 'down': newRow = Math.min(maxRow - 1, row + 1); break;
        case 'left': newCol = Math.max(0, col - 1); break;
        case 'right': newCol = Math.min(maxCol - 1, col + 1); break;
    }

    // Find and click the new cell
    const newCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
    if (newCell) {
        glabsSelectCell(newRow, newCol, newCell);
    }
}

// Keyboard event handler for G-Labs
function glabsKeyboardHandler(e) {
    // Check if we're in G-Labs module
    if (!document.getElementById('glabs-table')) return;

    // Don't intercept if typing in formula bar or cell editor
    if (e.target.id === 'glabs-formula-bar' || e.target.classList.contains('glabs-cell-editor')) {
        // Handle Enter in formula bar
        if (e.key === 'Enter' && e.target.id === 'glabs-formula-bar') {
            glabsApplyFormula();
            glabsNavigate('down');
            e.preventDefault();
        }
        // Handle Escape in formula bar - cancel editing
        if (e.key === 'Escape') {
            e.preventDefault();
            document.getElementById('glabs-formula-bar').blur();
            renderGLabs();
        }
        return;
    }

    // F2 = Edit cell directly
    if (e.key === 'F2' && glabsSelectedCell) {
        e.preventDefault();
        glabsEditCellDirectly(glabsSelectedCell.row, glabsSelectedCell.col, glabsSelectedCell.element);
        return;
    }

    // Escape = Cancel selection or deselect
    if (e.key === 'Escape') {
        e.preventDefault();
        glabsSelectedCell = null;
        glabsSelectionStart = null;
        glabsSelectionEnd = null;
        glabsSelectedCells = [];
        renderGLabs();
        return;
    }

    // Ctrl/Cmd + Z = Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        glabsUndo();
        return;
    }

    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z = Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        glabsRedo();
        return;
    }

    // Ctrl/Cmd + C = Copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        glabsCopy();
        return;
    }

    // Ctrl/Cmd + V = Paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        glabsPaste();
        return;
    }

    // Ctrl/Cmd + X = Cut
    if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        glabsCopy();
        glabsDeleteContent();
        return;
    }

    // Ctrl/Cmd + F = Find
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        glabsShowFindDialog();
        return;
    }

    // Delete or Backspace = Clear content
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        glabsDeleteContent();
        return;
    }

    // Arrow keys = Navigate
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase();
        glabsNavigate(dir);
        return;
    }

    // Tab = Move right
    if (e.key === 'Tab') {
        e.preventDefault();
        glabsNavigate(e.shiftKey ? 'left' : 'right');
        return;
    }

    // Enter = Edit cell or move down
    if (e.key === 'Enter') {
        e.preventDefault();
        if (glabsSelectedCell) {
            // Edit cell on Enter
            glabsEditCellDirectly(glabsSelectedCell.row, glabsSelectedCell.col, glabsSelectedCell.element);
        }
        return;
    }

    // Start typing to edit cell (if alphanumeric key pressed) - replaces content
    if (glabsSelectedCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        glabsEditCellDirectly(glabsSelectedCell.row, glabsSelectedCell.col, glabsSelectedCell.element, e.key);
    }
}

// Edit cell directly (in-cell editing)
function glabsEditCellDirectly(row, col, element, initialValue = null) {
    const sheet = glabsSheets[glabsCurrentSheet];

    // Find element if not provided or invalid
    if (!element || !element.querySelector) {
        element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    if (!element) return;

    const contentDiv = element.querySelector('.glabs-cell-content');
    if (!contentDiv) return;

    const currentValue = initialValue !== null ? initialValue : (sheet.data[row]?.[col] || '');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glabs-cell-editor';
    input.value = currentValue;
    input.style.cssText = 'width: 100%; height: 100%; border: none; background: white; padding: 4px 8px; font-size: 13px; outline: none; box-sizing: border-box;';

    input.onblur = () => glabsSaveCell(input, row, col);
    input.onkeydown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            glabsSaveCell(input, row, col);
            glabsNavigate('down');
        } else if (event.key === 'Tab') {
            event.preventDefault();
            glabsSaveCell(input, row, col);
            glabsNavigate(event.shiftKey ? 'left' : 'right');
        } else if (event.key === 'Escape') {
            event.preventDefault();
            renderGLabs(); // Cancel without saving
        }
    };

    contentDiv.innerHTML = '';
    contentDiv.appendChild(input);
    input.focus();

    // If initial value was passed (user started typing), put cursor at end
    if (initialValue !== null) {
        input.setSelectionRange(input.value.length, input.value.length);
    } else {
        input.select();
    }
}

// Get list of all months that have data from Firebase
async function glabsGetSavedMonths() {
    const months = new Set();

    try {
        // Get from Firebase
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const snapshot = await db.collection('glabs').get();
            snapshot.forEach(doc => {
                months.add(doc.id);
            });
        }
    } catch (error) {
        console.error('Error getting saved months from Firebase:', error);
    }

    // Also check localStorage for any local-only data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('glabs_month_')) {
            const monthKey = key.replace('glabs_month_', '');
            months.add(monthKey);
        }
    }

    return Array.from(months).sort().reverse();
}

