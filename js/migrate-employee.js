// ============================================
// EMPLOYEE MIGRATION UTILITY
// Execute from browser console while logged in as admin
// ============================================

/**
 * Migrates an employee to a new document (for email/auth changes)
 * Usage: await migrateEmployee('OLD_EMPLOYEE_ID', 'new@email.com')
 *
 * Example for Danny:
 * await migrateEmployee('9NXSMs1k6lH5pMaiDJEZ', 'danny@mmwineliquor.com')
 */
async function migrateEmployee(oldEmployeeId, newEmail) {
    if (!firebase || !firebase.firestore) {
        console.error('Firebase not initialized');
        return;
    }

    const db = firebase.firestore();
    const collections = window.FIREBASE_COLLECTIONS || {
        employees: 'employees',
        schedules: 'schedules',
        clockin: 'clockin',
        dayOffRequests: 'dayOffRequests',
        daysOff: 'daysOff'
    };

    console.log('🚀 Starting migration for employee:', oldEmployeeId);
    console.log('📧 New email:', newEmail);

    try {
        // Step 1: Get the old employee document
        console.log('\n📋 Step 1: Reading old employee data...');
        const oldDoc = await db.collection(collections.employees).doc(oldEmployeeId).get();

        if (!oldDoc.exists) {
            console.error('❌ Employee not found:', oldEmployeeId);
            return { success: false, error: 'Employee not found' };
        }

        const oldData = oldDoc.data();
        console.log('✅ Found employee:', oldData.name);
        console.log('   Old email:', oldData.email);
        console.log('   Store:', oldData.store);
        console.log('   Role:', oldData.employeeType || oldData.role);

        // Step 2: Create new employee document (without firebaseUid - they'll register again)
        console.log('\n📋 Step 2: Creating new employee document...');
        const newEmployeeData = {
            ...oldData,
            email: newEmail,
            authEmail: newEmail,
            firebaseUid: null, // Will be set when they register
            createdAt: oldData.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            migratedFrom: oldEmployeeId,
            migratedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Remove the old firebaseUid
        delete newEmployeeData.firebaseUid;

        const newDocRef = await db.collection(collections.employees).add(newEmployeeData);
        const newEmployeeId = newDocRef.id;
        console.log('✅ New employee created with ID:', newEmployeeId);

        // Step 3: Migrate schedules
        console.log('\n📋 Step 3: Migrating schedules...');
        const schedulesSnapshot = await db.collection(collections.schedules)
            .where('employeeId', '==', oldEmployeeId)
            .get();

        let schedulesCount = 0;
        const scheduleBatch = db.batch();
        schedulesSnapshot.forEach(doc => {
            scheduleBatch.update(doc.ref, {
                employeeId: newEmployeeId,
                migratedFrom: oldEmployeeId
            });
            schedulesCount++;
        });

        if (schedulesCount > 0) {
            await scheduleBatch.commit();
            console.log(`✅ Migrated ${schedulesCount} schedules`);
        } else {
            console.log('ℹ️ No schedules found to migrate');
        }

        // Step 4: Migrate clock-in records
        console.log('\n📋 Step 4: Migrating clock-in records...');
        const clockinSnapshot = await db.collection(collections.clockin)
            .where('employeeId', '==', oldEmployeeId)
            .get();

        let clockinCount = 0;
        const clockinBatch = db.batch();
        clockinSnapshot.forEach(doc => {
            clockinBatch.update(doc.ref, {
                employeeId: newEmployeeId,
                migratedFrom: oldEmployeeId
            });
            clockinCount++;
        });

        if (clockinCount > 0) {
            await clockinBatch.commit();
            console.log(`✅ Migrated ${clockinCount} clock-in records`);
        } else {
            console.log('ℹ️ No clock-in records found to migrate');
        }

        // Step 5: Migrate day off requests
        console.log('\n📋 Step 5: Migrating day off requests...');
        const dayOffRequestsSnapshot = await db.collection(collections.dayOffRequests)
            .where('employeeId', '==', oldEmployeeId)
            .get();

        let dayOffRequestsCount = 0;
        const dayOffRequestsBatch = db.batch();
        dayOffRequestsSnapshot.forEach(doc => {
            dayOffRequestsBatch.update(doc.ref, {
                employeeId: newEmployeeId,
                migratedFrom: oldEmployeeId
            });
            dayOffRequestsCount++;
        });

        if (dayOffRequestsCount > 0) {
            await dayOffRequestsBatch.commit();
            console.log(`✅ Migrated ${dayOffRequestsCount} day off requests`);
        } else {
            console.log('ℹ️ No day off requests found to migrate');
        }

        // Step 6: Migrate days off
        console.log('\n📋 Step 6: Migrating days off...');
        const daysOffSnapshot = await db.collection(collections.daysOff)
            .where('employeeId', '==', oldEmployeeId)
            .get();

        let daysOffCount = 0;
        const daysOffBatch = db.batch();
        daysOffSnapshot.forEach(doc => {
            daysOffBatch.update(doc.ref, {
                employeeId: newEmployeeId,
                migratedFrom: oldEmployeeId
            });
            daysOffCount++;
        });

        if (daysOffCount > 0) {
            await daysOffBatch.commit();
            console.log(`✅ Migrated ${daysOffCount} days off`);
        } else {
            console.log('ℹ️ No days off found to migrate');
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 MIGRATION COMPLETE!');
        console.log('='.repeat(50));
        console.log(`Employee: ${oldData.name}`);
        console.log(`Old ID: ${oldEmployeeId}`);
        console.log(`New ID: ${newEmployeeId}`);
        console.log(`New Email: ${newEmail}`);
        console.log(`\nMigrated:`);
        console.log(`  - Schedules: ${schedulesCount}`);
        console.log(`  - Clock-in records: ${clockinCount}`);
        console.log(`  - Day off requests: ${dayOffRequestsCount}`);
        console.log(`  - Days off: ${daysOffCount}`);
        console.log('\n⚠️ NEXT STEPS:');
        console.log(`1. Delete old employee document: ${oldEmployeeId}`);
        console.log(`2. Delete old Firebase Auth user: dbarrantes99@gmail.com`);
        console.log(`3. Have ${oldData.name} register with: ${newEmail}`);
        console.log('='.repeat(50));

        return {
            success: true,
            oldEmployeeId,
            newEmployeeId,
            newEmail,
            migrated: {
                schedules: schedulesCount,
                clockin: clockinCount,
                dayOffRequests: dayOffRequestsCount,
                daysOff: daysOffCount
            }
        };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return { success: false, error: error.message };
    }
}

// Make it globally available
window.migrateEmployee = migrateEmployee;

console.log('✅ Migration utility loaded. Use: await migrateEmployee("OLD_ID", "new@email.com")');
