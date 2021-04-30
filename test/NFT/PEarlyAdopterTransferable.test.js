const PEAT = artifacts.require('PEarlyAdopterTransferable');
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('PEarlyAdopterTransferable', async accounts => {
  let adopter;
  const [alice, bob, carl] = accounts;
  const name = 'PEarlyAdopterTransferable';
  const symbol = 'PEAT';
  const cap = 4000;

  beforeEach(async () => {
    adopter = await PEAT.new(name, symbol, cap, {from: alice});
  });
  afterEach(async () => {
    // await adopter.kill({from: alice});
  });

  describe('NFT', async () => {
    it('NFT: should be able to transfer tokens only by operator', async () => {
      await adopter.addOperator(carl);
      await adopter.mintNFT(carl, 'carl-token-1');
      await adopter.transferFrom(carl, bob, 1, {from: carl});
    });
    it('NFT: should not be able to transfer tokens by non-operator', async () => {
      await adopter.mintNFT(carl, 'carl-token-1');
      await truffleAssert.reverts(
        adopter.transferFrom(carl, bob, 1, {from: carl}),
        'revert CappedPNFT: not operator'
      );
    });
  });
});
