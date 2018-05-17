const crypto = require('crypto');
const QRCode = require('qrcode');


function generateKey(numBytes) {
    return crypto.randomBytes(numBytes).toString('hex');
}


const PART_COMBINATIONS = [
  0x01,  // part 1 and 2
  0x12,  // part 2 and 3
  0x02   // part 1 and 3
];

function xor(a, b) {
    var length = Math.max(a.length, b.length);
    var buffer = Buffer.allocUnsafe(length);

    for (var i = 0; i < length; ++i) {
        buffer[i] = a[i] ^ b[i]
    }
    return buffer;
}


/**
 * splits the private key into three almost equal parts. For 32 byte Ethereum addresses, this will
 * return 3 buffers containing 11, 11 and 10 bytes.
 * @param key the private key (string) to split up
 */
function splitInto3Parts(key) {
    // we're going to split in 3 parts
    const buf = new Buffer(key, 'hex');

    // we're going to split in 3 parts
    let start=0, end=0;
    let bufpart = [];
    let partLen = Math.ceil(buf.length / 3);
    console.log("part length = " + partLen);
    for (let i=0; i<3; i++) {
      if (i == 2) {
        // last element store the remainder
        end = buf.length;
      } else {
        end = start + partLen;
      }
      bufpart[i] = buf.slice(start, end);
      start = start + bufpart[i].length;
    }
    let keyLength = Math.max(partLen, bufpart[2].length); // this will typically be 11 for Ethereum private keys
    console.log("key length = " + keyLength);
    return [bufpart, keyLength];
}


/**
 * creates a buffer containing the data for the barcode
 * @param keyType
 * @param keypart
 */
function constructKeys(partCombo, keypart, keyLength, ciphers) {
    // generate 3 random keys to be used
    let buf = [partCombo];
    let p1, p2, keys;
    if (partCombo === PART_COMBINATIONS[0] ) {
        p1 = xor(keypart[0], ciphers[0]);
        p2 = xor(keypart[1], ciphers[0]);
        keys = [ciphers[1],ciphers[2]];   // add the other two ciphers, one of which will be needed to decrypt
    } else if (partCombo === PART_COMBINATIONS[1] ) {
        p1 = xor(keypart[1], ciphers[1]);
        p2 = xor(keypart[2], ciphers[1]);
        keys = [ciphers[0],ciphers[2]];
    } else if (partCombo === PART_COMBINATIONS[2] ) {
        p1 = xor(keypart[0], ciphers[2]);
        p2 = xor(keypart[2], ciphers[2]);
        keys = [ciphers[0],ciphers[1]];
    }
    buf.push(p1.length);
    buf.push(...p1);
    buf.push(p2.length);
    buf.push(...p2);
    buf.push(keyLength);
    buf.push(...keys[0]);
    buf.push(...keys[1]);
    
    return new Buffer(buf);
}


function createCodes(privateKey) {
    let [keyparts, keyLength] = splitInto3Parts(key);

    let ciphers = [];
    for (let i=0; i<3; i++) {
        ciphers[i] = crypto.randomBytes(keyLength);
        console.log("created secret key " + (new Buffer(ciphers[i]).toString('hex') ));
    }

    let codes = [
        constructKeys(PART_COMBINATIONS[0], keyparts, keyLength, ciphers),
        constructKeys(PART_COMBINATIONS[1], keyparts, keyLength, ciphers),
        constructKeys(PART_COMBINATIONS[2], keyparts, keyLength, ciphers)
    ];

    console.log("generated codes: ");
    for (k of codes) {
        console.log(k.toString('base64'));
    }
    return codes;
}

function decodeKey(str) {
    //console.log((new Buffer(str, 'base64')))
    let res = {}, length;
    // move the data into a byte array
    let arr = [...(new Buffer(str, 'base64'))];
    res.partType = arr[0]; // should be one of the PART_COMBINATIONS values
    length = arr[1];
    let c = 2;
    res.part1 = arr.slice(c, c+length);
    c += length;
    length = arr[c];
    res.part2 = arr.slice(c, c+length);
    let keylength = arr[c+length+1];
    c += length + 1;
    res.key1 = arr.slice(c, c+keylength);
    c += keylength;
    res.key2 = arr.slice(c, c+keylength);
    return res;
}

/**
 *  a(key1)  b(key1)  key2  key3   TYPE 1
 *  b(key2)  c(key2)  key1  key3   TYPE 2
 *  a(key3)  c(key3)  key1  key2   TYPE 3
 *  
 */

/**
 * generates 3 QR codes from an encrypted private key. This private key can be decrypted
 * again with the password, and with 2 of the QR codes.
 * @param key array of data to put in QR Code
 * @param filename filename to store QR Code at
 */
function generateQrCode(str, filename, callback) {
  let options = {
    color: {
      dark: '#00F',  // Blue dots
      light: '#0000' // Transparent background
    },
    errorCorrectionLevel: 'M'
  };

  QRCode.toFile(filename, str, options, (err) => {
    if (err) throw err;
    if (callback) callback();
  });
}

function restorePrivateKey(key1, key2) {
    let res1 = decodeKey(key1);
    console.dir(res1);

    let res2 = decodeKey(key2);
    console.dir(res2);

    // TODO: decrypt parts with keys from the other key

}

const key = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';

keys = createCodes(key);

for (let i=0; i<3; i++) {
    generateQrCode(keys[i].toString('base64'), `split_${i+1}`);
}




restorePrivateKey(keys[0], keys[1]);



//console.log("as hex:   " + buf.toString('hex'));
//console.log("as base64 " + buf.toString('base64'));




//console.log(generateKey(11));