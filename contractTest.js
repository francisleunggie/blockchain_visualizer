const Web3 = require('web3');
const utils = require('./lib/utils');
const bcUtil = require('./lib/bcUtil');
const p = require('./lib/p');
const providerURL = "http://localhost";
const providerPort = "8545";

//---connect to bock chain
if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	web3 = new Web3(new Web3.providers.HttpProvider(providerURL + ":" + providerPort));
}

var compiledCode =  "0x6060604052600080546c0100000000000000000000000033810204600160a060020a0319909116179055600060025561197c8061003c6000396000f3606060405236156100615760e060020a60003504633a51d246811461006657806353a0c83a1461015f57806394391d80146101cb578063a6f9dae114610244578063ce2c5b341461026a578063d28d9df314610374578063daa10560146103ef575b610002565b34610002576104396004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050505050505060006000600360005083604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050908152602001604051809103902060009054906101000a9004600160a060020a0316600160a060020a03166312065fe06000604051602001526040518160e060020a028152600401809050602060405180830381600087803b156100025760325a03f11561000257505060405151949350505050565b346100025761044b6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650509335935050505060005433600160a060020a039081169116146105ee57610002565b346100025760408051602060046024803582810135601f810185900485028601850190965285855261044b9583359593946044949392909201918190840183828082843750949650505050505050600254600090815260016020526040812060050154839060ff61010090910416151561080957610002565b346100025761044b60043560005433600160a060020a0390811691161461091357610002565b34610002576104396004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375050604080516020604435808b0135601f810183900483028401830190945283835297998935999098606498509296509190910193509091508190840183828082843750949650509335935050505060006000856000600160a060020a0316600360005082604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050908152602001604051809103902060009054906101000a9004600160a060020a0316600160a060020a0316141561094857610002565b346100025760408051602060046024803582810135601f810185900485028601850190965285855261044b95833595939460449493929092019181908401838280828437509496505050505050506002546000908152600160205260408120600501548190849060ff610100909104161515610ea657610002565b346100025761044d600435600160208190526000918252604090912080546003820154600583015460ff928316948401936002810193600490910191808216916101009091041687565b60408051918252519081900360200190f35b005b604080518881526060810186905260a0810184905282151560c082015260e0602082018181528954600260018216156101009081026000190190921604928401839052929390929084019160808501918501908b9080156104ef5780601f106104c4576101008083540402835291602001916104ef565b820191906000526020600020905b8154815290600101906020018083116104d257829003601f168201915b505084810383528954600260001961010060018416150201909116048082526020909101908a9080156105635780601f1061053857610100808354040283529160200191610563565b820191906000526020600020905b81548152906001019060200180831161054657829003601f168201915b50508481038252875460026000196101006001841615020190911604808252602090910190889080156105d75780601f106105ac576101008083540402835291602001916105d7565b820191906000526020600020905b8154815290600101906020018083116105ba57829003601f168201915b50509a505050505050505050505060405180910390f35b6000600160a060020a0316600360005083604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050908152602001604051809103902060009054906101000a9004600160a060020a0316600160a060020a031614151561066057610002565b818160006040516107408061123c833901808060200184600160a060020a031681526020018381526020018281038252858181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156106e35780820380516001836020036101000a031916815260200191505b50945050505050604051809103906000f0801561000257600360005083604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050908152602001604051809103902060006101000a815481600160a060020a0302191690836c010000000000000000000000009081020402179055507fc2e5fdb2e486babd662c44b305b51a7c0acaf246695da50b29863dba5b69edad8282604051808060200183600160a060020a031681526020018281038252848181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156107f75780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15050565b6000848152600160205260409020600581015490925060ff161561082c57610002565b60058201805460ff19166002908117909155835160048401805460008281526020908190209294601f600019600185161561010002019093160482018190048301939291908801908390106108a457805160ff19168380011785555b506108d49291505b8082111561090f5760008155600101610890565b82800160010185558215610888579182015b828111156108885782518260005055916020019190600101906108b6565b50506040805185815290517fa9bf1e76cee07e9224851e6b188f0424686e24d8ff503272c4ba1c74850feed19181900360200190a150505050565b5090565b600080546c010000000000000000000000008084020473ffffffffffffffffffffffffffffffffffffffff1990911617905550565b600360005087604051808280519060200190808383829060006004602084601f0104600302600f01f150905001915050908152602001604051809103902060009054906101000a9004600160a060020a031691506000841415610a64576040805160e081018252600080825260208083018b81528385018c9052606084018b9052608084018a905260a08401839052600160c0850181905260028054820180825585528184529584208551815460f860020a9182029190910460ff1990911617815591518051838301805481885296869020979894979096601f60001995821615610100029590950116949094048301859004840194909392910190839010610b2957805160ff19168380011785555b50610b59929150610890565b6001841415610d04576040805160e081018252600180825260208083018b81528385018c9052606084018b9052608084018a9052600060a0850181905260c0850184905260028054850180825582528484529581208551815460ff191660f860020a918202919091041781559151805183860180548185529386902097989497909661010090851615026000190190931693909304601f9081018590048301949190910190839010610d4b57805160ff19168380011785555b50610d7b929150610890565b82800160010185558215610a58579182015b82811115610a58578251826000505591602001919060010190610b3b565b50506040820151816002016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610bb857805160ff19168380011785555b50610be8929150610890565b82800160010185558215610bac579182015b82811115610bac578251826000505591602001919060010190610bca565b5050606082015181600301600050556080820151816004016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610c5457805160ff19168380011785555b50610c84929150610890565b82800160010185558215610c48579182015b82811115610c48578251826000505591602001919060010190610c66565b505060a0820151600591909101805460c09093015160ff1990931660f860020a9283028390041761ff0019166101009383029290920492909202179055610d04565b505060a0820151600591909101805460c09093015160ff1990931660f860020a9283028390041761ff00191661010093830292909204929092021790555b60025460408051918252517fb9f7d8bbd7782b35b9edb9323a1325b7ca5ef15398620e23f631333ae2e274269181900360200190a160026000505492505050949350505050565b82800160010185558215610b1d579182015b82811115610b1d578251826000505591602001919060010190610d5d565b50506040820151816002016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610dda57805160ff19168380011785555b50610e0a929150610890565b82800160010185558215610dce579182015b82811115610dce578251826000505591602001919060010190610dec565b5050606082015181600301600050556080820151816004016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610e7657805160ff19168380011785555b50610cc6929150610890565b82800160010185558215610e6a579182015b82811115610e6a578251826000505591602001919060010190610e88565b6001600050600086815260200190815260200160002060005092506003600050836002016000506040518082805460018160011615610100020316600290048015610f285780601f10610f06576101008083540402835291820191610f28565b820191906000526020600020905b815481529060010190602001808311610f14575b50509283525050604051908190036020019020546005840154600160a060020a03909116925060ff1615610f5b57610002565b825460ff1615156110095760038301546040517fc62f8db200000000000000000000000000000000000000000000000000000000815260248101829052604481018790526060600482019081526002808701805460001961010060018316150201169190910460648401819052600160a060020a0387169463c62f8db294929390928b92829160840190869080156110e45780601f106110b9576101008083540402835291602001916110e4565b825460ff16600114156111655760038301546040517f59babde500000000000000000000000000000000000000000000000000000000815260248101829052604481018790526060600482019081526002808701805460001961010060018316150201169190910460648401819052600160a060020a038716946359babde594929390928b928291608401908690801561113c5780601f106111115761010080835404028352916020019161113c565b820191906000526020600020905b8154815290600101906020018083116110c757829003601f168201915b5050945050505050600060405180830381600087803b156100025760325a03f11561000257505050611165565b820191906000526020600020905b81548152906001019060200180831161111f57829003601f168201915b5050945050505050600060405180830381600087803b156100025760325a03f115610002575050505b60058301805460ff19166003179055835160048401805460008281526020908190209293601f600260001960018616156101000201909416939093048301829004840193909290918901908390106111d057805160ff19168380011785555b50611200929150610890565b828001600101855582156111c4579182015b828111156111c45782518260005055916020019190600101906111e2565b50506040805186815290517fa9bf1e76cee07e9224851e6b188f0424686e24d8ff503272c4ba1c74850feed19181900360200190a1505050505056606060405260405161074038038061074083398101604052805160805160a0519190920191907f5374617368000000000000000000000000000000000000000000000000000000600080546c0100000000000000000000000033810204600160a060020a0319909116179055508260016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061011057805160ff19168380011785555b506100d39291505b8082111561014057600081556001016100bf565b5050600280546c0100000000000000000000000080850204600160a060020a031990911617905560038190555050506105fc806101446000396000f35b828001600101855582156100b7579182015b828111156100b7578251826000505591602001919060010190610122565b509056606060405236156100825760e060020a600035046306005754811461008757806312065fe01461009457806327d35801146100b8578063326401cf1461011c57806341c0e1b51461013357806359babde5146101565780637557c827146101c6578063a550f86d1461022f578063a6f9dae114610259578063c62f8db21461027f575b610002565b34610002576102ef610240565b346100025761030b6000805433600160a060020a0390811691161461038d57610002565b346100025761031d60018054604080516020601f6002600019610100878916150201909516949094049384018190048102820181019092528281529291908301828280156103c15780601f10610396576101008083540402835291602001916103c1565b34610002576102ef600254600160a060020a031681565b346100025761038b60005433600160a060020a039081169116146103c957610002565b346100025761038b6004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050933593505060443591505060005433600160a060020a039081169116146103f057610002565b346100025760408051602060046024803582810135601f810185900485028601850190965285855261038b958335959394604494939290920191819084018382808284375094965050505050505060005433600160a060020a0390811691161461044857610002565b34610002576102ef60043560006105205b73084f6a99003dae6d3906664fdbf43dd09930d0e35b90565b346100025761038b60043560005433600160a060020a0390811691161461057f57610002565b346100025761038b6004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050933593505060443591505060005433600160a060020a039081169116146105b457610002565b60408051600160a060020a039092168252519081900360200190f35b60408051918252519081900360200190f35b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561037d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b005b50600354610256565b820191906000526020600020905b8154815290600101906020018083116103a457829003601f168201915b505050505081565b60005433600160a060020a03908116911614156103ee57600054600160a060020a0316ff5b565b6003548211156103ff57610002565b600380548390039055604080518381526020810183905281517f098e541f764772513aa8ccd611cb4963758156bfc1712852cd585eece3ff0990929181900390910190a1505050565b8060016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106104af57805160ff19168380011785555b506104df9291505b8082111561051c576000815560010161049b565b82800160010185558215610493579182015b828111156104935782518260005055916020019190600101906104c1565b5050600280546c010000000000000000000000008085020473ffffffffffffffffffffffffffffffffffffffff1990911617905560006003555050565b5090565b600160a060020a031663bb34534c836000604051602001526040518260e060020a0281526004018082600019168152602001915050602060405180830381600087803b156100025760325a03f115610002575050604051519392505050565b600080546c010000000000000000000000008084020473ffffffffffffffffffffffffffffffffffffffff1990911617905550565b6003805483019055604080518381526020810183905281517f098e541f764772513aa8ccd611cb4963758156bfc1712852cd585eece3ff0990929181900390910190a150505056";

