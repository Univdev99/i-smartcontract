// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../../721/Ethereum/CappedMinter/CappedERCNFT.sol";

contract EarlyAdopter is CappedERCNFT, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor(string memory name_, string memory symbol_, uint256 cap_) public CappedERCNFT(name_, symbol_, cap_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Override supportInterface .
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Restricted to members of the admin role.
     */
    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "EarlyAdopter: not admin");
        _;
    }

    /**
     * @dev Restricted to members of the operator role.
     */
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "EarlyAdopter: not operator");
        _;
    }

    /**
     * @dev Add an account to the operator role.
     * @param operator address
     */
    function addOperator(address operator) public onlyAdmin {
        grantRole(OPERATOR_ROLE, operator);
    }

    /**
     * @dev Remove an account from the operator role.
     * @param operator address
     */
    function removeOperator(address operator) public onlyAdmin {
        revokeRole(OPERATOR_ROLE, operator);
    }

    /**
     * @dev Check if an account is operator.
     * @param account address
     */
    function checkOperator(address account) public view returns (bool) {
        return hasRole(OPERATOR_ROLE, account);
    }

    /**
     * @dev Set a token URI.
     * @param tokenId uint256
     * @param tokenURI string
     */
    function setTokenURI(uint256 tokenId, string memory tokenURI) public override onlyOperator {
        super.setTokenURI(tokenId, tokenURI);
    }

    /**
     * @dev Transfer ownership to a new address. Restricted to admin
     * @param newOwner address
     */
    function transferOwnership(address newOwner) public override onlyAdmin {
        renounceRole(DEFAULT_ADMIN_ROLE, owner());
        _setupRole(DEFAULT_ADMIN_ROLE, newOwner);
        if (!hasRole(OPERATOR_ROLE, newOwner)) {
            _setupRole(OPERATOR_ROLE, newOwner);
        }
        super.transferOwnership(newOwner);
    }

    /**
     * @dev ERC721 _transfer() disabled
     * @param from address
     * @param to address
     * @param tokenId uint256
     */
    function _transfer(address from, address to, uint256 tokenId) internal override {
        require(false, "EarlyAdopter: token transfer disabled");
        super._transfer(from, to, tokenId);
    }

    /**
     * @dev CappedERCNFT mintNFT() override
     * @param recipient address
     * @param tokenURI string
     */
    function mintNFT(address recipient, string memory tokenURI) public override onlyOperator returns (uint256) {
        return super.mintNFT(recipient, tokenURI);
    }
}
