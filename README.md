# blockchain_visualizer
For Ethereum

To run:
0. Your laptop/machine must be pre-installed with Ethereum and Node.js
1. You must have an ethereum network (min. 1 node)
2. Deploy the smart contracts in the contracts folder (using Truffle or other tools). Note that the account used to deploy these contract will be the owner account, i.e. the central bank.
3. Set up the banks' accounts using contractTest4.js, pledge some cash for these accounts, and approve the pledges as the central bank (use command: "node contractTest4.js -h" to find out more) 
4. Change the details in config.json accordingly:
   a. Identify one of the nodes as the RPC host, and change the ethereum_httprpc_host to the host's IP address. 
   b. Change ethereum_httprpc_port to the rpc port of the RPC port
   c. Adapt the bank names and bank account addresses to those set up in 3
   d. Change the transaction_agent_owner to the central banks' name
   e. Change the transaction_agent_address to the Transaction Agent Contract's address
   f. Change the fetch_size to a smaller number (200 or 300 should be good!)
5. Execute command: "npm install" at the base directory
6. Execute command: "node app.js"
7. Open browser and go to "http://localhost:2999/monitor.html"
   
