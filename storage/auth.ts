import AsyncStorage from '@react-native-async-storage/async-storage';

export const USERS_STORAGE_KEY = '@storage/users';
export const CURRENT_USER_STORAGE_KEY = '@storage/currentUser';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  imageUri: string;
  createdAt: string;
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse stored value', error);
    return fallback;
  }
}

export async function getStoredUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_STORAGE_KEY);
  return safeParse<StoredUser[]>(raw, []);
}

export async function storeUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export async function addStoredUser(
  user: Omit<StoredUser, 'id' | 'createdAt'>,
): Promise<StoredUser> {
  const users = await getStoredUsers();
  const newUser: StoredUser = {
    ...user,
    email: user.email.trim().toLowerCase(),
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await storeUsers(users);

  return newUser;
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getStoredUsers();

  return users.find((user) => user.email === normalizedEmail);
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
  return safeParse<StoredUser | null>(raw, null);
}

export async function setCurrentUser(user: StoredUser | null): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
}
