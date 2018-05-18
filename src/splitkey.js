
const program = require('commander');

program
    .version('1.0.0')
    .command('splitkey <file...>')
    .option('-s, --split <keyfile>', 'Split a key into 3 secure, redundant parts')
    .option('-r, --restore <splitkey-file> <splitkey-file>', 'Restore a key from 2 split keys')
    .parse(process.argv);



splitkey create <filename> -qr
splitkey restore <key1> <key2>

-qr crete QR code

