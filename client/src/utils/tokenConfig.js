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
