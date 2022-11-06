import './App.css';
import { WalletConnectors } from 'msafe-wallet-adaptor';
import { useState } from 'react';
console.log(WalletConnectors);
function App() {
  const [account, setAccount] = useState(undefined);
  const [name, setName] = useState(undefined);
  async function connnect(walletName) {
    const acc = await WalletConnectors[walletName]();
    setAccount(acc);
    setName(walletName);
  }
  async function signTransaction() {
    if(!account) return;
    await account.sign();
  }
  return (
    <div className="App">
    <p>wallet: {name || '-'}</p>
    <p>address: {account?account.address().hex():'-'}</p>
    <p>public key: {account?account.publicKey().hex():'-'}</p>
    <p>
      {
        Object.keys(WalletConnectors).map((name)=>(<button key={name} onClick={()=>connnect(name)}>{name}</button>))
      }
    </p>
    <p><button onClick={signTransaction}>sign transaction</button></p>
    </div>
  );
}

export default App;
