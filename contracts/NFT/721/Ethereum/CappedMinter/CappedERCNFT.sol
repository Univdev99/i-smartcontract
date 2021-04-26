// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CappedERCNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping (uint256 => string) private _tokenURIs;
    uint256 private _cap;

    constructor(string memory name_, string memory symbol_, uint256 cap_) public ERC721(name_, symbol_) {
        require(cap_ > 0, "CappedERCNFT: cap is 0");
        _cap = cap_;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        return _tokenURIs[tokenId];
    }

    function mintNFT(address recipient, string memory tokenURI) public virtual returns (uint256) {
        _tokenIds.increment();
        require(_tokenIds.current() <= _cap, "CappedERCNFT: cap overflow");
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
