// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../SimpleMinter/BEP20Simple.sol";

contract BEP20WithCap is BEP20Simple {
    uint256 private _cap;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_
    ) BEP20Simple(name_, symbol_) public {
        _cap = cap_;
    }

    /**
     * @dev Get cap.
     */
    function cap() public view returns (uint256) {
        return _cap;
    }

    /**
     * @dev ERC20Simple mint() override.
     * @param recipient address
     * @param amount uint256
     */
    function mint(address recipient, uint256 amount) override public {
        require(totalSupply() + amount <= _cap, "BEP20WithCap: cap overflow");
        super.mint(recipient, amount);
    }

}
