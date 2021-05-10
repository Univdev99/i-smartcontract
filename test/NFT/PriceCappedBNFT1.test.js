const PriceCappedBNFT1 = artifacts.require('PriceCappedBNFT1');
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('::PriceCappedBNFT1', async accounts => {
  let minter;
  const [alice, bob, carl] = accounts;
  const name = 'PriceCappedBNFT1';
  const symbol = 'PriceCappedBNFT1';
  const cap = 4000;

  beforeEach(async () => {
    minter = await PriceCappedBNFT1.new(name, symbol, cap, {from: alice});
  });

  describe('#Role', async () => {
    it ('Role: should add operator', async () => {
      await minter.addOperator(bob);
      expect(await minter.checkOperator(bob)).to.eq(true);
    });
    it('Role: should remove operator', async () => {
      await minter.addOperator(bob);
      await minter.removeOperator(bob);
      expect(await minter.checkOperator(bob)).to.eq(false);
    });
    describe('reverts if', async () => {
      it('Role: add operator by non-admin', async () => {
        await truffleAssert.reverts(
          minter.addOperator(bob, {from: bob}),
          'revert PriceCappedBNFT1: not admin'
        );
      });
      it('Role: remove operator by non-admin', async () => {
        await minter.addOperator(bob);
        await truffleAssert.reverts(
          minter.removeOperator(bob, {from: bob}),
          'revert PriceCappedBNFT1: not admin'
        );
      });
    });

  });

  describe('#NFT', async () => {
    it('NFT: should mint a new token by operator', async () => {
      await minter.addOperator(bob);
      await minter.mintNFT(alice, 'alice-token-1', 1000, {from: bob});
      // assert.equal(await minter.ownerOf(1), alice);
      expect(await minter.ownerOf(1)).to.eq(alice);
      expect(await minter.getTokenURI(1)).to.eq('alice-token-1');
      await minter.getTokenPrice(1).then((price) => {
        expect(price.toString()).to.eq('1000');
      });
    });
    it('NFT: set token uri by operator', async () => {
      await minter.mintNFT(alice, 'alice-token-1', 1000);
      await minter.setTokenURI(1, 'alice-token-1-updated');
      expect(await minter.getTokenURI(1)).to.eq('alice-token-1-updated');
    });
    describe('reverts if', async () => {
      it('NFT: mint a new token by non-operator', async () => {
        await truffleAssert.reverts(
          minter.mintNFT(alice, 'alice-token-1', 1000, {from: bob}),
          'revert PriceCappedBNFT1: not operator'
        );
      });
    });
  });

  describe('#Offer', async () => {
    beforeEach(async () => {
      await minter.addOperator(bob);
      await minter.mintNFT(alice, 'alice-token-1', 1000, {from: bob});
    });
    it('Offer: should create offer', async () => {
      let tx = await minter.createOffer(1);
      truffleAssert.eventEmitted(tx, 'OfferCreated', ev => {
        return ev.offerId == 0;
      });
    });
    it('Offer: should apply for offer', async () => {
      await minter.createOffer(1);
      await minter.applyOffer(0, {from: carl, value: 1000});
    });
    it('Offer: should process offer', async () => {
      await minter.createOffer(1);
      await minter.applyOffer(0, {from: carl, value: 1000});
      await minter.processOffer(0, {from: bob});
    });
  });

  describe('#Funds', async () => {
    beforeEach(async () => {
      await minter.addOperator(bob);
      await minter.mintNFT(alice, 'alice-token-1', 1000, {from: bob});
    });
    it('Funds: should withdraw', async () => {
      await minter.withdrawFunds({from: bob});
    });
  });
});
