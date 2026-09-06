import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  Auth 
} from 'firebase/auth';
import { User, Deposit, Withdrawal, Investment, Commission, WithdrawalProof, Product, SupportMessage } from './types';

// Configuration fournie pour le projet nutrien-d5378
const envApiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_FIREBASE_API_KEY) || "";

export const firebaseConfig = {
  apiKey: envApiKey || "...", // Remplaçable via variable d'environnement VITE_FIREBASE_API_KEY
  authDomain: "nutrien-d5378.firebaseapp.com",
  projectId: "nutrien-d5378",
  storageBucket: "nutrien-d5378.firebasestorage.app",
  messagingSenderId: "524262155034",
  appId: "1:524262155034:web:d39f9635c683eba7c982a3",
  measurementId: "G-C2MM98QZEZ"
};

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export const isFirebaseConfigValid = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== '...' && 
    firebaseConfig.apiKey.trim().length > 5 &&
    firebaseConfig.projectId === 'nutrien-d5378'
  );
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }
  return appInstance;
};

export const getFirebaseDb = (): Firestore | null => {
  try {
    if (!firestoreInstance) {
      const app = getFirebaseApp();
      firestoreInstance = getFirestore(app);
    }
    return firestoreInstance;
  } catch (err) {
    console.warn('[FIREBASE] Erreur lors de l\'initialisation de Firestore:', err);
    return null;
  }
};

export const getFirebaseAuth = (): Auth | null => {
  try {
    if (!authInstance) {
      const app = getFirebaseApp();
      authInstance = getAuth(app);
    }
    return authInstance;
  } catch (err) {
    console.warn('[FIREBASE] Erreur lors de l\'initialisation de Firebase Auth:', err);
    return null;
  }
};

// Nettoie les objets pour Firestore (élimine les undefined qui provoquent des erreurs Firestore)
function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  if (!data || typeof data !== 'object') return result;
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// -------------------------------------------------------------
// ENREGISTREMENT ET ÉCRITURE DANS FIRESTORE
// -------------------------------------------------------------

/**
 * Enregistre un utilisateur dans la collection Firestore 'users'
 */
export async function saveUserToFirestore(user: User): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !user || !user.id) return false;

  try {
    const userRef = doc(db, 'users', user.id);
    const sanitized = sanitizeForFirestore({
      ...user,
      lastModified: user.lastModified || Date.now()
    });
    await setDoc(userRef, sanitized, { merge: true });
    console.log(`[FIRESTORE] Utilisateur ${user.id} (${user.name}) synchronisé avec succès.`);
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de l'enregistrement de l'utilisateur ${user.id}:`, error);
    return false;
  }
}

/**
 * Enregistre un dépôt dans la collection Firestore 'deposits'
 */
export async function saveDepositToFirestore(deposit: Deposit): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !deposit || !deposit.id) return false;

  try {
    const depRef = doc(db, 'deposits', deposit.id);
    const sanitized = sanitizeForFirestore({
      ...deposit,
      lastModified: deposit.lastModified || Date.now()
    });
    await setDoc(depRef, sanitized, { merge: true });
    console.log(`[FIRESTORE] Dépôt ${deposit.id} de ${deposit.amount} XOF enregistré avec succès.`);
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de l'enregistrement du dépôt ${deposit.id}:`, error);
    return false;
  }
}

/**
 * Enregistre un retrait dans la collection Firestore 'withdrawals'
 */
export async function saveWithdrawalToFirestore(withdrawal: Withdrawal): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !withdrawal || !withdrawal.id) return false;

  try {
    const withRef = doc(db, 'withdrawals', withdrawal.id);
    const sanitized = sanitizeForFirestore({
      ...withdrawal,
      lastModified: withdrawal.lastModified || Date.now()
    });
    await setDoc(withRef, sanitized, { merge: true });
    console.log(`[FIRESTORE] Retrait ${withdrawal.id} de ${withdrawal.amount} XOF enregistré avec succès.`);
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de l'enregistrement du retrait ${withdrawal.id}:`, error);
    return false;
  }
}

/**
 * Enregistre un plan d'investissement dans la collection Firestore 'investments'
 */
export async function saveInvestmentToFirestore(investment: Investment): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !investment || !investment.id) return false;

  try {
    const invRef = doc(db, 'investments', investment.id);
    const sanitized = sanitizeForFirestore({
      ...investment,
      lastModified: investment.lastModified || Date.now()
    });
    await setDoc(invRef, sanitized, { merge: true });
    console.log(`[FIRESTORE] Investissement ${investment.id} enregistré avec succès.`);
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de l'enregistrement de l'investissement ${investment.id}:`, error);
    return false;
  }
}

/**
 * Enregistre une commission dans la collection Firestore 'commissions'
 */
export async function saveCommissionToFirestore(commission: Commission): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !commission || !commission.id) return false;

  try {
    const commRef = doc(db, 'commissions', commission.id);
    const sanitized = sanitizeForFirestore({
      ...commission,
      lastModified: commission.lastModified || Date.now()
    });
    await setDoc(commRef, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de l'enregistrement de la commission ${commission.id}:`, error);
    return false;
  }
}

