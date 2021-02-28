module.exports = {
  clientOptions: {
    url: process.env.LDAP_URL,
    timeout: process.env.LDAP_TIMEOUT,
    reconnect: true,
  },
  pwdUser: process.env.LDAP_USER,
  pwdPassword: process.env.LDAP_PASSWORD,
};
