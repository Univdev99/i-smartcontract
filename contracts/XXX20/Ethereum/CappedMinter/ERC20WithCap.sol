// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20WithCap is ERC20Capped, Ownable {
    constructor(string memory name_, string memory symbol_, uint256 cap_) ERC20(name_, symbol_) ERC20Capped(cap_) public {}

    /**
     * @dev Mint.
     */
    function mint(address recipient, uint256 amount) public onlyOwner {
        super._mint(recipient, amount);
    }
}
