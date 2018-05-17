

const sha1 = require('sha1');
const QRCode = require('qrcode');


const crypto = require('crypto'),
  algorithm = 'aes-256-ctr';

//const IV = crypto.randomBytes(16);
const IV = Buffer.alloc(16);
console.log("Using IV: ");
console.log(IV);

// currently support splitting the key in 3 sections.
const NUM_PARTS = 3;
// will be encoded in the barcode so we know which of the 3 barcode types we're dealing with
const PART_COMBINATIONS = [
  0x12,  // part 1 and 2
  0x23,  // part 2 and 3
  0x13,  // part 1 and 3
];

//const IV = Buffer.from(crypto.randomBytes(16)'someIsdsfdsdfkhkj28fskdfsdfdsV'.slice(0,16), 'hex');

function secretKey(password) {
  let pwd = sha1(password).substr(0,32);
  //console.log("using password: " + pwd);
  return new Buffer(pwd);
}

/**
 * encrypts a given Buffer and returns a base64 string
 * @param buf
 * @param pwd
 * @returns {*}
 */
function encrypt(buf, pwd) {
  let cipher = crypto.createCipheriv(algorithm, secretKey(pwd), IV);
  let crypted = cipher.update(buf, null, 'base64');
  return crypted + cipher.final('base64');
}

function decrypt(text, pwd){
  let decipher = crypto.createDecipheriv(algorithm, secretKey(pwd), IV);
  let dec = decipher.update(text, 'base64')
  dec += decipher.final();
  return dec;
}

function genBarcodeData(key1, key2, key3) {
  let k1 = key1 ? (new Buffer(key1).toString('hex')) : 0;
  let k2 = key2 ? (new Buffer(key2).toString('hex')) : 0;
  let k3 = key3 ? (new Buffer(key3).toString('hex')) : 0;
  return `${k1}|${k2}|${k3}`;
}

/**
 * creates the QR code string. This is assembled as follows:
 *
 * 1 byte: part combination (one of the PART_COMBINATIONS values)
 * 1 byte: length of the first key part
 * n bytes: the first key part
 * 1 byte: lenght of the second key part
 * m bytes: the second key part
 * @param partCombo
 * @param parts
 * @param pwd
 * @returns buffer containing the barcode data
 */
function genEncryptedBarcodeData(partCombo, parts, pwd) {
  if (pwd) {
    // we are going to put the parts together in a binary buffer,
    // before encrypting the key
  } else {
    // we are going to embed the key in plain text, so it can
    // be reconstructed by reading it with any barcode reader and putting
    // the parts back together
    if (partCombo === PART_COMBINATIONS[0]) {
      // part 1 and 2
      key1 = parts[0];
      key2 = parts[1];
      key3 = 0;
    } else if (partCombo === PART_COMBINATIONS[1]) {
      // part 1 and 2
      key1 = 0;
      key2 = parts[0];
      key3 = parts[1];
    } else if (partCombo === PART_COMBINATIONS[3]) {
      // part 1 and 3
      key1 = 0;
      key2 = parts[0];
      key3 = parts[1];
    }
  }


  let buf = [partCombo];
  parts.forEach((part) => {
    buf.push(part.length);
    buf.push(...part);
  });

  console.log("part " + partCombo.toString(16));
  console.dir((new Buffer(buf)).toString('hex'));

  buf = new Buffer(buf);
  if (pwd) {
    console.log("need to encrypt");
    let enc = encrypt(buf, pwd);
    console.log(buf.toString('hex') + " encrypted = " + enc);
    return enc; // already base64 encoded
  } else {
    // add the '-' to indicate the key is not encrypted with a password.
    return (new Buffer(buf)).toString('base64') + '-';
  }
}

/**
 * generates all 3 barcodes
 * @param key
 * @param password
 * @returns array of QR barcodes
 */
