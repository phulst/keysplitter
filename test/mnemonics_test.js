const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;

const Mnemonics = require('../src/mnemonics');

describe('mnemonics', () => {
  const bip39 = 'wink noise second estate sausage stay dune vacuum fat yard lake error recall slush basic december grocery conduct hobby asthma amused return approve essay';
  const buf = Buffer.from([251, 210, 187, 9, 166, 187, 251, 169, 209, 7, 132, 83, 127, 217, 242, 166, 107, 55, 152, 132, 193, 197, 102, 197, 217, 177, 7, 0, 131, 112, 66, 178]);

  describe("bip39", () => {
    it("should decode BIP39 to buffer", () => {
      let b = Mnemonics.bip39ToBuffer(bip39);

      for (let i=0; i<buf.length; i++) {
        buf[i].should.equal(b[i]);
      }
    });

    it("should encode back to BIP39 from buffer", () => {
      let phrase = Mnemonics.bufToBip39(buf);
      phrase.should.equal(bip39);
    });

    it("should refuse an invalid BIP39 string", () => {
      let badPhrase = bip39.slice(0, -6); // remove the last word
      try {
        Mnemonics.bip39ToBuffer(badPhrase);
        expect.fail("expected to throw error");
      } catch (err) {}
    });

    it("should refuse a BIP39 phrase with bad checksum", () => {
      let badPhrase = bip39.slice(0, -6) + " basic" // bad checksum
      try {
        Mnemonics.bip39ToBuffer(badPhrase);
        expect.fail("expected to fail on checksum");
      } catch (err) {}
    });
  });

  describe("variable length mnemonic", () => {
    const phrase11 = 'clip piece act renew carbon main slam tail ability drop';
    const buf11 = Buffer.from([43,84,140,9,219,18,39,12,178,198,234]);
    const phrase27 = 'clip piece act renew carbon main slam tail action melt boil enjoy surface close rude genuine learn stumble column craft guess';
    const buf27 = Buffer.from([43,84,140,9,219,18,39,12,178,198,234,2,145,84,100,37,93,162,87,111,59,10,126,218,244,183,25]);

    it("should encode a 11 byte buffer to a mnemonic", () => {
      let p = Mnemonics.bufToVarMnemonic(buf11);
      p.should.equal(phrase11);
    });

    it("should encode a 27 byte buffer to a mnemonic", () => {
      let phrase = Mnemonics.bufToVarMnemonic(buf27);
      phrase.should.equal(phrase27);
    });

    it("should test valid 27 word mnemonic", () => {
      expect(Mnemonics.isValidVarMnemonic(phrase27)).to.be.true;
    });

    it("should test valid 11 word mnemonic", () => {
      expect(Mnemonics.isValidVarMnemonic(phrase11)).to.be.true;
    });

    it("should find bad mnemonic to be invalid", () => {
      expect(Mnemonics.isValidVarMnemonic("clip piece act renew carbon main slam tail tail main")).to.be.false;
    });

    it("should restore 27 byte buffer from mnemonic", () => {
      let buf = Mnemonics.varMnemonicToBuf(phrase27);
      buf.length.should.equal(buf27.length);
      for (let i=0; i<buf.length; i++) {
        buf[i].should.equal(buf27[i]);
      }
    });

    it("should restore 11 byte buffer from mnemonic", () => {
      let buf = Mnemonics.varMnemonicToBuf(phrase11);
      buf.length.should.equal(buf11.length);
      for (let i=0; i<buf.length; i++) {
        buf[i].should.equal(buf11[i]);
      }
    });

  });

});
