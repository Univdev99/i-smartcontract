const CappedBNFT = artifacts.require('CappedBNFT');
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('CappedBNFT', async accounts => {
  let minter;
  const [alice, bob, carl] = accounts;
  const name = 'Binance BEP721 Capped';
  const symbol = 'CappedBNFT';
  const cap = 4000;

  beforeEach(async () => {
    minter = await CappedBNFT.new(name, symbol, cap, {from: alice});
  });

  describe('Role', async () => {
    it ('Role: should be able to add operator', async () => {
      await minter.addOperator(bob);
      assert.equal(await minter.checkOperator(bob), true);
    });
    it('Role: should not be able to add operator by non-admin', async () => {
      await truffleAssert.reverts(
        minter.addOperator(bob, {from: bob}),
        'revert CappedBNFT: not admin'
      );
    });
    it('Role: should be able to remove operator', async () => {
      await minter.addOperator(bob);
      await minter.removeOperator(bob);
      assert.equal(await minter.checkOperator(bob), false);
    });
    it('Role: should not be able to remove operator by non-admin', async () => {
      await minter.addOperator(bob);
      await truffleAssert.reverts(
        minter.removeOperator(bob, {from: bob}),
        'revert CappedBNFT: not admin'
      );
    });
  });

  describe('NFT', async () => {
    it('NFT: should be able to mint a new token by operator', async () => {
      await minter.addOperator(bob);
      await minter.mintNFT(alice, 'alice-token-1', {from: bob});
      assert.equal(await minter.ownerOf(1), alice);
      assert.equal(await minter.getTokenURI(1), 'alice-token-1');
    });
    it('NFT: should not be able to mint a new token by non-operator', async () => {
      await truffleAssert.reverts(
        minter.mintNFT(alice, 'alice-token-1', {from: bob}),
        'revert CappedBNFT: not operator'
      );
    });
    it('NFT: should be able to set token uri by operator', async () => {
      await minter.mintNFT(alice, 'alice-token-1');
      await minter.setTokenURI(1, 'alice-token-1-updated');
      assert.equal(await minter.getTokenURI(1), 'alice-token-1-updated');
    });
  });

  describe('Ownership', async () => {
    it('Ownership: should be able to transfer only by admin', async () => {
      await minter.transferOwnership(bob);
      assert.equal(await minter.owner(), bob);
    });
    it('Ownership: should not be able to transfer by non-admin', async () => {
      await truffleAssert.reverts(
        minter.transferOwnership(bob, {from: bob}),
        'revert CappedBNFT: not admin'
      );
    });
  });
});
