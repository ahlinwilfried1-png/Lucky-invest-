const fs = require('fs');

try {
  const dbPath = 'db.json';
  if (!fs.existsSync(dbPath)) {
    console.error('db.json does not exist!');
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const initialUsersCount = db.gi_users ? db.gi_users.length : 0;

  // Filter users to keep only admins
  const admins = (db.gi_users || []).filter(u => u.role === 'admin' || u.id === 'u-admin');

  console.log(`Found ${initialUsersCount} users total. Keeping ${admins.length} administrators.`);

  // Reset balances and earnings of admins to 0 for a completely fresh start
  const cleanedAdmins = admins.map(a => ({
    ...a,
    balance: 0,
    dailyEarnings: 0,
    totalEarnings: 0,
    bonus: 0
  }));

  // Update gi_users
  db.gi_users = cleanedAdmins;

  // WIPE deposits, withdrawals, investments, commissions, notifications, support messages, and proofs
  db.gi_deposits = [];
  db.gi_withdrawals = [];
  db.gi_investments = [];
  db.gi_commissions = [];
  db.gi_support_messages = [];
  db.gi_withdrawal_proofs = [];
  db.gi_notifications = [];
  db.gi_deleted_users = [];
  db.gi_deleted_investments = [];

  // Update cleanup timestamp to a very high/current value
  db.gi_cleanup_timestamp = Date.now();

  // Save back to db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  console.log('Database successfully wiped on disk! Non-admin users, all deposits, withdrawals, investments, and other transactions have been completely removed.');
} catch (error) {
  console.error('Error cleaning database:', error);
}
