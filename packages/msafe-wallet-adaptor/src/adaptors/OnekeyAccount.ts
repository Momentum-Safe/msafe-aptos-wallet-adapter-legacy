import { BCS, HexString, TxnBuilderTypes } from "aptos";
import { WebAccount } from "../lib/WebAccount";

export class OnekeyAccount extends WebAccount {
    get wallet() {
      return window.$onekey.aptos;
    }
  
    async walletSignTxnImpl(
      txn: TxnBuilderTypes.RawTransaction
    ): Promise<TxnBuilderTypes.SignedTransaction> {
      const bcsUnsignedTxn = BCS.bcsToBytes(txn);
      console.log("window.$onekey.aptos.signTransaction:", HexString.fromUint8Array(bcsUnsignedTxn).hex());
      const response: string = await this.wallet.signTransaction(
        HexString.fromUint8Array(bcsUnsignedTxn).noPrefix()
      );
      console.log('response:', response);
      const bcsSignedTxn = HexString.ensure(response).toUint8Array()
      return TxnBuilderTypes.SignedTransaction.deserialize(
        new BCS.Deserializer(bcsSignedTxn)
      );
    }
  }
  