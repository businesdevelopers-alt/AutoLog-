import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/forms');
provider.addScope('https://www.googleapis.com/auth/contacts');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface ExportData {
  title: string;
  startDate: string;
  endDate: string;
  vehicleName: string;
  totalOps: number;
  totalSpent: number;
  dailyAvg: string;
  rows: Array<{
    vehicle: string;
    date: string;
    type: string;
    details: string;
    amount: number;
  }>;
}

export const createAndExportToSheets = async (
  accessToken: string,
  exportData: ExportData
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `${exportData.title} - (${exportData.startDate} - ${exportData.endDate})`
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create spreadsheet');
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;

  const values: Array<Array<string | number>> = [
    ["أوتو كير - تقرير الصيانة والمصاريف التفصيلي"],
    [`الفترة من: ${exportData.startDate} إلى ${exportData.endDate}`],
    [`تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}`],
    [],
    ["ملخص التقرير"],
    ["المركبة المحددة", "إجمالي العمليات", "إجمالي النفقات", "متوسط الصرف اليومي"],
    [exportData.vehicleName, `${exportData.totalOps} عمليات`, `${exportData.totalSpent} ر.س`, exportData.dailyAvg],
    [],
    ["سجل العمليات التفصيلي"],
    ["المركبة", "التاريخ", "النوع / التصنيف", "التفاصيل", "المبلغ (ر.س)"]
  ];

  exportData.rows.forEach(r => {
    values.push([
      r.vehicle,
      r.date,
      r.type,
      r.details,
      r.amount
    ]);
  });

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:E${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `Sheet1!A1:E${values.length}`,
        majorDimension: "ROWS",
        values: values
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Failed to write data to spreadsheet');
  }

  return { spreadsheetId, spreadsheetUrl };
};
