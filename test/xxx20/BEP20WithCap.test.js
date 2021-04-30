const BEP20WithCap = artifacts.require('BEP20WithCap');
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('BEP20WithCap', async accounts => {
  let minter;
  const [alice, bob, carl] = accounts;
  const name = 'BEP20WithCap';
  const symbol = 'BEP20WithCap';
  const cap = 500;

  beforeEach(async () => {
    minter = await BEP20WithCap.new(name, symbol, cap, {from: alice});
  });

  describe('Cap', async () => {
    it('Cap: should be able to get cap', async () => {
      assert.equal(await minter.cap(), cap);
    });
  });

  describe('Role', async () => {
    it ('Role: should be able to add operator', async () => {
      await minter.addOperator(bob);
      assert.equal(await minter.checkOperator(bob), true);
    });
    it('Role: should not be able to add operator by non-admin', async () => {
      await truffleAssert.reverts(
        minter.addOperator(bob, {from: bob}),
        'revert BEP20Simple: not admin'
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
        'revert BEP20Simple: not admin'
      );
    });
  });

  describe('Token', async () => {
    it('Token: should be able to mint by operator', async () => {
      await minter.addOperator(bob);
      await minter.mint(alice, 10, {from: bob});
      assert.equal(await minter.balanceOf(alice), 10);
    });
    it('Token: should not be able to mint by non-operator', async () => {
      await truffleAssert.reverts(
        minter.mint(alice, 10, {from: bob}),
        'revert BEP20Simple: not operator'
      );
    });
    it('Token: should not be able to mint when cap overflow', async () => {
      await truffleAssert.reverts(
        minter.mint(alice, 600),
        'revert BEP20WithCap: cap overflow'
      );
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
        'revert BEP20Simple: not admin'
      );
    });
  });
});
