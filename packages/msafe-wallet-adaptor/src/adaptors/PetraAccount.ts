import { BCS, HexString, TxnBuilderTypes } from "aptos";
import { EntryFunctionTxnConvertor } from "../lib/TxnConvertor";
import { WebAccount } from "../lib/WebAccount";

// petra can't be test
export class PetraAccount extends WebAccount {
    get wallet() {
      return window.petra;
    }
  
    async walletSignTxnImpl(
      txn: TxnBuilderTypes.RawTransaction
    ): Promise<TxnBuilderTypes.SignedTransaction> {
      const txnConvertor = new EntryFunctionTxnConvertor(PetraAccount.fmt);
      const payload = txn.payload;
      if (!(payload instanceof TxnBuilderTypes.TransactionPayloadEntryFunction))
        throw Error("only support EntryFunction");
      const signingPayload = await txnConvertor.getSigningPayload(payload);
      const signingOption = {
        type: "entry_function_payload",
        ...txnConvertor.getSigningOption(txn),
      };
      try {
        const signedPayload: { [index: number]: number } =
          await this.wallet.signTransaction(signingPayload, signingOption);
        const deserializer = new BCS.Deserializer(
          Uint8Array.from(Object.values(signedPayload))
        );
        const signedTxn =
          TxnBuilderTypes.SignedTransaction.deserialize(deserializer);
        return signedTxn;
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  
    static fmt(type: string, arg: any) {
      switch (type) {
        case "address":
          return HexString.fromUint8Array(arg).hex();
        case "u8":
        case "u64":
        case "u128":
          return String(arg);
        case "vector<u8>":
          return HexString.fromUint8Array(arg).hex();
      }
      return arg;
    }
  }