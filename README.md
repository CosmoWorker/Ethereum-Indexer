# ETHEREUM INDEXER
A basic ethereum indexer which indexes the blockchain and updates the balances of the deposit addresses in the databases.

## Key Features
* **Atomicity** - using multiple RPC providers for confirming transaction accuracy
* **Minimal RPC calls** - one rpc call per rpc provider over the block
* **Fast Balance Updation** - balances are updated as the block is indexed without backend request avoiding issues(latency, transaction error, etc.)