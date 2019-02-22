const Mnemonic = require('bitcore-mnemonic');
//var secrets = require('secrets.js-grempe');

const bitcore = require('bitcore-lib');
const BN = bitcore.crypto.BN;
const Hash = bitcore.crypto.Hash;


// create a words map for quick lookup
const wordsArr = Mnemonic.Words.ENGLISH;
const words = {};
wordsArr.forEach((w,i) => { words[w] = i; });


// examples:
// toBinaryStr(7,8) returns '00000111'
// toBinaryStr(17,11) returns '00000010001'
function toBinaryStr(val, size) {
  const pad = "0000000000000000"; // this will work up to size 16
  let num = val.toString(2);
  return pad.substring(0, size - num.length) + num;
}

// converts a BIP39 phrase to a buffer of 16 - 32 bytes.
function bip39ToBuffer(str) {
  if (!isValidBip39(str)) {
    throw new Error("invalid BIP39 phrase");
  }
  const wrds = str.split(' ');
  let binStr = '';
  for (w of wrds) {
    binStr = binStr + toBinaryStr(words[w], 11);
  }
  //console.log("bin str : " + binStr);

  let entLength = (32 * wrds.length) / 3; // entropy length in bits
  //console.log("entropy length: " + entLength);
  let buffer = Buffer.alloc(entLength / 8);
  // we don't need the final 4-8 bits, those are just a checksum.
  for (let i=0; i<entLength/8 ; i++) {
    let n = binStr.slice(i*8,i*8+8);
    buffer.writeUInt8(parseInt(n, 2), i);
  }
  return buffer;
}

// converts a byte buffer to a BIP39 string
function bufToBip39(buf) {
  let m = new Mnemonic(buf);
  return m.phrase;
}

function isValidBip39(phrase) {
  let w = phrase.split(' ');
  // Mnemonic.isValid() throws an exception if the length of the phrase is
  // unexpected, so checking for that first
  if ([12,15,18,21,24].indexOf(w.length) < 0) {
    return false;
  }
  return Mnemonic.isValid(phrase);
}


// much like the official BIP39 spec, though differs in the following ways:
// - accepts any length input buffer
// - the last 4 bits of the string indicate how many bits of padding were
//   added before the Checksum
// - immediately before the padding bits, an 8 bit checksum is included.
// In other words, the total length of the binary string (before converting
// to words) is the number of bits in the data buffer, + 4 for padding indicator
// + 8 for checksum, + 0 to 10 bits for padding, so that the total length is a multiple of 11.
function bufToVarMnemonic(buffer) {
  // first convert all bytes in the buffer to a binary string
  let str = '';
  for (let i of [...buffer]) {
    str += toBinaryStr(i, 8);
  }

  // add some padding to ensure we'll end up with a total length that's a multiple of 11 bytes.
  let remainder = (str.length + 12) % 11;
  let addPadding;
  if (remainder > 0) {
    addPadding = 11 - remainder;
    //console.log("need to add " + addPadding);
    let padding = '00000000000';
    str += padding.slice(0, addPadding);
  }

  // add 4 bits that indicate the amount of padding we needed to add
  str += toBinaryStr(addPadding, 4);

  // finally, add the 8 bit checksum
  let checksum = calcChecksum(buffer);
  // console.log("checksum = " + checksum);
  str += checksum;

  //console.log(str);

  // now convert the binary string to a list of words
  let wrds = [];
  for (let i=0; i<str.length / 11; i++) {
    let s = str.slice(i*11,i*11+11);
    wrds.push(wordsArr[parseInt(s, 2)]);
  }
  return wrds.join(' ');
}

function parseVarMnemonic(phrase) {
  let vm = {};

  // parse to binary string first
  let binStr = '';
  for (w of phrase.split(' ')) {
    binStr += toBinaryStr(words[w], 11);
  }

  //console.log("full string: \n" + binStr);
  vm.checksum = parseInt(binStr.slice(-8), 2);

  // extract and parse the buffer data
  let padding = parseInt(binStr.slice(-12,-8), 2);
  let data = binStr.slice(0, binStr.length - 12 - padding);
  let buffer = Buffer.alloc(data.length / 8);
  for (let i=0; i<data.length/8; i++) {
    let n = data.slice(i*8,i*8+8);
    buffer.writeUInt8(parseInt(n, 2), i);
  }
  vm.buffer = buffer;

  // calculate the checksum on the buffer and verify that it matches with the
  // checksum from the mnemonic
  let check = parseInt(calcChecksum(buffer), 2);
  if (check != vm.checksum) {
    throw new Error("checksum mismatch, invalid mnemonic key");
  }
  return vm;
}

function varMnemonicToBuf(phrase) {
  try {
    let vm = parseVarMnemonic(phrase);
    return vm.buffer;
  } catch (err) {
    throw new Error("Invalid mnemonic", err);
  }
}

function isValidVarMnemonic(phrase) {
  try {
    let vm = parseVarMnemonic(phrase);
    // if this didn't throw an exception, it's valid
  } catch (err) {
    //console.error(err);
    return false;
  }
  return true;
}


function calcChecksum(buf) {
  var hash = Hash.sha256(buf);
  var hashbits = new BN(hash.toString('hex'), 16).toString(2);

  // zero pad the hash bits
  while (hashbits.length % 256 !== 0) {
    hashbits = '0' + hashbits;
  }
  var checksum = hashbits.slice(0, 8);
  return checksum;
}


module.exports = {
  bip39ToBuffer:  bip39ToBuffer,
  bufToBip39:     bufToBip39,
  bufToVarMnemonic: bufToVarMnemonic,
  varMnemonicToBuf: varMnemonicToBuf,
  isValidVarMnemonic: isValidVarMnemonic
}
