const Splitter = require('./splitter');


const key = ;

const splitter = new Splitter();


let codes = splitter.splitPrivateKey(key);

console.log("generated codes: ");
for (k of codes) {
  console.log(k.toString('base64'));
}
for (k of codes) {
  console.log(k.toString('hex'));
}
