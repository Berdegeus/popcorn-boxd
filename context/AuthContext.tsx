import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  StoredUser,
  addStoredUser,
  findUserByEmail,
  getCurrentUser,
  setCurrentUser,
  updateStoredUser,
} from '@/storage/auth';
import { createPasswordHash, isPasswordValid } from '@/utils/password';

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  name: string;
  email: string;
  password: string;
  imageUri: string | null;
};

export type UpdateProfileParams = {
  name: string;
  email: string;
  imageUri?: string | null;
  password?: string;
  confirmPassword?: string;
};

export type AuthContextValue = {
  user: StoredUser | null;
  isSessionLoading: boolean;
  signIn: (params: SignInParams) => Promise<StoredUser>;
  signUp: (params: SignUpParams) => Promise<StoredUser>;
  signOut: () => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<StoredUser>;
  loadStoredSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const loadStoredSession = useCallback(async () => {
    setIsSessionLoading(true);

    try {
      const storedUser = await getCurrentUser();
      setUser(storedUser);
    } finally {
      setIsSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStoredSession();
  }, [loadStoredSession]);

  const signIn = useCallback(async ({ email, password }: SignInParams) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      throw new Error('Informe e-mail e senha para continuar.');
    }

    const storedUser = await findUserByEmail(normalizedEmail);

    if (!storedUser || !isPasswordValid(trimmedPassword, storedUser.passwordHash)) {
      throw new Error('Credenciais inválidas. Tente novamente.');
    }

    await setCurrentUser(storedUser);
    setUser(storedUser);

    return storedUser;
  }, []);

  const signUp = useCallback(async ({ name, email, password, imageUri }: SignUpParams) => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !normalizedEmail || !trimmedPassword) {
      throw new Error('Preencha todos os campos para continuar.');
    }

    if (!imageUri) {
      throw new Error('Selecione uma foto de perfil.');
    }

    const emailPattern = /\S+@\S+\.\S+/;

    if (!emailPattern.test(normalizedEmail)) {
      throw new Error('Informe um e-mail válido.');
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const newUser = await addStoredUser({
      email: normalizedEmail,
      name: trimmedName,
      passwordHash: createPasswordHash(trimmedPassword),
      imageUri,
    });

    await setCurrentUser(newUser);
    setUser(newUser);

    return newUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await setCurrentUser(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear stored session', error);
      throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
    }
  }, []);

  const updateProfile = useCallback(
    async ({ name, email, imageUri, password, confirmPassword }: UpdateProfileParams) => {
      if (!user) {
        throw new Error('É necessário estar autenticado para editar o perfil.');
      }

      const trimmedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const resolvedImage = imageUri === undefined ? user.imageUri : imageUri;
      const trimmedPassword = password?.trim() ?? '';
      const trimmedConfirmPassword = confirmPassword?.trim() ?? '';

      if (!trimmedName || !normalizedEmail) {
        throw new Error('Preencha nome e e-mail para continuar.');
      }

      if (!resolvedImage) {
        throw new Error('Selecione uma foto de perfil.');
      }

      const emailPattern = /\S+@\S+\.\S+/;

      if (!emailPattern.test(normalizedEmail)) {
        throw new Error('Informe um e-mail válido.');
      }

      if (trimmedPassword || trimmedConfirmPassword) {
        if (!trimmedPassword || !trimmedConfirmPassword) {
          throw new Error('Informe e confirme a nova senha para continuar.');
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
          throw new Error('As senhas informadas não coincidem.');
        }
      }

      const existingUser = await findUserByEmail(normalizedEmail);

      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Este e-mail já está cadastrado por outro usuário.');
      }

      const nextUser = await updateStoredUser({
        ...user,
        name: trimmedName,
        email: normalizedEmail,
        imageUri: resolvedImage,
        passwordHash: trimmedPassword ? createPasswordHash(trimmedPassword) : user.passwordHash,
      });

      await setCurrentUser(nextUser);
      setUser(nextUser);

      return nextUser;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isSessionLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      loadStoredSession,
    }),
    [user, isSessionLoading, signIn, signUp, signOut, updateProfile, loadStoredSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
