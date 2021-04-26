const EA = artifacts.require('EarlyAdopter');
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('EarlyAdopter', async accounts => {
  let adopter;
  const [alice, bob, carl] = accounts;
  const name = 'EarlyAdopter';
  const symbol = 'EA';
  const cap = 4000;

  beforeEach(async () => {
    adopter = await EA.new(name, symbol, cap, {from: alice});
  });
  afterEach(async () => {
    // await adopter.kill({from: alice});
  });
  describe('Role', async () => {
    it ('Role: should be able to add operator', async () => {
      await adopter.addOperator(bob);
      assert.equal(await adopter.checkOperator(bob), true);
    });
    it('Role: should not be able to add operator by non-admin', async () => {
      await truffleAssert.reverts(
        adopter.addOperator(bob, {from: bob}),
        'revert EarlyAdopter: not admin'
      );
    });
    it('Role: should be able to remove operator', async () => {
      await adopter.addOperator(bob);
      await adopter.removeOperator(bob);
      assert.equal(await adopter.checkOperator(bob), false);
    });
    it('Role: should not be able to remove operator by non-admin', async () => {
      await adopter.addOperator(bob);
      await truffleAssert.reverts(
        adopter.removeOperator(bob, {from: bob}),
        'revert EarlyAdopter: not admin'
      );
    });
  });

  describe('NFT', async () => {
    it('NFT: should be able to mint a new token', async () => {
      await adopter.mintNFT(alice, 'alice-token-1');
      assert.equal(await adopter.ownerOf(1), alice);
      assert.equal(await adopter.getTokenURI(1), 'alice-token-1');
    });
    it('NFT: should be able to set token uri by operator', async () => {
      await adopter.mintNFT(alice, 'alice-token-1');
      await adopter.setTokenURI(1, 'alice-token-1-updated');
      assert.equal(await adopter.getTokenURI(1), 'alice-token-1-updated');
    });
    it('NFT: should not be able to transfer tokens', async () => {
      await adopter.mintNFT(carl, 'carl-token-1');
      await truffleAssert.reverts(
        adopter.transferFrom(carl, bob, 1, {from: carl}),
        'revert EarlyAdopter: token transfer disabled'
      );
    });
  });

  describe('Ownership', async () => {
    it('Ownership: should be able to transfer only by admin', async () => {
      await adopter.transferOwnership(bob);
    });
    it('Ownership: should not be able to transfer by non-admin', async () => {
      await truffleAssert.reverts(
        adopter.transferOwnership(bob, {from: bob}),
        'revert EarlyAdopter: not admin'
      );
    });
  });
});
