// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ACNFT is ERC721, Ownable, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping (uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) public ERC721(name_, symbol_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Override supportInterface.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Restricted to members of the admin role.
     */
    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "ACNFT: not admin");
        _;
    }

    /**
     * @dev Restricted to members of the operator role.
     */
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "ACNFT: not operator");
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
    function setTokenURI(uint256 tokenId, string memory tokenURI) public virtual onlyOperator {
        require(_exists(tokenId), "ACNFT: URI set of nonexistent token");
        _tokenURIs[tokenId] = tokenURI;
    }

    /**
     * @dev Get a token URI.
     * @param tokenId uint256
     */
    function getTokenURI(uint256 tokenId) public virtual view returns (string memory) {
        require(_exists(tokenId), "ACNFT: URI set of nonexistent token");
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Transfer ownership to a new address.
     * @dev Restricted to admin.
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
     * @dev Mint a new token.
     * @param recipient address
     * @param tokenURI string
     */
    function mintNFT(address recipient, string memory tokenURI) public onlyOperator returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
