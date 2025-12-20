import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';

const STORAGE_TOKEN_KEY = 'auth.token';
const STORAGE_USER_KEY = 'auth.user';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY) || '';
  const rawUser = localStorage.getItem(STORAGE_USER_KEY);
  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }
  return { token, user };
};

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(() => readStoredAuth());

  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_TOKEN_KEY, token);
    else localStorage.removeItem(STORAGE_TOKEN_KEY);

    if (user) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_USER_KEY);
  }, [token, user]);

  const isAuthenticated = Boolean(token);

  const signIn = async credentials => {
    const result = await authApi.login(credentials);
    const nextToken = result?.token || '';
    const nextUser = {
      login: result?.login,
      fullName: result?.fullName,
      role: result?.role,
      email: result?.email,
    };
    setAuth({ token: nextToken, user: nextUser });
    return result;
  };

  const signUp = async payload => {
    const result = await authApi.register(payload);
    const nextToken = result?.token || '';
    const nextUser = {
      login: result?.login,
      fullName: result?.fullName,
      role: result?.role,
      email: result?.email,
    };
    setAuth({ token: nextToken, user: nextUser });
    return result;
  };

  const signOut = () => {
    setAuth({ token: '', user: null });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
    }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