var TxnAgent = web3.eth.contract([{"constant":false,"inputs":[{"name":"_bankName","type":"string"}],"name":"getStash","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_bankName","type":"string"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_bankName","type":"string"},{"name":"_bankAddr","type":"address"}],"name":"createBankStash","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_txnNum","type":"uint256"},{"name":"_remarks","type":"string"}],"name":"rejectPledge","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_destStashName","type":"string"},{"name":"_txnAmt","type":"uint256"},{"name":"_remarks","type":"string"},{"name":"_txnType","type":"uint8"}],"name":"requestPledgeRedeem","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_txnNum","type":"uint256"},{"name":"_remarks","type":"string"}],"name":"acceptPledgeRedeem","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"txns","outputs":[{"name":"txnType","type":"uint8"},{"name":"origStashName","type":"string"},{"name":"destStashName","type":"string"},{"name":"txnAmt","type":"uint256"},{"name":"txnRemarks","type":"string"},{"name":"txnStatus","type":"uint8"},{"name":"exists","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_name","type":"string"},{"indexed":false,"name":"_bank","type":"address"}],"name":"StashCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_name","type":"string"},{"indexed":false,"name":"wallet","type":"address"}],"name":"retrieveBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"txId","type":"uint256"}],"name":"PledgeRedeemRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"txId","type":"uint256"}],"name":"PledgeRedeemAccepted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"txId","type":"uint256"}],"name":"PledgeRejected","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"txId","type":"uint256"}],"name":"PledgeCancelled","type":"event"}]);

