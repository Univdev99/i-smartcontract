// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PriceCappedACNFT3 is ERC721, Ownable, AccessControl {
    event OfferCreated(uint256 offerId);
    event OfferSold(uint256 offerId);

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => TokenProp) private _tokenProps;
    uint256 private _cap;
    uint256 private _minimumTokenPrice;
    Range[] private _ranges;

    struct Offer {
        uint256 tokenId;
        uint256 price;
        address payable seller;
        address payable buyer;
        bool isOpen;
    }

    struct TokenProp {
        string uri;
    }

    struct Range {
        uint256 upperBound;
        uint256 price;
    }

    Offer[] offers;

    constructor (
        string memory name_,
        string memory symbol_,
        uint256 cap_,
        uint256 minimumTokenPrice_,
        Range[] memory ranges_
    )
        public
        ERC721(name_, symbol_)
    {
        require(cap_ > 0, "PriceCappedACNFT3: cap is 0");
        _cap = cap_;
        _minimumTokenPrice = minimumTokenPrice_;
        for (uint256 i = 0; i < ranges_.length; i++) {
            _ranges.push(ranges_[i]);
        }
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(OPERATOR_ROLE, _msgSender());
    }

    receive() external payable {}

    /**
     * @dev Override supportInterface.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override (ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Restricted to members of the admin role.
     */
    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "PriceCappedACNFT3: not admin");
        _;
    }

    /**
     * @dev Restricted to members of the operator role.
     */
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, _msgSender()), "PriceCappedACNFT3: not operator");
        _;
    }

    modifier onlyExistentToken(uint256 tokenId) {
        require(_exists(tokenId), "PriceCappedACNFT3: nonexistent token");
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == _msgSender(), "PriceCappedACNFT3: not token owner");
        _;
    }

    /**
     * @dev Add an account to the operator role.
     * @param account address
     */
    function addOperator(
        address account
    )
        public
        onlyAdmin
    {
        require(!checkOperator(account), "PriceCappedACNFT3: already operator");
        grantRole(OPERATOR_ROLE, account);
    }

    /**
     * @dev Remove an account from the operator role.
     * @param account address
     */
    function removeOperator(
        address account
    )
        public
        onlyAdmin
    {
        require(checkOperator(account), "PriceCappedACNFT3: not operator");
        revokeRole(OPERATOR_ROLE, account);
    }

    /**
     * @dev Check if an account is operator.
     * @param account address
     */
    function checkOperator(
        address account
    )
        public
        view
        returns (bool)
    {
        return hasRole(OPERATOR_ROLE, account);
    }

    function setTokenURI(
        uint256 tokenId,
        string memory tokenURI
    )
        public
        virtual
        onlyOperator
        onlyExistentToken(tokenId)
    {
        _tokenProps[tokenId].uri = tokenURI;
    }

    function getTokenURI(
        uint256 tokenId
    )
        public
        view
        onlyExistentToken(tokenId)
        returns (string memory)
    {
        return _tokenProps[tokenId].uri;
    }

    function getTokenPrice()
        public
        view
        returns (uint256)
    {
        uint256 currentSupply = _tokenIds.current();
        require(currentSupply <= _cap, "PriceCappedACNFT3: cap overflow");
        for (uint256 i = 0; i < _ranges.length - 1; i++) {
            Range memory r = _ranges[i];
            if (r.upperBound == 0) {
                continue;
            } else if (currentSupply <= r.upperBound) {
                return r.price;
            } else {
                continue;
            }
        }
        return _minimumTokenPrice;
    }

    function mintNFT(
        address recipient,
        string memory tokenURI
    )
        public
        virtual
        onlyOperator
        returns (uint256)
    {
        _tokenIds.increment();
        require(_tokenIds.current() <= _cap, "PriceCappedACNFT3: cap overflow");
        uint256 newTokenId = _tokenIds.current();
        _safeMint(recipient, newTokenId);
        setTokenURI(newTokenId, tokenURI);
        TokenProp storage tokenProps = _tokenProps[newTokenId];
        tokenProps.uri = tokenURI;

        return newTokenId;
    }

    function createOffer(
        uint256 tokenId
    )
        onlyOperator
        onlyExistentToken(tokenId)
        external
    {
        offers.push(
            Offer({
                tokenId: tokenId,
                price: getTokenPrice(),
                seller: payable(ownerOf(tokenId)),
                buyer: payable(address(0)),
                isOpen: true
            })
        );
        emit OfferCreated(offers.length - 1);
    }

    function applyOffer(
        uint256 offerId
    )
        external
        payable
    {
        require(msg.value == offers[offerId].price, "PriceCappedACNFT3: not enough fund");
        require(offers[offerId].isOpen, "PriceCappedACNFT3: offer closed");
        offers[offerId].isOpen = false;
        offers[offerId].buyer = payable(_msgSender());
    }

    function getOffer(
        uint256 offerId
    )
        external
        view
        onlyExistentToken(offerId)
        returns (uint256, uint256, address, address, bool)
    {
        return (
            offers[offerId].tokenId,
            offers[offerId].price,
            offers[offerId].seller,
            offers[offerId].buyer,
            offers[offerId].isOpen
        );
    }

    function processOffer(
        uint offerId
    )
        external
        payable
        onlyOperator
        returns (bool)
    {
        (bool sent1, ) = payable(address(this)).call{value: offers[offerId].price}("");
        if (!sent1) {
            return false;
        }
        safeTransferFrom(offers[offerId].seller, offers[offerId].buyer, offers[offerId].tokenId);
        (bool sent2, ) = offers[offerId].seller.call{value: offers[offerId].price}("");
        return sent2;
    }

    function withdrawFunds()
        external
        payable
        onlyOperator
        returns (bool)
    {
        (bool success, ) = payable(_msgSender()).call{value: address(this).balance}("");
        return success;
    }

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    )
        internal
        view
        override
        onlyExistentToken(tokenId)
        returns (bool)
    {
        return hasRole(OPERATOR_ROLE, spender);
    }
}
