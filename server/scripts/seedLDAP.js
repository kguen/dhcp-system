const ldapjs = require('ldapjs');
const { promisify } = require('util');
const ldapConfig = require('../config/ldapConfig');
const { User } = require('../models');

const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);

ldapClient.bind(ldapConfig.pwdUser, ldapConfig.pwdPassword, async bindErr => {
  if (bindErr) {
    throw bindErr;
  }
  // create LDAP entries from MySQL database
  const sqlUsers = await User.findAll();
  const ldapUsers = sqlUsers.map(user => ({
    uid: user.username,
    cn: user.fullName,
    sn: user.fullName.split(' ')[0],
    userPassword: 'abc123',
    objectClass: ['person', 'organizationalPerson', 'inetOrgPerson'],
  }));
  // promisify LDAP function
  const ldapAdd = promisify(ldapClient.add).bind(ldapClient);
  // insert data to ldap and resolve all promises
  await Promise.all(
    ldapUsers.map(async user => {
      await ldapAdd(`uid=${user.uid},ou=users,ou=system`, user);
    })
  );
  // eslint-disable-next-line no-console
  console.log('Seeding LDAP completed.');
  // eslint-disable-next-line no-process-exit
  process.exit(0);
});
