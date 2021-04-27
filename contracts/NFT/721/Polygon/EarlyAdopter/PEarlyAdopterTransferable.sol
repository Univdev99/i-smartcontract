// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../CappedMinter/CappedPNFT.sol";

contract PEarlyAdopterTransferable is CappedPNFT {
    constructor(string memory name_, string memory symbol_, uint256 cap_) public CappedPNFT(name_, symbol_, cap_) {
    }

    /**
     * @dev POL721 _transfer() override
     * @dev Restricted to operator
     * @param from address
     * @param to address
     * @param tokenId uint256
     */
    function _transfer(address from, address to, uint256 tokenId) internal override onlyOperator {
        super._transfer(from, to, tokenId);
    }
}