/**
 * Met à jour un document quelconque dans une collection Firestore
 */
export async function updateFirestoreDoc(collectionName: string, docId: string, updates: Record<string, any>): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !docId) return false;

  try {
    const docRef = doc(db, collectionName, docId);
    const sanitized = sanitizeForFirestore({
      ...updates,
      lastModified: Date.now()
    });
    await updateDoc(docRef, sanitized);
    console.log(`[FIRESTORE] Document ${collectionName}/${docId} mis à jour.`);
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de la mise à jour de ${collectionName}/${docId}:`, error);
    return false;
  }
}

/**
 * Supprime un document dans une collection Firestore
 */
export async function deleteFirestoreDoc(collectionName: string, docId: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !docId) return false;

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`[FIRESTORE] Document ${collectionName}/${docId} supprimé.`);
    return true;
  } catch (error) {
    console.error(`[FIRESTORE] Échec de suppression de ${collectionName}/${docId}:`, error);
    return false;
  }
}

/**
 * Synchronise un tableau d'éléments vers une collection Firestore
 */
export async function syncArrayToFirestoreCollection(collectionName: string, items: any[]): Promise<void> {
  const db = getFirebaseDb();
  if (!db || !Array.isArray(items) || items.length === 0) return;

  try {
    for (const item of items) {
      if (item && (item.id || item.code)) {
        const docId = String(item.id || item.code);
        const itemRef = doc(db, collectionName, docId);
        const sanitized = sanitizeForFirestore({
          ...item,
          lastModified: item.lastModified || Date.now()
        });
        await setDoc(itemRef, sanitized, { merge: true });
      }
    }
  } catch (err) {
    console.warn(`[FIRESTORE] Erreur de synchronisation vers ${collectionName}:`, err);
  }
}

// -------------------------------------------------------------
// ÉCOUTE TEMPS RÉEL (REAL-TIME FIRESTORE LISTENERS)
// -------------------------------------------------------------

export interface RealtimeDataPayload {
  users?: User[];
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
  investments?: Investment[];
  commissions?: Commission[];
  withdrawalProofs?: WithdrawalProof[];
  products?: Product[];
  supportMessages?: SupportMessage[];
}

/**
 * Active l'écoute en direct (onSnapshot) de toutes les collections Firestore.
 * Quand un utilisateur s'inscrit sur un autre téléphone ou une transaction est créée,
 * cette fonction appelle instantanément onUpdate avec les données réelles du serveur Firestore.
 */
export function subscribeToAllFirestore(onUpdate: (data: RealtimeDataPayload) => void): () => void {
  const db = getFirebaseDb();
  if (!db) {
    return () => {};
  }

  const unsubs: Unsubscribe[] = [];

  try {
    // 1. Écoute temps réel des utilisateurs
    const usersUnsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((docSnap) => {
          usersList.push(docSnap.data() as User);
        });
        if (usersList.length > 0) {
          onUpdate({ users: usersList });
        }
      },
      (error) => {
        console.warn('[FIRESTORE LISTENER ERROR - users]:', error.message);
      }
    );
    unsubs.push(usersUnsub);

    // 2. Écoute temps réel des dépôts
    const depositsUnsub = onSnapshot(
      collection(db, 'deposits'),
      (snapshot) => {
        const depositsList: Deposit[] = [];
        snapshot.forEach((docSnap) => {
          depositsList.push(docSnap.data() as Deposit);
        });
        onUpdate({ deposits: depositsList });
      },
      (error) => {
        console.warn('[FIRESTORE LISTENER ERROR - deposits]:', error.message);
      }
    );
    unsubs.push(depositsUnsub);

    // 3. Écoute temps réel des retraits
    const withdrawalsUnsub = onSnapshot(
      collection(db, 'withdrawals'),
      (snapshot) => {
        const withsList: Withdrawal[] = [];
        snapshot.forEach((docSnap) => {
          withsList.push(docSnap.data() as Withdrawal);
        });
        onUpdate({ withdrawals: withsList });
      },
      (error) => {
        console.warn('[FIRESTORE LISTENER ERROR - withdrawals]:', error.message);
      }
    );
    unsubs.push(withdrawalsUnsub);

    // 4. Écoute temps réel des investissements
    const investmentsUnsub = onSnapshot(
      collection(db, 'investments'),
      (snapshot) => {
        const invsList: Investment[] = [];
        snapshot.forEach((docSnap) => {
          invsList.push(docSnap.data() as Investment);
        });
        onUpdate({ investments: invsList });
      },
      (error) => {
        console.warn('[FIRESTORE LISTENER ERROR - investments]:', error.message);
      }
    );
    unsubs.push(investmentsUnsub);

    // 5. Écoute temps réel des commissions
    const commsUnsub = onSnapshot(
      collection(db, 'commissions'),
      (snapshot) => {
        const commsList: Commission[] = [];
        snapshot.forEach((docSnap) => {
          commsList.push(docSnap.data() as Commission);
        });
        onUpdate({ commissions: commsList });
      },
      (error) => {
        console.warn('[FIRESTORE LISTENER ERROR - commissions]:', error.message);
      }
    );
    unsubs.push(commsUnsub);

    // 6. Écoute temps réel des preuves de retrait (Avis)
    const proofsUnsub = onSnapshot(
      collection(db, 'withdrawal_proofs'),
      (snapshot) => {
        const proofsList: WithdrawalProof[] = [];
        snapshot.forEach((docSnap) => {
          proofsList.push(docSnap.data() as WithdrawalProof);
        });
        onUpdate({ withdrawalProofs: proofsList });
      },
      (error) => {
        console.warn('[FIRESTORE LISTENER ERROR - withdrawal_proofs]:', error.message);
      }
    );
    unsubs.push(proofsUnsub);

  } catch (globalError) {
    console.warn('[FIRESTORE] Impossible d\'établir tous les listeners temps réel:', globalError);
  }

  // Fonction de nettoyage
  return () => {
    unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
  };
}

/**
 * Récupère en une seule fois l'ensemble des données réelles de Firestore
 */
export async function fetchAllFromFirestore(): Promise<RealtimeDataPayload | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const payload: RealtimeDataPayload = {};

    const usersSnap = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    usersSnap.forEach(d => users.push(d.data() as User));
    payload.users = users;

    const depositsSnap = await getDocs(collection(db, 'deposits'));
    const deposits: Deposit[] = [];
    depositsSnap.forEach(d => deposits.push(d.data() as Deposit));
    payload.deposits = deposits;

    const withsSnap = await getDocs(collection(db, 'withdrawals'));
    const withdrawals: Withdrawal[] = [];
    withsSnap.forEach(d => withdrawals.push(d.data() as Withdrawal));
    payload.withdrawals = withdrawals;

    const invsSnap = await getDocs(collection(db, 'investments'));
    const investments: Investment[] = [];
    invsSnap.forEach(d => investments.push(d.data() as Investment));
    payload.investments = investments;

    const commsSnap = await getDocs(collection(db, 'commissions'));
    const commissions: Commission[] = [];
    commsSnap.forEach(d => commissions.push(d.data() as Commission));
    payload.commissions = commissions;

    const proofsSnap = await getDocs(collection(db, 'withdrawal_proofs'));
    const proofs: WithdrawalProof[] = [];
    proofsSnap.forEach(d => proofs.push(d.data() as WithdrawalProof));
    payload.withdrawalProofs = proofs;

    return payload;
  } catch (error) {
    console.error('[FIRESTORE] Erreur lors de la lecture complète des collections:', error);
    return null;
  }
}

/**
 * Synchronise / pousse l'état initial des utilisateurs et transactions vers Firestore
 */
export async function pushLocalDataToFirestore(data: {
  users?: User[];
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
  investments?: Investment[];
  products?: Product[];
}): Promise<{ success: boolean; count: number; error?: string }> {
  const db = getFirebaseDb();
  if (!db) return { success: false, count: 0, error: 'Firestore indisponible' };

  let totalPushed = 0;

  try {
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        if (u && u.id) {
          await setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u), { merge: true });
          totalPushed++;
        }
      }
    }

    if (Array.isArray(data.deposits)) {
      for (const d of data.deposits) {
        if (d && d.id) {
          await setDoc(doc(db, 'deposits', d.id), sanitizeForFirestore(d), { merge: true });
          totalPushed++;
        }
      }
    }

    if (Array.isArray(data.withdrawals)) {
      for (const w of data.withdrawals) {
        if (w && w.id) {
          await setDoc(doc(db, 'withdrawals', w.id), sanitizeForFirestore(w), { merge: true });
          totalPushed++;
        }
      }
    }

    if (Array.isArray(data.investments)) {
      for (const i of data.investments) {
        if (i && i.id) {
          await setDoc(doc(db, 'investments', i.id), sanitizeForFirestore(i), { merge: true });
          totalPushed++;
        }
      }
    }

    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        if (p && p.id) {
          await setDoc(doc(db, 'products', p.id), sanitizeForFirestore(p), { merge: true });
          totalPushed++;
        }
      }
    }

    return { success: true, count: totalPushed };
  } catch (err: any) {
    return { success: false, count: totalPushed, error: err.message || String(err) };
  }
}
