const fs = require('fs');
// Read the base64 encoded content from the argument file
const b64 = fs.readFileSync(process.argv[2], 'utf8').trim();
const decoded = Buffer.from(b64, 'base64').toString('utf8');
fs.writeFileSync(process.argv[3], decoded, 'utf8');
console.log('Written', decoded.length, 'bytes to', process.argv[3]);
