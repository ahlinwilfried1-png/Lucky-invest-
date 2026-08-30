export interface User {
  id: string;
  name: string;
  whatsapp: string;
  password?: string;
  country: string;
  balance: number;
  dailyEarnings: number;
  totalEarnings: number;
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
  claimedMissions?: string[];
}

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  operator: string;
  reference: string;
  receiptImage: string; // Base64 or standard asset url
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastModified?: number;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  operator: string;
  number: string;
  status: 'pending' | 'approved' | 'rejected';
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
  price: number;
  dailyReturn: number;
  daysPassed: number;
  durationDays: number;
  totalReturnClaimed: number;
  lastClaimDate: string; // ISO string or short date
  status: 'active' | 'completed';
  category?: 'stability' | 'wellbeing' | 'activity' | string;
  createdAt: string;
  lastModified?: number;
  autoRenew?: boolean;
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
  type: 'deposit' | 'withdraw' | 'bonus' | 'plan' | 'info';
  createdAt: string;
  read: boolean;
  lastModified?: number;
}

export interface SupportMessage {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
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

