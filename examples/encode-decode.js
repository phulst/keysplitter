const assert = require('assert');
const Splitter = require('../src/splitter');

splitter = new Splitter();

originalKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
keys = splitter.splitPrivateKey(originalKey);
console.dir(keys);
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
