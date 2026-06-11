import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AppData, Vehicle, MaintenanceRecord, Expense, FuelRecord, MaintenanceReminder, Breakdown, AppTheme } from '../types';

/**
 * Loads the complete AppData for the given authenticated user from Firestore collections.
 */
export async function loadUserAppData(uid: string): Promise<AppData> {
  const data: AppData = {
    vehicles: [],
    records: [],
    expenses: [],
    fuelRecords: [],
    reminders: [],
    breakdowns: []
  };

  try {
    // 1. Load User Profile for Theme
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    });
    if (userDoc && userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.theme) {
        data.theme = userData.theme as AppTheme;
      }
    }

    // 2. Load Vehicles
    const vehiclesQuery = query(collection(db, 'vehicles'), where('userId', '==', uid));
    const vehiclesSnapshot = await getDocs(vehiclesQuery).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'vehicles');
    });
    if (vehiclesSnapshot) {
      vehiclesSnapshot.forEach(docSnap => {
        data.vehicles.push(docSnap.data() as Vehicle);
      });
    }

    // 3. Load records
    const recordsQuery = query(collection(db, 'records'), where('userId', '==', uid));
    const recordsSnapshot = await getDocs(recordsQuery).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'records');
    });
    if (recordsSnapshot) {
      recordsSnapshot.forEach(docSnap => {
        data.records.push(docSnap.data() as MaintenanceRecord);
      });
    }

    // 4. Load expenses
    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', uid));
    const expensesSnapshot = await getDocs(expensesQuery).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'expenses');
    });
    if (expensesSnapshot) {
      expensesSnapshot.forEach(docSnap => {
        data.expenses.push(docSnap.data() as Expense);
      });
    }

    // 5. Load fuel records
    const fuelQuery = query(collection(db, 'fuelRecords'), where('userId', '==', uid));
    const fuelSnapshot = await getDocs(fuelQuery).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'fuelRecords');
    });
    if (fuelSnapshot) {
      fuelSnapshot.forEach(docSnap => {
        data.fuelRecords!.push(docSnap.data() as FuelRecord);
      });
    }

    // 6. Load reminders
    const remindersQuery = query(collection(db, 'reminders'), where('userId', '==', uid));
    const remindersSnapshot = await getDocs(remindersQuery).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'reminders');
    });
    if (remindersSnapshot) {
      remindersSnapshot.forEach(docSnap => {
        data.reminders!.push(docSnap.data() as MaintenanceReminder);
      });
    }

    // 7. Load breakdowns
    const breakdownsQuery = query(collection(db, 'breakdowns'), where('userId', '==', uid));
    const breakdownsSnapshot = await getDocs(breakdownsQuery).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'breakdowns');
    });
    if (breakdownsSnapshot) {
      breakdownsSnapshot.forEach(docSnap => {
        data.breakdowns!.push(docSnap.data() as Breakdown);
      });
    }

    return data;
  } catch (error) {
    // If it is already a FirestoreErrorInfo threw, rethrow it
    if (error instanceof Error && error.message.startsWith('{')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.LIST, 'all_collections');
  }
}

/**
 * Persists a user profile (theme or settings changes)
 */
export async function saveUserProfile(uid: string, email: string, theme?: AppTheme): Promise<void> {
  const ref = doc(db, 'users', uid);
  const payload = {
    userId: uid,
    email,
    theme: theme || null,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }
}

/**
 * Persists a vehicle document
 */
export async function saveVehicle(uid: string, vehicle: Vehicle): Promise<void> {
  const ref = doc(db, 'vehicles', vehicle.id);
  const payload = {
    ...vehicle,
    userId: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `vehicles/${vehicle.id}`);
  }
}

/**
 * Persists a maintenance record
 */
export async function saveMaintenanceRecord(uid: string, record: MaintenanceRecord): Promise<void> {
  const ref = doc(db, 'records', record.id);
  const payload = {
    ...record,
    userId: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `records/${record.id}`);
  }
}

/**
 * Persists an expense document
 */
export async function saveExpense(uid: string, expense: Expense): Promise<void> {
  const ref = doc(db, 'expenses', expense.id);
  const payload = {
    ...expense,
    userId: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `expenses/${expense.id}`);
  }
}

/**
 * Persists a fuel log document
 */
