
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
const assert = require('assert');
const Splitter = require('./splitter');
const splitter = new Splitter();

const originalKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
let keys = splitter.splitPrivateKey(originalKey);
console.dir(keys);
//[ '010b5701057440e7740c9628a00ba62a63ea727b04871041c40b1168e6b2a5963e158dd64c1588c8714efcf8885ebc50',
//  '020bda53f693d2a1c9ef2169640a6380696f3fc5439a6fb00b6d1173cb054cf37dbcfeec1588c8714efcf8885ebc50',
//  '030b2f98bece0b577ff9746a1c0a676047acd4af8507bcda0b6d1173cb054cf37dbcfeec1168e6b2a5963e158dd64c' ]

// We can restore the private key with split key 0 and key 1
assert(splitter.restorePrivateKey(keys[0], keys[1]) === originalKey);  // true

// or we can restore it using key 0 and key 2
assert(splitter.restorePrivateKey(keys[0], keys[2]) === originalKey);  // true

// or we can restore it using key 1 and key 2
assert(splitter.restorePrivateKey(keys[1], keys[2]) === originalKey);  // true
```

## Command line tool

To create split keys:

```
keysplitter split 3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266
```

(add the -b or --barcode option to have it also generate barcode images)

To restore private key from any 2 split keys:

```
keysplitter restore 120bc4f5f571d3b89ececb47770a7d266a8d3edc14bb859e0b1b9e7951556ca8aa51958e0ba8e574e2d501c562f6ed \
020b31b893cba77e86b44820a10a79406aa978867c4a80900b1b9e7951556ca8aa51958e0fcee550a48f693467f85f
```
