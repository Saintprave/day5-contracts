
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    address public owner;
    uint256 private storedValue;

    event OwnerSet(address indexed owner);
    event ValueUpdated(uint256 newValue);

    constructor() {
        owner = msg.sender;
        emit OwnerSet(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setValue(uint256 _value) public onlyOwner {
        storedValue = _value;
        emit ValueUpdated(_value);
    }

    function getValue() public view returns (uint256) {
        return storedValue;
    }
}
