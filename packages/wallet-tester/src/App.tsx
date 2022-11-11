import { useState } from "react";
import { WalletConnectors, WalletType, RPCClient } from "msafe-wallet-adaptor";
import "./App.css";
import { WebAccount } from "msafe-wallet-adaptor/dist/lib/WebAccount";
import { HexString, TxnBuilderTypes, BCS } from "aptos";

const address = (addr: string) => TxnBuilderTypes.AccountAddress.fromHex(addr);
const testMsafe = '0xaa90e0d9d16b63ba4a289fb0dc8d1b454058b21c9b5c76864f825d5c1f32582e';
function testTransaction(sn: bigint): TxnBuilderTypes.RawTransaction {
    const serializer = new BCS.Serializer();
    const owners = [
        "0x5c7b342e9ee2e582ad16fb602e8ebb6ba39b3bfa02a4fd3865853b10dc75765f",
        "0xa3f6a53c57395401ce64f09a188e2259dc9b156387e76c88a7a80a8fe5254476",
    ];
    BCS.serializeVector(
        owners.map((owner) => address(owner)),
        serializer
    );
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
        TxnBuilderTypes.EntryFunction.natural(
            `0xaa90e0d9d16b63ba4a289fb0dc8d1b454058b21c9b5c76864f825d5c1f32582e::creator`,
            "init_wallet_creation",
            [],
            [
                serializer.getBytes(),
                BCS.bcsSerializeU8(2),
                BCS.bcsSerializeUint64(10000000),
                BCS.bcsSerializeBytes(
                    new HexString(
                        "b5e97db07fa0bd0e5598aa3643a9bc6f6693bddc1a9fec9e674a461eaa00b193a527b6487c9ba480a3dbfbc351a3fcafd0a5044a0b3c877f759fa5df64a692f1000000000000000002aa90e0d9d16b63ba4a289fb0dc8d1b454058b21c9b5c76864f825d5c1f32582e0d6d6f6d656e74756d5f7361666508726567697374657200010c0b77616c6c6574206e616d65e02e0000000000007800000000000000fa7984630000000001"
                    ).toUint8Array()
                ),
                BCS.bcsSerializeBytes(
                    new HexString(
                        "fc284900723375e6b087a166c04edf6a1b71a361ad671608a849b733a878aaf910150dcf28e0f197675137abb328db6b55a6d98bee53413ad49c16549c1f0701"
                    ).toUint8Array()
                ),
            ]
        )
    );
    return new TxnBuilderTypes.RawTransaction(
        TxnBuilderTypes.AccountAddress.fromHex(testMsafe),
        sn,
        payload,
        20123n,
        123n,
        1793884475n,
        new TxnBuilderTypes.ChainId(1)
    );
}

function App() {
    const [account, setAccount] = useState<WebAccount>();
    const [name, setName] = useState<WalletType>();
    const [error, setError] = useState<string>();
    async function connnect(walletName: WalletType) {
        setError(undefined);
        const acc = await WalletConnectors[walletName]();
        setAccount(acc);
        setName(walletName);
    }
    async function signTransaction() {
        setError(undefined);
        if (!account) return;
        const sn = await RPCClient().getAccount(testMsafe).then(acc=>BigInt(acc.sequence_number));
        const testTxn = testTransaction(sn+1n);
        try {
            await account.sign(testTxn);
            setError("success");
        } catch (e: any) {
            console.error(e);
            setError(String(e));
        }
    }
    return (
        <div className="App">
            <p>wallet: {name || "-"}</p>
            <p>address: {account ? account.address().hex() : "-"}</p>
            <p>public key: {account ? account.publicKey().hex() : "-"}</p>
            <p>
                {Object.keys(WalletConnectors).map((name) => (
                    <button key={name} onClick={() => connnect(name as any)}>
                        {name}
                    </button>
                ))}
            </p>
            <p>
                Entry Function:
                <pre>
                    public entry fun init_wallet_creation(<br/>
                        s: &signer,<br/>
                        owners: vector[address],<br/>
                        threshold: u8,<br/>
                        init_balance: u64,<br/>
                        payload: vector[u8],<br/>
                        signature: vector[u8],<br/>
                    )
                </pre>
                Transaction:
            </p>
            <p>
                <button onClick={signTransaction}>sign transaction</button>
            </p>
            <p>error: {error === undefined ? "-" : error}</p>
        </div>
    );
}

export default App;
