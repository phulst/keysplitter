const assert = require('assert');
const should = require('chai').should();
const Splitter = require('../splitter');

let splitter;
let testKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';

describe('splitter', () => {
  beforeEach(() => {
    splitter = new Splitter();
  });


  describe("splitInto3Parts", () => {
    it("should split the original key in 3 parts", () => {
      let codes = splitter.splitInto3Parts(testKey);
      codes.keyParts.should.have.lengthOf(3);
    });

    it("should return a key length of 11", () => {
      let codes = splitter.splitInto3Parts(testKey);
      codes.keyLength.should.equal(11);
    });

  });


});