import { createContext } from 'react';

export const AlertContext = createContext({
  message: null,
  error: false,
});
