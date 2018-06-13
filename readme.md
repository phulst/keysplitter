
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

splitter = new Splitter();

originalKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
keys = splitter.splitPrivateKey(originalKey);

// convert Buffer keys to Strings
keys.forEach(function(key) {
  console.log(key.toString('hex'));
});
// 010b81ea86f6207d633700331c0b70c1e06812e113bc865a780b9f84d1c756a4a892e438692421d9336e7e80e31e9dcd
// 120b54bfc1e621935f684887410aed6c5e1accf7d51d065e0bbbfaf04965d6e4462ae5502421d9336e7e80e31e9dcd
// 020b1e31af8c2bd50792344b810a56c956eef42dfd6cfcfb0bbbfaf04965d6e4462ae5509f84d1c756a4a892e43869

// restore private key with split key 0 and key 1
assert(splitter.restorePrivateKey(keys[0], keys[1]) === originalKey);
// true

// restore private key with split key 0 and key 2
assert(splitter.restorePrivateKey(keys[0], keys[2]) === originalKey);
// true

// restore private key with split key 1 and key 2
assert(splitter.restorePrivateKey(keys[1], keys[2]) === originalKey);
// true
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
