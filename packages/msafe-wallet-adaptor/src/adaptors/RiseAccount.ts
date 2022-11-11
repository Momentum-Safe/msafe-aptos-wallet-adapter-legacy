import { BCS, HexString, TxnBuilderTypes } from "aptos";
import { EntryFunctionTxnConvertor } from "../lib/TxnConvertor";
import { WebAccount } from "../lib/WebAccount";

export class RiseAccount extends WebAccount {
    get wallet() {
      return window.rise;
    }
  
    async walletSignTxnImpl(
      txn: TxnBuilderTypes.RawTransaction
    ): Promise<TxnBuilderTypes.SignedTransaction> {
      const txnConvertor = new EntryFunctionTxnConvertor(RiseAccount.fmt);
      const payload = txn.payload;
      if (!(payload instanceof TxnBuilderTypes.TransactionPayloadEntryFunction)) {
        throw Error("only support EntryFunction");
      }
      const signingPayload = await txnConvertor.getSigningPayload(payload);
      const risePayload = {
        type: 'entry_function_payload',
        ...signingPayload
      };
      console.log(risePayload);
      const signingOption = txnConvertor.getSigningOption(txn);
      try {
        const signedPayload = await this.wallet.signTransaction(
          risePayload,
          signingOption
        );
        const deserializer = new BCS.Deserializer(signedPayload.result);
        return TxnBuilderTypes.SignedTransaction.deserialize(deserializer);
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
    /// fmt formats the arg by abi-type to meet the wallet's parameter format.
    static fmt(type: string, arg: any) {
      switch (type) {
        case "address": // arg is Uint8Array of length 20.
          return HexString.fromUint8Array(arg).hex();
        case "u8": // arg is Number
        case "u64": // arg is BigInt
        case "u128": // arg is BigInt
          return String(arg);
        case "vector<u8>": // arg is Uint8Array of arbitrary length.
          return arg;
      }
      return arg;
    }
  }
  