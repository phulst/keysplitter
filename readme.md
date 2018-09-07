
# installation

```
npm install keysplitter
```


This tool lets you split up your crypto private key into 3 separate keys, each with
equal cryptographic strength.

Here's how you would use this:
1. Create your 3 split keys and store them in 3 different physical places
(preferably in a paper wallet or other offline storage)
2. Destroy the original private key. (yes, this is safer than keeping it)
3. Later, when you need to access your crypto account again, you can restore your
private key with any 2 out of the 3 split keys.

Why is this better than pretty much all other methods out there?
- storing your private keys on your computer makes it susceptible to theft by a hacker.
- if you encrypt your private keys using some password, you now need to worry about finding
a safe place to keep your password. If you don't write it down anywhere, and you forget it,
or something was to happen to you, you and/or your family will lose it all.
- if you store your private key on a paper wallet in your safe, you can lose everything
through theft or if your house burns down.
- if you keep your private key in multiple places (for redundancy), it will make it
less likely that you will lose it, but it will also make it more likely to get stolen.
- if you cut up your private key into 2 or more pieces and store it in multiple places,
you can lose access to all your crypto funds if you lose just one piece.


The split keys that this script generates eliminates all of the above risks in an elegant
and ultra-secure way.

If any of your 3 keys get stolen, nothing is lost. It's useless to a thief, and you can
still access your account using the other 2 keys.


## using this library


```javascript
const assert = require('assert');
const Splitter = require('splitter');
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

(add the -b or --barcode option to have it also generate barcode PNG images)

To restore private key from any 2 split keys:

```
keysplitter restore 120bc4f5f571d3b89ececb47770a7d266a8d3edc14bb859e0b1b9e7951556ca8aa51958e0ba8e574e2d501c562f6ed \
020b31b893cba77e86b44820a10a79406aa978867c4a80900b1b9e7951556ca8aa51958e0fcee550a48f693467f85f
```

A tool to restore a private key directly from barcode images is in the works.
