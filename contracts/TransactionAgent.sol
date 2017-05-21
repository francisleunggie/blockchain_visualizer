pragma solidity ^0.4.2;

import "Stash.sol";

contract TransactionAgent is owned {
    // The transaction status is applicable only for a pledge and redeem transactions. This will be
    // controlled and monitored by MAS. The transfer transactions between banks ( dr Wallet and cr another wallet)
    // will be handled by the transfer agent
    enum TransactionStatus {
      PENDING,
      CANCELLED,
      REJECTED,
      ACCEPTED
    }
  
    //This is to indicate the type of transactions
    enum TransactionType {
      PLEDGE,
      REDEEM,
      TRANSFER
    }
  
    //base transaction strcuture 
    struct Transaction {
      TransactionType       transactionType;
      string        origStashName;
      string        destStashName;
      int          transactionAmt;
      string        transactionRemarks;
      TransactionStatus transactionStatus;
      bool          exists;
    }
    //Transactions structure or hashmap
    mapping (uint => Transaction) public transactions;
  
    uint transactionNum;
  
    //Stash registry mapping
    mapping (string => Stash) stashRegistry;

    modifier stashExists (string stashName) { if (stashRegistry[stashName] == address(0)) throw; _; }
    modifier transactionExists (uint _transactionNum) {if (!transactions[_transactionNum].exists) throw; _; }
    modifier hasAccess (string stashName) { 
		if ((msg.sender != stashRegistry[stashName].bankAddr()) && (msg.sender != owner)){ 
			throw;
		}else{
			_;
		}
	}
    modifier isPositive (int amount) { if (amount <= 0) throw; _; }
    //Event for stash creation
    event StashCreated (string _name, address _bank);
  
    //Events for stash pldege request, approval, rejection and cancellation 
    
    event PledgeRejected (uint transactionId);
    event PledgeCancelled (uint transactionId);
  
    //For the new CPG connector
    event PledgeRequested (uint transactionId);
    event PledgeAccepted (uint transactionId);
    event RedeemRequested (uint transactionId);
    event RedeemAccepted (uint transactionId);

  
    /*
      Name :      TransactionAgent
      Input :     None
      Outputs :   None
      Remarks :   Constructor for the TxnAgent
    */
    function TransactionAgent() owned {
      transactionNum = 0;
    }
  
    /*
      Name :      createBankStash
      Input :     Name of the bank, bank address
      Outputs :   None
      Remarks :   This is to create a stash entry for the given bank
    */
	//getTransactionAgent().createBankStash(bankName, getBanks()[bankName], txnNo++, {from: getBanks().ZYACSGD0, gas: costForStash});
    function createBankStash (string _bankName, address _bankAddress) onlyowner {
      //Check if the stash  already exists. If yes return
      if (stashRegistry[_bankName] != address(0)) { throw; }
    
      //Create the stash
      stashRegistry[_bankName] = new Stash(_bankName, _bankAddress, 0);
      StashCreated(_bankName, _bankAddress);
    }
  
    /*
      FOR TESTING PURPOSE ONLY
      Name:     getBalance
      Remarks:  returns the wallet address for the given name
      Inputs:   _name = name of bank
      Outputs:   None
    */
    function getBalance(string _bankName)
    stashExists(_bankName) hasAccess(_bankName) returns (int balance) {
        balance = stashRegistry[_bankName].getBalance();
    }
	
	/*
      FOR TESTING PURPOSE ONLY
      Name:     getBalanceMAS
      Remarks:  returns the wallet address for the given name
      Inputs:   _name = name of bank
      Outputs:   None
    */
    function getBalanceMAS(string _bankName)
    stashExists(_bankName) onlyowner returns (int balance) {
        balance = stashRegistry[_bankName].getBalance();
    }
    
    function destroyBankStash(string _bankName) onlyowner {
        stashRegistry[_bankName].kill();
    }
        
    /*
      Name: initiatePledge
      Description: request to MAS to pledge SGD
      Inputs: _destStashName = destination stash Name
      _amt = amount to send
      _txnRemarks = transaction remarks 
      Outputs: None
    */
    function requestPledgeRedeem(string _destStashName, int _transactionAmt, string _remarks, TransactionType _transactionType ) 
     stashExists(_destStashName) hasAccess(_destStashName) isPositive(_transactionAmt) returns (uint) {
        Stash destinationStash = stashRegistry[_destStashName];
		transactionNum = transactionNum+1;
        transactions[transactionNum] = Transaction ( {transactionType: _transactionType, 
                        origStashName: _destStashName, 
                        destStashName: _destStashName, 
                        transactionAmt: _transactionAmt, 
                        transactionRemarks: _remarks, 
                        transactionStatus: TransactionStatus.PENDING, 
                        exists: true} );
        if(_transactionType == TransactionType.PLEDGE){
          PledgeRequested(transactionNum);
        }else{
          RedeemRequested(transactionNum);
        }

    }

    /*
      Name: acceptPledge
      Description: MAS accepts the pledge and updating the Stash of the bank
      Inputs: _amt = amount to send
      _txnRemarks = transaction remarks 
      Outputs: None
    */
    function acceptPledgeRedeem(uint _transactionNum, string _remarks) 
    transactionExists(_transactionNum) onlyowner {
        Transaction tran = transactions [_transactionNum];
        Stash destinationStash = stashRegistry[tran.destStashName];
        
        // If tran status is not pending exit 
        if (tran.transactionStatus != TransactionStatus.PENDING) {throw;}
        
        //For pledge and redeem update the destination stash balance 
        if (tran.transactionType == TransactionType.PLEDGE) {
          destinationStash.credit(tran.transactionAmt, _transactionNum);
        } else if (tran.transactionType == TransactionType.REDEEM) {
          destinationStash.debit(tran.transactionAmt, _transactionNum);
        }
       
        //update the transaction record
        tran.transactionStatus = TransactionStatus.ACCEPTED;
        tran.transactionRemarks = _remarks;
                                
        //notify the MAS of request to redeem
        if(tran.transactionType == TransactionType.PLEDGE){
          PledgeAccepted(_transactionNum);
        }else{
          RedeemAccepted(_transactionNum);
        }

    }
    
    /*
      Name: rejectPledge
      Description: MAS rejects the pledge 
      Inputs: _amt = amount to send
      _txnRemarks = transaction remarks 
      Outputs: None
    */
    function rejectPledge(uint _transactionNum, string _remarks) 
    transactionExists(_transactionNum) onlyowner {
        Transaction tran = transactions [_transactionNum];
       
        // If txn status is not pending exit 
        if (tran.transactionStatus != TransactionStatus.PENDING) {throw;}
        
        //For pledge and redeem update the destination stash balance 
        
      //update the transaction record
        tran.transactionStatus = TransactionStatus.REJECTED;
        tran.transactionRemarks = _remarks;

        PledgeRejected(_transactionNum);
    }

    /*
      Name: createTxfr
      Description: TxfrAgent will call this function to create a transfer record 
      Inputs: dest stashname, originating stash name, 
      Outputs: None
    */
    function initTransfer(string _origStashName, string _destStashName, int _transactionAmt, string _remarks) 
      stashExists(_destStashName) stashExists(_origStashName) hasAccess(_origStashName) isPositive(_transactionAmt) 
      returns (uint) {
      Stash origStash = stashRegistry[_origStashName];
      
      Stash destStash = stashRegistry[_destStashName];
      
      // All the checks for validity of the orig and dest stash and balance of orig stash have
      // been checked in TxfrAgent. Create will simply update the balances of the both the stashe
      // and retur txn num
	  transactionNum = transactionNum+1;
      origStash.debit(_transactionAmt, transactionNum);
      
      destStash.credit (_transactionAmt, transactionNum);
      
      transactions[transactionNum] = Transaction ( {transactionType: TransactionType.TRANSFER, 
                origStashName: _origStashName, 
                destStashName: _destStashName, 
                transactionAmt: _transactionAmt, 
                transactionRemarks: _remarks, 
                transactionStatus: TransactionStatus.ACCEPTED, 
                exists: true} );
    }
    /*
      Name: rejectTxfr
      Description: TxfrAgent will call this function to create a transfer record 
      Inputs: dest stashname, originating stash name, 
      Outputs: None
    */
    
    function rejectTransfer (uint _transactionNum, string _remarks ) 
    transactionExists(_transactionNum) hasAccess(transactions[_transactionNum].destStashName)
    returns (uint) {
        Transaction tran = transactions [_transactionNum];
        Stash origStash = stashRegistry[tran.origStashName];
        Stash destStash = stashRegistry[tran.destStashName];
        // All the checks for validity of the orig and dest stash and balance of orig stash have
        // been checked in TxfrAgent. Create will simply update the balances of the both the stashe
        // and retur txn nun
		transactionNum = transactionNum+1;
        origStash.credit(tran.transactionAmt, transactionNum);
        destStash.debit (tran.transactionAmt, transactionNum);
        transactions[transactionNum] = Transaction ( {
            transactionType: TransactionType.TRANSFER, 
            origStashName: tran.destStashName, 
            destStashName: tran.origStashName, 
            transactionAmt: tran.transactionAmt, 
            transactionRemarks: _remarks, 
            transactionStatus: TransactionStatus.REJECTED, 
            exists: true} );
    }

    function getTransaction(uint _transactionNum) constant returns (
        TransactionType       transactionType,
        string                origStashName,
        string                destStashName,
        int                  transactionAmt,
        string                transactionRemarks,
        TransactionStatus     transactionStatus,
        bool                  exists
        ) {
          Transaction transaction = transactions[_transactionNum];
          transactionType = transaction.transactionType;
          origStashName = transaction.origStashName;
          destStashName = transaction.destStashName;
          if (msg.sender != owner && 
              msg.sender != stashRegistry[origStashName].bankAddr() &&
              msg.sender != stashRegistry[destStashName].bankAddr()) throw;
          transactionAmt = transaction.transactionAmt;
          transactionRemarks = transaction.transactionRemarks;
          transactionStatus = transaction.transactionStatus;
          exists = transaction.exists;
    }
  
}
