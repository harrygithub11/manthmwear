const bcrypt = require('bcryptjs');

const password = 'MANTHMwaer@8989';
const hash = bcrypt.hashSync(password, 10);

console.log('='.repeat(80));
console.log('ADMIN PASSWORD HASH GENERATOR');
console.log('='.repeat(80));
console.log('\nPassword:', password);
console.log('\nBcrypt Hash:');
console.log(hash);
console.log('\n' + '='.repeat(80));
console.log('SQL UPDATE STATEMENT:');
console.log('='.repeat(80));
console.log('\nUPDATE sitesettings');
console.log("SET adminPasswordHash = '" + hash + "'");
console.log('WHERE id = (SELECT id FROM (SELECT id FROM sitesettings LIMIT 1) AS temp);');
console.log('\n' + '='.repeat(80));
console.log('Copy the SQL statement above and run it in your MySQL database');
console.log('='.repeat(80));
