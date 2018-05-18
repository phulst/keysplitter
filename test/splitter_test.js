const assert = require('assert');
const should = require('chai').should();
const Splitter = require('../src/splitter');

let splitter;
let testKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';


function toHex(key) {
    return key.toString('hex');
}

describe('splitter', () => {
    beforeEach(() => {
        splitter = new Splitter();
    });


    describe("splitInto3Parts", () => {
        it("should split the original key in 3 parts", () => {
            let res = splitter.splitInto3Segments(testKey);
            res.keySegments.should.have.lengthOf(3);
        });

        it("should return a key length of 11", () => {
            let res = splitter.splitInto3Segments(testKey);
            res.keyLength.should.equal(11);
        });

        it("should add up to total the length of the original key", () => {
            let res = splitter.splitInto3Segments(testKey);
            let keys = res.keySegments;
            let total = 0;
            for (let i of keys) {
                total += i.length;
            }
            total.should.equal(32);
        })

        it("should work with short keys as well", () => {
            let res = splitter.splitInto3Segments("11223344556677889900");
            res.keyLength.should.equal(4);
            toHex(res.keySegments[0]).should.equal("112233");
            toHex(res.keySegments[1]).should.equal("445566");
            toHex(res.keySegments[2]).should.equal("77889900");
        });

    });

    describe("makeOTPKeys", () => {
        it("should always create 3 keys", () => {
            let keys = splitter.createOTPKeys(11);
            keys.should.have.lengthOf(3);
        });
        it("should create keys of the specified length", () => {
            let keys = splitter.createOTPKeys(11);
            keys[0].length.should.equal(11);
            keys[1].length.should.equal(11);
            keys[2].length.should.equal(11);
        });
    });

    describe("makeSplitKey", () => {
        beforeEach(() => {
            let res = splitter.splitInto3Segments(testKey);
            this.keyLength = res.keyLength;
            this.keySegments = res.keySegments;
            this.pads = splitter.createOTPKeys(res.keyLength);
        });

        it("should generate type 1 key", () => {
            let key1 = splitter.makeSplitKey(0x01, this.keySegments, this.keyLength, this.pads);
            key1[0].should.equal(0x01);
            key1.should.have.lengthOf(48);
        });
        it("should generate type 2 key", () => {
            let key1 = splitter.makeSplitKey(0x12, this.keySegments, this.keyLength, this.pads);
            key1[0].should.equal(0x12);
            key1.should.have.lengthOf(47);
        });
        it("should generate type 3 key", () => {
            let key1 = splitter.makeSplitKey(0x02, this.keySegments, this.keyLength, this.pads);
            key1[0].should.equal(0x02);
            key1.should.have.lengthOf(47);
        });
        // TODO: we could test more values in the buffer here but those are implictly tested in the
        // end-to-end test.
    });

    describe("splitPrivateKey", () => {
        it ("should generate three split keys", () => {
            let splitKeys = splitter.splitPrivateKey(testKey);
            splitKeys.should.have.lengthOf(3);
        });
        it ("key 1 should be 48 bytes long", () => {
            let splitKeys = splitter.splitPrivateKey(testKey);
            splitKeys[0].should.have.lengthOf(48);
        });
        it ("key 2 should be 47 bytes long", () => {
            let splitKeys = splitter.splitPrivateKey(testKey);
            splitKeys[1].should.have.lengthOf(47);
        });
        it ("key 3 should be 47 bytes long", () => {
            let splitKeys = splitter.splitPrivateKey(testKey);
            splitKeys[2].should.have.lengthOf(47);
        });
    });

    describe("extractCode", () => {
        it ("should extract the right segments from a split key", () => {
            let splitKey = "010b2fc62109187bbb70f391e50bdeed47972ae7cbfb75f8810b87a892ec1b1d855a793e05163914ecdc4174541ff44a";
            let key = new Buffer(splitKey, 'hex');
            let p = splitter.extractCode(key);

            p.partType.should.equal(0x01);
            toHex(p.part1).should.equal("2fc62109187bbb70f391e5");
            toHex(p.part2).should.equal("deed47972ae7cbfb75f881");
        });
        it ("should extract the right OTP keys from a split key", () => {
            let splitKey = "010b2fc62109187bbb70f391e50bdeed47972ae7cbfb75f8810b87a892ec1b1d855a793e05163914ecdc4174541ff44a";
            let key = new Buffer(splitKey, 'hex');
            let p = splitter.extractCode(key);

            p.partType.should.equal(0x01);
            toHex(p.pad1).should.equal("87a892ec1b1d855a793e05");
            toHex(p.pad2).should.equal("163914ecdc4174541ff44a");
        });
    });

    describe("retrievePads", () => {
        const splitKey1 = "010bd95d278679faee51d17d0a0b287641184b669eda57146e0b0c9e3f5766f8ee23ca3c7bcca3c42e9b028b50ab9618";
        const splitKey2 = "120bc7a52f7611cf19d96683530a7e76b08afcab93ac285a0be34d51393c516920fbab46cca3c42e9b028b50ab9618";
        const splitKey3 = "020bf6b3b291dea90c218140540abe4b4bf30151f6df49f00be34d51393c516920fbab460c9e3f5766f8ee23ca3c7b";

        it ("should succesfully extract all OTP keys from 2 split keys", () => {
            let key1 = new Buffer(splitKey1, 'hex');
            let key2 = new Buffer(splitKey2, 'hex');
            let p1 = splitter.extractCode(key1);
            let p2 = splitter.extractCode(key2);

            let pads = splitter.retrievePads(p1, p2);
            toHex(pads[0]).should.equal("e34d51393c516920fbab46");
            toHex(pads[1]).should.equal("0c9e3f5766f8ee23ca3c7b");
            toHex(pads[2]).should.equal("cca3c42e9b028b50ab9618");
        });
    });

    describe("encode and decode", () => {
        beforeEach(() => {
            this.splitKeys = splitter.splitPrivateKey(testKey);
        });

        it("should successfully decode with keys 1 and 2", () => {
            let fullKey = splitter.restorePrivateKey(this.splitKeys[0], this.splitKeys[1]);
            fullKey.should.equal(testKey);
        });
        it("should successfully decode with keys 2 and 1", () => {
            let fullKey = splitter.restorePrivateKey(this.splitKeys[1], this.splitKeys[0]);
            fullKey.should.equal(testKey);
        });
        it("should successfully decode with keys 1 and 3", () => {
            let fullKey = splitter.restorePrivateKey(this.splitKeys[0], this.splitKeys[2]);
            fullKey.should.equal(testKey);
        });
        it("should successfully decode with keys 3 and 1", () => {
            let fullKey = splitter.restorePrivateKey(this.splitKeys[2], this.splitKeys[0]);
            fullKey.should.equal(testKey);
        });
        it("should successfully decode with keys 2 and 3", () => {
            let fullKey = splitter.restorePrivateKey(this.splitKeys[1], this.splitKeys[2]);
            fullKey.should.equal(testKey);
        });
        it("should successfully decode with keys 3 and 2", () => {
            let fullKey = splitter.restorePrivateKey(this.splitKeys[2], this.splitKeys[1]);
            fullKey.should.equal(testKey);
        });
    });
});
