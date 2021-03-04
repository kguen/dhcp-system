import { createContext } from 'react';

export const UserContext = createContext({
  token: localStorage.getItem('token'),
  data: null,
});
