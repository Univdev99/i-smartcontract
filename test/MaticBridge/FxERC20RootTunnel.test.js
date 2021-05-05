const FxERC20RootTunnel = artifacts.require('FxERC20RootTunnel');

const { expect } = require('chai');
const { BN } = require('@openzeppelin/test-helpers');
const { Contract } = require('@ethersproject/contracts');
// const { mockValues } = require('./helpers/constants');

contract('::FxERC20RootTunnel', async accounts => {
  let rootTunnel;
  let mockCheckPointManagerAddress;
  let mockFxRootAddress;
  let mockFxERC20TokenAddress;
  let mockRootTokenAddress;

  const [alice, bob, carl] = accounts;
  const addresses = [
    '0x40De196d3c406242A4157290FE2641433C3abC73',
    '0xEDC5f296a70096EB49f55681237437cbd249217A',
    '0x25d7981811EB756F988b264004d42de2b6aB8c9D',
    '0x3D850881A6dcCB4bF762e49508531da68e14706C',
    '0xcfb14dD525b407e6123EE3C88B7aB20963892a66',
    '0xB8D0Cbd4bC841D6fbA36CE0e0ED770aC45A261b2',
    '0x6EF439c004dE0598472D9352Cc04DA65B249BDb4',
    '0x32F303BB2Ca9167e9287CB0f53557D249D3D24BF',
    '0xd7728112027c0d2A67c097BcF5D71adF96C9c858',
    '0x48c856F10d5930DaE3CF338173247aB8DA94d308'
  ];

  beforeEach(async () => {
    mockCheckPointManagerAddress = addresses[0];
    mockFxRootAddress = addresses[1];
    mockFxERC20TokenAddress = addresses[2];
    mockRootTokenAddress = addresses[3];
    rootTunnel = await FxERC20RootTunnel.new(mockCheckPointManagerAddress, mockFxRootAddress, mockFxERC20TokenAddress, {from: alice});
  });

  it('#deposit', async () => {
    await rootTunnel.deposit(mockRootTokenAddress, bob, new BN(10), '0x0');
  });
});
