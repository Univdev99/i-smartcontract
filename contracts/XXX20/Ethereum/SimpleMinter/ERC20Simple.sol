// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Simple is ERC20, Ownable {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) public {}

    /**
     * @dev Mint.
     */
    function mint(address recipient, uint256 amount) public onlyOwner {
        super._mint(recipient, amount);
    }
}
