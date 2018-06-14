#!/usr/bin/env node

const program = require('commander');
const Splitter = require('../src/splitter');
const QRCode = require('qrcode');
const splitter = new Splitter();

function generateQrCode(str, filename, callback) {
    let options = {
        color: {
            dark: '#000',  // Blue dots
            light: '#FFF', // Transparent background
        },
        errorCorrectionLevel: 'L',
        scale: 7
    };

    QRCode.toFile(filename, str, options, (err) => {
        if (err) throw err;
        if (callback) callback();
    });
}


program
  .version('0.2.0')

// configure the split command
program
  .command('split <key>')
  .description('split private key into 3 redundant split keys')
  .option('-b, --barcode', 'generate barcodes')
  .action((k, options) => {

    let uid;
    splitter.splitPrivateKey(k).forEach((key, c) => {
      let str = key.toString('hex');
      // the unique filename is based on the last 4 characters of split key 1
      if (!uid) {
        uid = str.slice(-4);
      }
      console.log(`\nkey ${c+1}:\n${str}`);
      if (options.barcode) {
        // generate barcode as well
        generateQrCode(str, `sk-${uid}-${c}.png`);
      }
    });

    if (options.barcode)
      console.log('\ngenerated barcodes.');
  });

program
  .command('restore <key1> <key2>')
  .description('restore private key from 2 split keys')
  .action((k1, k2) => {
    let restoredKey = splitter.restorePrivateKey(k1, k2);
    console.log(`\nRestored key:\n${restoredKey}`);
  });

program.parse(process.argv);
