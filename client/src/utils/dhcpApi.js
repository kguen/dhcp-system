import axios from 'axios';

export const dhcpApi = axios.create({
  baseURL: 'http://localhost:3030/api/',
});
