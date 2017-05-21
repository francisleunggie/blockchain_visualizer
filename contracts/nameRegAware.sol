pragma solidity ^0.4.2;
import "NameReg.sol";

contract nameRegAware {
  function nameRegAddress() returns (address) {
    return 0x084f6a99003dae6d3906664fdbf43dd09930d0e3;
  }
  
  function named(bytes32 name) returns (address) {
    return NameReg(nameRegAddress()).addressOf(name);
  }
}