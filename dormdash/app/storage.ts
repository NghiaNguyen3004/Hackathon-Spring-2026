// src/auth/storage.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure directory exists (demo convenience)
async function ensureDataDir() {
  const dir = path.dirname(USERS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Type definition for what we store
export interface StoredUser {
  username: string;
  passwordHash: string;
  fullName?: string;
}

export interface UsersData {
  users: StoredUser[];
}

/**
 * Loads all users from the JSON file.
 * Returns empty array if file does not exist yet.
 */
export async function loadUsers(): Promise<UsersData> {
  try {
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const data = JSON.parse(content) as UsersData;
    return {
      users: Array.isArray(data.users) ? data.users : [],
    };
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // File doesn't exist yet → return empty structure
      return { users: [] };
    }
    throw err;
  }
}

/**
 * Saves the entire users array back to disk.
 * Use with caution — in real apps this pattern quickly leads to race conditions.
 */
export async function saveUsers(data: UsersData): Promise<void> {
  await ensureDataDir();
  const json = JSON.stringify(data, null, 2); // pretty-print for readability in demo
  await fs.writeFile(USERS_FILE, json, 'utf-8');
}

/**
 * Adds a new user (signup flow) — hashes password before storing
 */
export async function createUser(
  username: string,
  plainPassword: string,
  fullName?: string
): Promise<void> {
  const data = await loadUsers();

  // Basic uniqueness check (demo only — real apps need atomic operations)
  if (data.users.some((u) => u.username === username)) {
    throw new Error(`Username "${username}" is already taken`);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  data.users.push({
    username,
    passwordHash,
    fullName,
  });

  await saveUsers(data);
}

/**
 * Verifies login credentials
 * Returns the user object if credentials are valid, otherwise null
 */
export async function verifyCredentials(
  username: string,
  plainPassword: string
): Promise<StoredUser | null> {
  const data = await loadUsers();

  const user = data.users.find((u) => u.username === username);
  if (!user) return null;

  const match = await bcrypt.compare(plainPassword, user.passwordHash);
  return match ? user : null;
}