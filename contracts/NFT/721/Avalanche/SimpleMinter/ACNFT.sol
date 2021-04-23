// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ACNFT is ERC721 {
    using Counters for Counters.Counter;
    address public owner;
    Counters.Counter private _tokenIds;
    mapping (uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) public ERC721(name_, symbol_) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ACNFT: not owner");
        _;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ACNFT: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
