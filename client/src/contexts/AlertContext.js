import { createContext } from 'react';
import { ALERT_TYPE } from '../constants';

export const AlertContext = createContext({
  message: null,
  type: ALERT_TYPE.success,
});
