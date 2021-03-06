const ldapjs = require('ldapjs');
const ldapConfig = require('../config/ldapConfig');

const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);

ldapClient.bind(ldapConfig.pwdUser, ldapConfig.pwdPassword, async bindErr => {
  if (bindErr) throw bindErr;

  ldapClient.search(
    'ou=users,ou=system',
    {
      filter: '(objectClass=*)',
      scope: 'sub',
      attributes: ['sn'],
    },
    async (searchErr, res) => {
      if (searchErr) {
        throw searchErr;
      }
      const dnArr = [];

      res.on('searchEntry', entry => {
        if (entry.object.sn) {
          dnArr.push(entry.object.dn);
        }
      });
      res.on('error', err => {
        throw err;
      });
      // search finished
      res.on('end', async () => {
        // delete users and resolve all promises
        const promises = dnArr.map(dn =>
          ldapClient.del(dn, delArr => {
            if (delArr) throw delArr;
          })
        );
        await Promise.all(promises);
        // eslint-disable-next-line no-console
        console.log('Purging LDAP completed.');
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      });
    }
  );
});
