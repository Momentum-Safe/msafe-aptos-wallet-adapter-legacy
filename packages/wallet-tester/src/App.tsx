import { useState } from "react";
import { WalletConnectors, WalletType } from "msafe-wallet-adaptor";
import "./App.css";
import { WebAccount } from "msafe-wallet-adaptor/dist/lib/WebAccount";
import { HexString, TxnBuilderTypes, BCS } from "aptos";

const address = (addr: string) => TxnBuilderTypes.AccountAddress.fromHex(addr);
function testTransaction(): TxnBuilderTypes.RawTransaction {
    const serializer = new BCS.Serializer();
    const owners = [
        "0xdbb67f2caf126b224fa637451f37eb3a3181c074af576125da0f1ecb760382b3",
        "0x717572a51e2140ca3472b973376f1ac064870d95c250b4477b9fe4bf8cbc2e3d",
        "0x412090cb0f1c1b604040ce21e735336c4f26eb81b6c2e5bc351dbbcbe3428693",
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
                BCS.bcsSerializeUint64(10000),
                BCS.bcsSerializeBytes(
                    new HexString(
                        "b5e97db07fa0bd0e5598aa3643a9bc6f6693bddc1a9fec9e674a461eaa00b193c0455c582b0e3d794918db7de1f1c218ac311701db218958718e74494703fd3b0000000000000000024cebef114d8ce88cc1e1df73b9a6effa51bf58105b18e2be2dc222c84a3e54850d6d6f6d656e74756d5f7361666508726567697374657200010d0c68656c6c6f206d2d73616665d0070000000000000100000000000000d0e22663000000001f"
                    ).toUint8Array()
                ),
                BCS.bcsSerializeBytes(
                    new HexString(
                        "40e66eda2884c6e9cb639dcc4b4c85d45a98583b1ad37c1a3df52be23a6b22cf20647eb4c9ac03469ef3c5567f021e5b032e8fd0d0a5b9f1faae23ee9b1eea01"
                    ).toUint8Array()
                ),
            ]
        )
    );
    return new TxnBuilderTypes.RawTransaction(
        TxnBuilderTypes.AccountAddress.fromHex(
            "0xa3f6a53c57395401ce64f09a188e2259dc9b156387e76c88a7a80a8fe5254476"
        ),
        0n,
        payload,
        10000n,
        100n,
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
        const testTxn = testTransaction();
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
                <button onClick={signTransaction}>sign transaction</button>
            </p>
            <p>error: {error === undefined ? "-" : error}</p>
        </div>
    );
}

export default App;
