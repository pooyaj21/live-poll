import * as SecureStore from 'expo-secure-store';

/** `TokenStorage` for Convex Auth backed by the iOS Keychain / Android Keystore. */
export const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