function splitAndEncrypt(key, password) {
  // read key into binary buffer
  const buf = new Buffer(key, 'hex');
  // convert to array
  const arr = [...buf];

  // we're going to split in 3 parts
  let start=0, end = 0;
  let bufpart = [];
  let partLen = Math.round(buf.length / NUM_PARTS);
  console.log(" part length = " + partLen);
  for (let i=0; i<NUM_PARTS; i++) {
    if (i == NUM_PARTS - 1) {
      // last element store the remainder
      end = buf.length;
    } else {
      end = start + partLen;
    }
    console.log(`adding ${start} to ${end}`);
    bufpart[i] = buf.slice(start, end);
    start = start + bufpart[i].length;
    console.log(`part ${i}: ${(new Buffer(bufpart[i])).toString('hex')}`);
  }

  // now that we've split the key, create the 3 bar codes
  let barcodes = [
    genBarcodeData(PART_COMBINATIONS[0], [bufpart[0], bufpart[1]], pwd),
    genBarcodeData(PART_COMBINATIONS[1], [bufpart[1], bufpart[2]], pwd),
    genBarcodeData(PART_COMBINATIONS[2], [bufpart[0], bufpart[2]], pwd)
  ];
  return barcodes;
}

function extractKeyParts(str) {
  console.log("extracted key: ");
  //console.log((new Buffer(str, 'base64')))

  // move the data into a byte array
  let arr = [...(new Buffer(str, 'base64'))];
  let partType = arr[0]; // should be one of the PART_COMBINATIONS values
  let keypart = [];
  let c = 1;
  let i = 0;
  do {
    let length = arr[c];
    let buf = arr.slice(c+1, c+1+length);
    keypart[i] = (new Buffer(buf)).toString('hex')
    c += length + 1;
    i += 1;
  } while (c < arr.length)

  // put the key parts back into a 3 element array, based on which type (PART_COMBINATIONS)
  // this key was.
  let keys;
  switch (partType) {
    case 0x12:
      keys = [keypart[0], keypart[1], null];
      break;
    case 0x23:
      keys = [null, keypart[0], keypart[1]];
      break;
    case 0x13:
      keys = [keypart[0], null, keypart[1]];
      break;
    default:
      throw new Error("unknown key part: " + partType);
  }
  // console.log("extracted");
  // console.dir(keys);
  return keys;
}

/**
 * restores the original key from 2 QRcode values, and an optional password.
 * @param key1
 * @param key2
 * @param pwd
 * @returns {string}
 */
function decryptWithKeys(key1, key2, pwd) {
  let dec1, dec2;
  if (key1.endsWith('-') && key2.endsWith('-')) {
    console.log("This QR Code split key was not password protected")
    dec1 = extractKeyParts(key1.substr(0,key1.length-1));
    dec2 = extractKeyParts(key2.substr(0,key2.length-1));
  } else if (!key1.endsWith('-') && !key2.endsWith('-')) {
    console.log("This QR Code split key was password protected");
  } else {
    throw new Error("These barcodes are not for the same key");
  }

  let d = [];
  for (let i=0; i<3; i++) {
    // either dec1 or dec2 should contain each part
    if (dec1[i] && dec2[i] && dec1[i] != dec2[i]) {
      throw new Error(`key 1 and key 2 are not associated with the same private key!`);
    }
    d[i] = dec1[i] ? dec1[i] : dec2[i];
  }
  return d.join('');
}


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


const key = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
//const pwd = 'anothrd';
const pwd = null;
//onst pwd = '';




// first get the 3 encrypted keys
let barcodes = splitAndEncrypt(key, pwd);
// then create the QR codes
barcodes.forEach((buf, i) => {
  console.log("barcode as base64 " + buf.toString('base64'));
  generateQrCode(buf, `pk-${i}.png`);
});

//
console.log("original key");
console.log(key);
//
//
let fullKey = decryptWithKeys(barcodes[0], barcodes[1], pwd);
console.log("constructed from 0 and 1");
console.log(fullKey);

fullKey = decryptWithKeys(barcodes[1], barcodes[2], pwd);
console.log("constructed from 1 and 2");
console.log(fullKey);

fullKey = decryptWithKeys(barcodes[0], barcodes[2], pwd);
console.log("constructed from 0 and 2");
console.log(fullKey);
