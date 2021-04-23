pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract ERC20WithCap is ERC20, ERC20Detailed, ERC20Capped, Ownable {
    
    using SafeMath for uint256;


    constructor(
        uint256 _maxSupply,
        string memory symbol,
        string memory name
    )
    	ERC20Capped(_maxSupply)
    	ERC20Detailed(name, symbol, 18)
    	public
    {
    	
    }

}