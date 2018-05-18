const assert = require('assert');
const should = require('chai').should();
const Splitter = require('../splitter');

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
});