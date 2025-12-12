// 1. INITIALIZE FIREBASE FOR GCONOMICS
// Initialize Firebase connection and sync user data
await initializeGconomicsFirebase(userId, userEmail);

// 2. LOAD EXPENSES FROM FIREBASE
// Load all expenses from Firebase and merge with local data
await loadGconomicsFromFirebase();

// 3. GET STATISTICS FROM FIREBASE
// Get monthly statistics directly from Firebase
const stats = await getGconomicsStatsFromFirebase('2024-12');
// Returns: { total: number, byCategory: {...}, count: number, expenses: [...] }

// 4. SAVE EXPENSE TO FIREBASE (Called automatically)
await gconomicsFirebase.saveExpenseToFirestore(expense);

// 5. DELETE EXPENSE FROM FIREBASE (Called automatically)
await gconomicsFirebase.deleteExpenseFromFirestore(expenseId);

// 6. LOAD EXPENSES FROM FIREBASE
const expenses = await gconomicsFirebase.loadExpensesFromFirestore();

// 7. LOAD MONTHLY EXPENSES
const monthlyExpenses = await gconomicsFirebase.loadExpensesForMonth('2024-12');

// 8. LISTEN TO REAL-TIME UPDATES
const unsubscribe = gconomicsFirebase.listenToExpenses((expenses) => {
    console.log('Expenses updated:', expenses);
});
// To stop listening: unsubscribe();

// 9. EXPORT EXPENSES AS JSON
const exportData = await gconomicsFirebase.exportExpensesAsJson();

// 10. SYNC WITH FIREBASE (Bi-directional)
const mergedExpenses = await gconomicsFirebase.syncWithFirebase(localExpenses);
