# Msafe Wallet Adaptor
Msafe Wallet Adaptor is used to integrate the browser plug-in wallet into msafe.

## Installation
`yarn`

## Development
### Implement new wallet class
To integrate a new browser plug-in wallet into msafe, you should:
1. cd into 'msafe-wallet-adaptor' directory: `cd packages/msafe-wallet-adaptor`
2. create a new wallet class in `src/adaptors/xxx.ts` and implements `WebAccount`
3. add the new wallet into connector: `src/adaptors/Connector.ts`
4. build the package: `yarn build`

### Test the new wallet in demo front-end
1. cd into 'wallet-tester': `cd packages/wallet-tester`
2. start the front-end: `yarn start`
3. in the front-end page, click the button with the name of the new wallet to connect to the wallet. check if the address and public key is expected.
4. click button `sign transaction`. if the error is 'success', then the wallet is passed our test, otherwise you should check the error and fix it.