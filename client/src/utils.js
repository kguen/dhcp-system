import axios from 'axios';

export const dhcpApi = axios.create({
  baseURL: 'http://localhost:3030/api/',
});

export const tokenConfig = (user, formData = false) => {
  const config = {
    headers: {
      'Content-Type': formData ? 'multipart/form-data' : 'application/json',
    },
  };
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
};

export const sanitized = data =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === '' ? null : value,
    ])
  );
