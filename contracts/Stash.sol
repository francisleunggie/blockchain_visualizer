pragma solidity ^0.4.2;

import "mortal.sol";
import "owned.sol";
import "named.sol";

contract Stash is mortal, named("Stash") {
  // Defining owner which will be set to transaction agent.
  // address owner;
  // Base Bank structue. Has bank address and stash balance.
  string  public bankName;
  address public bankAddr;
  int private stashBalance;

  // Events
  event BalanceChanged(int amount, uint txID);
  
  /*This will be called by Trsasaction agent to create a new stash
    Input - Bank address, bank name
    output - None
    Remarks - Calls an event to indicate that the bank record is created
  */
  function Stash(string _bankName, address _bankAddr, int _stashBalance) owned { 
    bankName = _bankName;
    bankAddr = _bankAddr;
    stashBalance = _stashBalance; 
  }
  /*This will be called by Trsasaction agent or transfer agent to add balance to stash
    Input -  bank name, credit amount, transaction id
    output - None
    Remarks - Calls an event to indicate that the balance has changed
  */  
  function credit(int _crAmt, uint txnId)  {
    stashBalance += _crAmt;
    BalanceChanged(_crAmt, txnId);
  }
  
   /*This will be called by Trsasaction agent  to add balance to stash
    Input -  bank name, debit amount, transaction id
    output - None
    Remarks - Calls an event to indicate that the balance has changed
  */   
  function debit(int _dAmt, uint txnId)  {
    if (_dAmt > stashBalance) {throw;}
    stashBalance -= _dAmt;
    BalanceChanged(_dAmt, txnId);
  }
  
  /*This will be called by Trsasaction agent,  or the stash owning bank to get balance of the stash
    Input -  bank name
    output - balance of the stash
    Remarks - 
  */    
  function getBalance() returns (int _stashBalance) {
    return stashBalance;
  }
}