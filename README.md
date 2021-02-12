# meta-transactions

## Compiling

This project uses Hardhat as the Solidity development environment. Run the following to compile the contracts within the `contracts` directory:

```
yarn hardhat compile
```

## Testing

Tests can be found in the `test` directory, and can be run with the following:

```
yarn hardhat test
```

## Running scripts (deploying)

Scripts within the `scripts` directory can be used to deploy the contracts. For example:

```
yarn hardhat run scripts/sample-script.js
```

## Exposing Hardhat network for external clients

Run the following to expose an RPC node that can be connected to with MetaMask.

```
yarn hardhat node
```

Scripts can also be run against this node with the following:

```
yarn hardhat run scripts/sample-script.js --network localhost
```