export async function saveFuelRecord(uid: string, fuelRecord: FuelRecord): Promise<void> {
  const ref = doc(db, 'fuelRecords', fuelRecord.id);
  const payload = {
    ...fuelRecord,
    userId: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `fuelRecords/${fuelRecord.id}`);
  }
}

/**
 * Persists a maintenance reminder document
 */
export async function saveMaintenanceReminder(uid: string, reminder: MaintenanceReminder): Promise<void> {
  const ref = doc(db, 'reminders', reminder.id);
  const payload = {
    ...reminder,
    userId: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reminders/${reminder.id}`);
  }
}

/**
 * Deletes a reminder document
 */
export async function deleteMaintenanceReminder(uid: string, reminderId: string): Promise<void> {
  const ref = doc(db, 'reminders', reminderId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `reminders/${reminderId}`);
  }
}

/**
 * Persists a breakdown document
 */
export async function saveBreakdown(uid: string, breakdown: Breakdown): Promise<void> {
  const ref = doc(db, 'breakdowns', breakdown.id);
  const payload = {
    ...breakdown,
    userId: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(ref, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `breakdowns/${breakdown.id}`);
  }
}

/**
 * Deletes a breakdown document
 */
export async function deleteBreakdown(uid: string, breakdownId: string): Promise<void> {
  const ref = doc(db, 'breakdowns', breakdownId);
  try {
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `breakdowns/${breakdownId}`);
  }
}

/**
 * Deletes a vehicle document and deletes all associated nested documents using a Firestore Batch.
 */
export async function deleteVehicleAndAllDependencies(
  uid: string, 
  vehicleId: string, 
  dependencies: {
    recordIds: string[];
    expenseIds: string[];
    fuelRecordIds: string[];
    reminderIds: string[];
    breakdownIds: string[];
  }
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Delete vehicle doc
  batch.delete(doc(db, 'vehicles', vehicleId));

  // 2. Delete maintenance records
  dependencies.recordIds.forEach(id => {
    batch.delete(doc(db, 'records', id));
  });

  // 3. Delete expenses
  dependencies.expenseIds.forEach(id => {
    batch.delete(doc(db, 'expenses', id));
  });

  // 4. Delete fuel records
  dependencies.fuelRecordIds.forEach(id => {
    batch.delete(doc(db, 'fuelRecords', id));
  });

  // 5. Delete reminders
  dependencies.reminderIds.forEach(id => {
    batch.delete(doc(db, 'reminders', id));
  });

  // 6. Delete breakdowns
  dependencies.breakdownIds.forEach(id => {
    batch.delete(doc(db, 'breakdowns', id));
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `vehicles/${vehicleId}_batch`);
  }
}

/**
 * Migrates local local-storage state items to Firestore database if online database is empty.
 */
export async function migrateLocalDataToFirestore(uid: string, localData: AppData): Promise<void> {
  // Check if vehicles are already present online.
  const querySnap = await getDocs(query(collection(db, 'vehicles'), where('userId', '==', uid))).catch(() => null);
  if (querySnap && !querySnap.empty) {
    // Already has data online; don't override with local data automatically
    return;
  }

  const batch = writeBatch(db);

  // Migrate vehicles
  localData.vehicles.forEach(vehicle => {
    batch.set(doc(db, 'vehicles', vehicle.id), {
      ...vehicle,
      userId: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // Migrate records
  localData.records.forEach(record => {
    batch.set(doc(db, 'records', record.id), {
      ...record,
      userId: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // Migrate expenses
  localData.expenses.forEach(expense => {
    batch.set(doc(db, 'expenses', expense.id), {
      ...expense,
      userId: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // Migrate fuelRecords
  if (localData.fuelRecords) {
    localData.fuelRecords.forEach(fuel => {
      batch.set(doc(db, 'fuelRecords', fuel.id), {
        ...fuel,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  // Migrate reminders
  if (localData.reminders) {
    localData.reminders.forEach(reminder => {
      batch.set(doc(db, 'reminders', reminder.id), {
        ...reminder,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  // Migrate breakdowns
  if (localData.breakdowns) {
    localData.breakdowns.forEach(breakdown => {
      batch.set(doc(db, 'breakdowns', breakdown.id), {
        ...breakdown,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `migration_batch_${uid}`);
  }
}
