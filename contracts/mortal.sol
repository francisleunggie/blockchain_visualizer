pragma solidity ^0.4.2;
import "owned.sol";

contract mortal is owned {
  function kill() onlyowner {
    if (msg.sender == owner) suicide(owner);
  }
}