/*var ta = TxnAgent.new({
		from: web3.eth.accounts[0],
		data: compiledCode,
		gasPrice: 0xfffffffffff,
		gas: 0xfffff,
		gasLimit: 0xffffffffffffd
	})
	.then(function (txnNo) {
		return bcUtil.getTransactionReceiptMined(web3, txnNo);
	}).then(function (receipt) {
		console.log(receipt);
	}).then(function () {
		//var ta = taDef.at('0x16e22ac90cf0811553a56ea971fac8d65b06401c');
		console.log(ta);
		var events = bcUtil.watchEvents(ta);
		ta.createBankStash('uob', web3.eth.accounts[1], {
			from: web3.eth.accounts[0],
			gasPrice: 0xfffffffffff
		})
		.then(function (txnNo) {
			return bcUtil.getTransactionReceiptMined(web3, txnNo);
		}).then(function (receipt) {
			console.log(receipt);
		});
		events.stopWatching();
	});*/
	
/*var ta = TxnAgent.at('0x4927b2d5327e58b3b22119682264bf2fa9a37446');
var events = bcUtil.watchEvents(ta);
ta.createBankStash('uob', web3.eth.accounts[1], {
	from: web3.eth.accounts[0],
	gasPrice: 0xfffffffffff
})
.then(function (txnNo) {
	return bcUtil.getTransactionReceiptMined(web3, txnNo);
}).then(function (receipt) {
	console.log(receipt);
});
events.stopWatching();*/
var Stash = web3.eth.contract([{"constant":false,"inputs":[],"name":"nameRegAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"getBalance","outputs":[{"name":"_stashBalance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bankName","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bankAddr","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_bankName","type":"string"},{"name":"_dAmt","type":"uint256"},{"name":"txnId","type":"uint256"}],"name":"debit","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_bankAddr","type":"address"},{"name":"_bankName","type":"string"}],"name":"setBank","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"named","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_bankName","type":"string"},{"name":"_crAmt","type":"uint256"},{"name":"txnId","type":"uint256"}],"name":"credit","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_bankName","type":"string"},{"name":"_bankAddr","type":"address"},{"name":"_stashBalance","type":"uint256"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"txID","type":"uint256"}],"name":"BalanceChanged","type":"event"}]);

