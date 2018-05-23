
# installation

```
npm install keysplitter
```


This tool lets you split up your crypto private key into 3 separate keys, each with 
equal cryptographic strength. 

You can restore your original private key with 2 of these keys, so any single key is 
redundant. 

A command line tool is in the works, but it can be used in Node as follows:

```javascript
Splitter = require('keysplitter');
splitter = new Splitter();

originalKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266'; 
keys = splitter.splitPrivateKey(originalKey);

// convert Buffer keys to Strings
strKeys = keys.map((key) => { return key.toString('hex') });
console.dir(strKeys);

// now you can restore the private key using any 2 of the keys. 
let restoredKey = splitter.restorePrivateKey(keys[2], keys[0]);

console.log(key === restoredKey);
// true

```