import { BCS, HexString, TxnBuilderTypes } from "aptos";
import { WebAccount } from "../lib/WebAccount";

export class FewchaAccount extends WebAccount {
    get wallet() {
      return window.fewcha;
    }
  
    async walletSignTxnImpl(
      txn: TxnBuilderTypes.RawTransaction
    ): Promise<TxnBuilderTypes.SignedTransaction> {
      const bcsUnsignedTxn = BCS.bcsToBytes(txn);
      const response: { data: number[] } = await this.wallet.signTransaction(
        bcsUnsignedTxn
      );
      return TxnBuilderTypes.SignedTransaction.deserialize(
        new BCS.Deserializer(Uint8Array.from(response.data))
      );
    }
  }
  