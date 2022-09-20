// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Demo {
    uint public favNumber;
    address payable public owner;

    event Withdrawal(uint amount, uint when);

    constructor(uint _favNumber) payable {
        require(10 > _favNumber, "Value should be greater than 5");

        favNumber = _favNumber;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        console.log("Value is %o", favNumber);

        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
}
