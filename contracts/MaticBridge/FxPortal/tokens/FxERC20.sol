// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IFxERC20.sol";

/**
 * @title FxERC20 represents fx erc20
 */
contract FxERC20 is IFxERC20, ERC20 {
    address internal _fxManager;
    address internal _connectedToken;

    constructor (
        address fxManager_,
        address connectedToken_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) public {
        _fxManager = fxManager_;
        _connectedToken = connectedToken_;
    }

    function initialize(
        address fxManager_,
        address connectedToken_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) public override {
        require(_fxManager == address(0x0) && _connectedToken == address(0x0), "FxERC20: Token is already initialized");
        _fxManager = fxManager_;
        _connectedToken = connectedToken_;

        // setup meta data
        // setupMetaData(name_, symbol_, decimals_);
    }

    // fxManager rturns fx manager
    function fxManager() public override view returns (address) {
      return _fxManager;
    }

    // connectedToken returns root token
    function connectedToken() public override view returns (address) {
      return _connectedToken;
    }

    // // setup name, symbol and decimals
    // function setupMetaData(string memory _name, string memory _symbol, uint8 _decimals) public {
    //     require(msg.sender == _fxManager, "Invalid sender");
    //     _setupMetaData(_name, _symbol, _decimals);
    // }

    function mint(address user, uint256 amount) public override {
        require(msg.sender == _fxManager, "FxERC20: Invalid sender");
        _mint(user, amount);
    }

    function burn(address user, uint256 amount) public override {
        require(msg.sender == _fxManager, "FxERC20: Invalid sender");
        _burn(user, amount);
    }
}
