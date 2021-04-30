const ERC20PermitPausable = artifacts.require('ERC20PermitPausable');

const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { fromRpcSig } = require('ethereumjs-util');
const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;
const { EIP712Domain, domainSeparator } = require('../helpers/eip721');

const { MAX_UINT256, ZERO_ADDRESS, ZERO_BYTES32 } = constants;
const Permit = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

contract('::ERC20PermitPausable', async accounts => {
  let minter;
  let chainId;
  const [alice, bob, carl] = accounts;
  const name = 'ERC20PermitPausable';
  const symbol = 'ERC20PermitPausable';
  const version = '1';

  beforeEach(async () => {
    minter = await ERC20PermitPausable.new(name, symbol, {from: alice});
    chainId = await minter.getChainId();
  });

  describe('#Role', async () => {
    it ('Role: should be able to add operator', async () => {
      await minter.addOperator(bob);
      expect(await minter.checkOperator(bob)).to.eq(true);
    });
    it('Role: should be able to remove operator', async () => {
      await minter.addOperator(bob);
      await minter.removeOperator(bob);
      expect(await minter.checkOperator(bob)).to.eq(false);
    });
    it ('Role: should be able to add pauser', async () => {
      await minter.addPauser(bob);
      expect(await minter.checkPauser(bob)).to.eq(true);
      expect(await minter.checkOperator(bob)).to.eq(true);
    });
    it('Role: should be able to remove pauser', async () => {
      await minter.addPauser(bob);
      await minter.removePauser(bob);
      expect(await minter.checkPauser(bob)).to.eq(false);
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
      await minter.mint(alice, new BN(10), {from: bob});
      expect(await minter.balanceOf(alice)).to.be.bignumber.eq('10');
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
      expect(await minter.paused()).to.eq(true);
    });
    it('Pause: should be able to unpause by pauser', async () => {
      await minter.addPauser(bob);
      await minter.pause({from: bob});
      expect(await minter.paused()).to.eq(true);
      await minter.unpause({from: bob});
      expect(await minter.paused()).to.eq(false);
    });
    it('Pause: should not be able to send transactions when paused', async () => {
      await minter.addPauser(bob);
      await minter.pause({from: bob});
      expect(await minter.paused()).to.eq(true);
      await truffleAssert.reverts(
        minter.mint(alice, 10, {from: bob}),
        'revert ERC20Pausable: token transfer while paused'
      );
    });
  });

  describe('#Ownership', async () => {
    it('Ownership: should be able to transfer only by admin', async () => {
      await minter.transferOwnership(bob);
      expect(await minter.owner()).to.eq(bob);
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

  describe('#Permit', async () => {
    const wallet = Wallet.generate();
    const spender = bob;

    const owner = wallet.getAddressString();
    const value = new BN(42);
    const nonce = 0;
    const maxDeadline = MAX_UINT256;

    const buildData = (chainId, verifyingContract, deadline = maxDeadline) => ({
      primaryType: 'Permit',
      types: { EIP712Domain, Permit },
      domain: { name, version, chainId, verifyingContract },
      message: { owner, spender, value, nonce, deadline },
    });

    it('Permit: accepts owner signature', async function () {
      const data = buildData(chainId, minter.address);
      const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
      const { v, r, s } = fromRpcSig(signature);

      const receipt = await minter.permit(owner, spender, value, maxDeadline, v, r, s);

      expect(await minter.nonces(owner)).to.be.bignumber.equal('1');
      expect(await minter.allowance(owner, spender)).to.be.bignumber.equal(value);
    });

    describe('Permit: reverts if', async () => {
      it('Permit: reused signature', async function () {
        const data = buildData(chainId, minter.address);
        const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
        const { v, r, s } = fromRpcSig(signature);

        await minter.permit(owner, spender, value, maxDeadline, v, r, s);

        await truffleAssert.reverts(
          minter.permit(owner, spender, value, maxDeadline, v, r, s),
          'ERC20Permit: invalid signature',
        );
      });
      it('Permit: other signature', async function () {
        const otherWallet = Wallet.generate();
        const data = buildData(chainId, minter.address);
        const signature = ethSigUtil.signTypedMessage(otherWallet.getPrivateKey(), { data });
        const { v, r, s } = fromRpcSig(signature);

        await truffleAssert.reverts(
          minter.permit(owner, spender, value, maxDeadline, v, r, s),
          'ERC20Permit: invalid signature',
        );
      });
      it('Permit: expired permit', async function () {
        const deadline = (await time.latest()) - time.duration.weeks(1);

        const data = buildData(chainId, minter.address, deadline);
        const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
        const { v, r, s } = fromRpcSig(signature);

        await truffleAssert.reverts(
          minter.permit(owner, spender, value, deadline, v, r, s),
          'ERC20Permit: expired deadline',
        );
      });
    });
  });
});
