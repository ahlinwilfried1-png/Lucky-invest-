export interface User {
  id: string;
  name: string;
  whatsapp: string;
  phone?: string;
  password?: string;
  country: string;
  balance: number;
  dailyEarnings: number;
  totalEarnings: number;
  totalRecharged?: number;
  totalWithdrawn?: number;
  referralEarnings?: number;
  bonus: number;
  referralCode: string;
  referredBy?: string;
  isBlocked: boolean;
  withdrawBlocked?: boolean;
  role: 'user' | 'admin';
  createdAt: string;
  device?: string;
  lastModified?: number;
  bankCardName?: string;
  bankCardOperator?: string;
  bankCardNumber?: string;
  lastCheckInDate?: string;
  checkInStreak?: number;
  totalCheckInEarnings?: number;
  claimedMissions?: string[];
  claimedTasks?: string[];
  taskBaselines?: Record<string, number>;
}

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  operator: string;
  reference: string;
  transactionId?: string;
  paymentMethod?: string;
  receiptImage: string; // Base64 or standard asset url
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'success' | 'failed' | 'cancelled';
  createdAt: string;
  approvedAt?: string;
  lastModified?: number;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  operator: string;
  number: string;
  method?: string;
  accountNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'success' | 'failed' | 'cancelled';
  createdAt: string;
  fee?: number;
  netAmount?: number;
  lastModified?: number;
  proof_file_url?: string;
}

export interface Product {
  id: string;
  vipLevel: number;
  name: string;
  price: number;
  dailyReturn: number;
  durationDays: number;
  totalReturn: number;
  tag?: string;
  imageUrl?: string;
  isBlocked?: boolean;
  reopenDateTime?: string;
  isCyclic?: boolean;
  generatedProductIds?: string[];
  category?: 'stability' | 'wellbeing' | 'activity';
  lastModified?: number;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  vipLevel?: number;
  price: number;
  dailyReturn: number;
  daysPassed: number;
  durationDays: number;
  totalReturnClaimed: number;
  lastClaimDate: string; // ISO string or short date
  status: 'active' | 'completed' | 'pending_activation';
  category?: 'stability' | 'wellbeing' | 'activity' | string;
  createdAt: string;
  activatedAt?: string;
  activationConditionsMet?: boolean;
  lastModified?: number;
  autoRenew?: boolean;
  totalReturn?: number;
  payoutCredited?: boolean;
  isCyclic?: boolean;
}

export interface RevenueRecord {
  id: string;
  userId: string;
  investmentId: string;
  productName: string;
  category: 'stability' | 'wellbeing' | string;
  vipLevel?: number;
  price: number;
  totalPayout: number;
  netProfit: number;
  durationDays: number;
  claimedAt: string;
  lastModified?: number;
}

export interface Commission {
  id: string;
  userId: string;
  fromUserName: string;
  level: 1 | 2 | 3;
  amount: number;
  createdAt: string;
  lastModified?: number;
}

export interface SystemNotification {
  id: string;
  userId?: string; // If undefined, it is global
  title: string;
  message: string;
  type: 'deposit' | 'withdraw' | 'bonus' | 'plan' | 'info' | 'reward';
  createdAt: string;
  read: boolean;
  isRead?: boolean;
  lastModified?: number;
}

export interface SupportMessage {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
  image?: string;
  createdAt: string;
  lastModified?: number;
  status?: 'unread' | 'read' | 'replied';
}

export interface BonusCode {
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  usedByUsers: string[]; // User IDs
  lastModified?: number;
}

export interface ChatSession {
  userId: string;
  userName: string;
  messages: SupportMessage[];
  lastUpdated: string;
}

export interface WithdrawalProof {
  id: string;
  userId: string;
  userName: string;
  userCountry: string;
  amount: number;
  message: string;
  image?: string; // Base64 or standard asset url
  likes: string[]; // List of user IDs who liked it
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastModified?: number;
}

export interface CategorySchedule {
  mode: 'auto' | 'open' | 'closed'; // 'auto' = suit les heures d'ouverture/fermeture; 'open' = forcé ouvert; 'closed' = forcé fermé
  openTime: string; // "HH:mm" ex: "08:00"
  closeTime: string; // "HH:mm" ex: "20:00"
  enabled: boolean; // active ou non la vérification horaire en mode auto
  lastModified?: number;
}

export interface CategorySchedules {
  wellbeing: CategorySchedule;
  withdrawals?: CategorySchedule;
  activity?: CategorySchedule;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category?: 'officiel' | 'important' | 'promotion' | 'maintenance' | 'info';
  badge?: string;
  createdAt: string;
  author?: string;
  imageUrl?: string;
  pinned?: boolean;
  lastModified?: number;
}

