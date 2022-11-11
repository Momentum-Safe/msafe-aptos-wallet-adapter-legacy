# Msafe Wallet Adaptor
Msafe Wallet Adaptor is used to integrate the browser plug-in wallet into msafe.  
It includes two packages: [msafe-wallet-adaptor] and [wallet-tester].

[msafe-wallet-adaptor] contains adapters for wallets, [wallet-tester] is a demo frontend to test these adapters. 

## Installation
`yarn`

## Development
### Implement new wallet class
To integrate a new browser plug-in wallet into msafe, you should:
1. cd into 'msafe-wallet-adaptor' directory: `cd packages/msafe-wallet-adaptor`
2. create a new wallet class in `src/adaptors/${WalletNmae}Account.ts` and implements `WebAccount` interface.
3. add the new wallet into connector: `src/adaptors/Connector.ts`
4. build the package: `yarn build`

For more detail, check [msafe-wallet-adaptor].

### Test the new wallet in demo front-end
1. cd into 'wallet-tester': `cd packages/wallet-tester`
2. start the front-end: `yarn start`
3. switch network of wallet to mainnet.
4. in the front-end page, click the button with the name of the new wallet to connect to the wallet. check if the address and public key is expected.
5. click button `sign transaction`. if the error is 'success', then the wallet is passed our test, otherwise you should check the error and fix it.

[msafe-wallet-adaptor]: ./packages//msafe-wallet-adaptor
[wallet-tester]: ./packages/wallet-tester