var stash = Stash.at('0xd5616affa007dd16f7a8b6d9d32a56ec26db43b6');
var ta = TxnAgent.at("0x0c461696f6841d1e57871f687ffd87942ff054fc");
var dbsStash = Stash.at('0x5cfd062d2f268c33677d40d1a9abf3685f9ed8c4');
var events = bcUtil.watchEvents(stash);
var events2 = bcUtil.watchEvents(ta);
var txnNum;
var mas = web3.eth.accounts[0];
var balance = ta.getBalance.call('dbs');
console.log("from ta:" + balance);
var stashAddr = ta.getStash.call("dbs");
console.log("from ta:" + stashAddr);
var credited = new Promise(function (resolve, reject) {
//	var res = dbsStash.credit('', 1300, 27, {from: mas});
//	if (res == null) {
//		setTimeout(function () {
//			bcUtil.transactionReceiptAsync(txnHash, resolve, reject);
//		}, 500);
//	} else {
//		resolve(res);
//	}
//}).then(function () {
//	var balance = stash.getBalance.call();
//	console.log("from stash:" + balance);
//	setTimeout(function () {
//		events.stopWatching();
//	}, 500);
//}).then (function() {	
//	var res = ta.requestPledgeRedeem('dbs', 1500, "pending", 0, {from: mas, gas: 452123});
//	if (res == null) {
//		setTimeout(function () {
//			bcUtil.transactionReceiptAsync(txnHash, resolve, reject);
//		}, 500);
//	} else {
//		console.log('initiatePledge');
//		console.log(res);
//		txnNum = res;
//		resolve(res);
//	}
//}).then (function() {
	var res = ta.acceptPledgeRedeem(1, "good", {from: mas, gas: 452123});
	if (res == null) {
		setTimeout(function () {
			transactionReceiptAsync(txnHash, resolve, reject);
		}, 500);
	} else {
		
		console.log(res);
		resolve(res);
	}
//}).then (function() {
//	var res = ta.createBankStash('dbs', web3.eth.accounts[2], 23, {from: mas, gas: 452123});
//	if (res == null) {
//		console.log('enter here');
//		setTimeout(function () {
//			
//			transactionReceiptAsync(txnHash, resolve, reject);
//		}, 500);
//	} else {
//		console.log(res);
//		resolve(res);
//	}
}).then (function() {	
	var balance = ta.getBalance.call("dbs");
	console.log("from ta:" + balance);
	setTimeout(function () {
		events2.stopWatching();
	}, 500);
});


