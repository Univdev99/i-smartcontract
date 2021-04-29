const ERC20PermitPausable = artifacts.require('ERC20PermitPausable');
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('::ERC20PermitPausable', async accounts => {
  let minter;
  const [alice, bob, carl] = accounts;
  const name = 'ERC20PermitPausable';
  const symbol = 'ERC20PermitPausable';

  beforeEach(async () => {
    minter = await ERC20PermitPausable.new(name, symbol, {from: alice});
  });

  describe('#Role', async () => {
    it ('Role: should be able to add operator', async () => {
      await minter.addOperator(bob);
      assert.equal(await minter.checkOperator(bob), true);
    });
    it('Role: should be able to remove operator', async () => {
      await minter.addOperator(bob);
      await minter.removeOperator(bob);
      assert.equal(await minter.checkOperator(bob), false);
    });
    it ('Role: should be able to add pauser', async () => {
      await minter.addPauser(bob);
      assert.equal(await minter.checkPauser(bob), true);
      assert.equal(await minter.checkOperator(bob), true);
    });
    it('Role: should be able to remove pauser', async () => {
      await minter.addPauser(bob);
      await minter.removePauser(bob);
      assert.equal(await minter.checkPauser(bob), false);
    });
    describe('Role: reverts if', async () => {
      it('Role: add operator by non-admin', async () => {
        await truffleAssert.reverts(
          minter.addOperator(bob, {from: bob}),
          'revert ERC20PermitPausable: not admin'
        );
      });
      it('Role: remove operator by non-admin', async () => {
        await minter.addOperator(bob);
        await truffleAssert.reverts(
          minter.removeOperator(bob, {from: bob}),
          'revert ERC20PermitPausable: not admin'
        );
      });
      it('Role: remove pauser by non-admin', async () => {
        await minter.addPauser(bob);
        await truffleAssert.reverts(
          minter.removePauser(bob, {from: bob}),
          'revert ERC20PermitPausable: not admin'
        );
      });
    });
  });

  describe('#Token', async () => {
    it('Token: should be able to mint a new token by operator', async () => {
      await minter.addOperator(bob);
      await minter.mint(alice, 10, {from: bob});
      assert.equal(await minter.balanceOf(alice), 10);
    });
    describe('Token: reverts if', async () => {
      it('Token: should not be able to mint a new token by non-operator', async () => {
        await truffleAssert.reverts(
          minter.mint(alice, 10, {from: bob}),
          'revert ERC20PermitPausable: not operator'
        );
      });
    });
  });

  describe('#Pause', async () => {
    it('Pause: should be able to pause by pauser', async () => {
      await minter.addPauser(bob);
      await minter.pause({from: bob});
      assert.equal(await minter.paused(), true);
    });
    it('Pause: should be able to unpause by pauser', async () => {
      await minter.addPauser(bob);
      await minter.pause({from: bob});
      assert.equal(await minter.paused(), true);
      await minter.unpause({from: bob});
      assert.equal(await minter.paused(), false);
    });
    it('Pause: should not be able to send transactions when paused', async () => {
      await minter.addPauser(bob);
      await minter.pause({from: bob});
      assert.equal(await minter.paused(), true);
      await truffleAssert.reverts(
        minter.mint(alice, 10, {from: bob}),
        'revert ERC20Pausable: token transfer while paused'
      );
    });
  });

  describe('#Ownership', async () => {
    it('Ownership: should be able to transfer only by admin', async () => {
      await minter.transferOwnership(bob);
      assert.equal(await minter.owner(), bob);
    });
    describe('Ownership: reverts if', async () => {
      it('Ownership: should not be able to transfer by non-admin', async () => {
        await truffleAssert.reverts(
          minter.transferOwnership(bob, {from: bob}),
          'revert ERC20PermitPausable: not admin'
        );
      });
    });
  });
});
