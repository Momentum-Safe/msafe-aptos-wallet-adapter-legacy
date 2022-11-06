import { HexString, TxnBuilderTypes, BCS, TransactionBuilder } from "aptos";
import { Account, SigData } from "./Account";
import nacl from "tweetnacl";

const eq = (a: Uint8Array, b: Uint8Array) => HexString.fromUint8Array(a).hex() === HexString.fromUint8Array(b).hex();
// used to check if the wallet deal the input transaction in right way
const signFuncCheck = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const fn = descriptor.value;
  descriptor.value = async function (
    txn: TxnBuilderTypes.RawTransaction
  ): Promise<TxnBuilderTypes.SignedTransaction> {
    const signedTxn: TxnBuilderTypes.SignedTransaction = await fn.apply(this, [
      txn,
    ]);
    const serializerIn = new BCS.Serializer();
    const serializerOut = new BCS.Serializer();
    txn.serialize(serializerIn);
    signedTxn.raw_txn.serialize(serializerOut);
    const inDataHex = HexString.fromUint8Array(serializerIn.getBytes()).hex();
    const outDataHex = HexString.fromUint8Array(serializerOut.getBytes()).hex();
    if (inDataHex !== outDataHex) {
      console.log('in bcs txn:\n', inDataHex);
      console.log('out bcs txn:\n', outDataHex);
      throw Error("error in wallet sign");
    }
    const signingMessage = TransactionBuilder.getSigningMessage(txn);
    const authenticator =
      signedTxn.authenticator as TxnBuilderTypes.TransactionAuthenticatorEd25519;
    const signature = authenticator.signature.value;
    const publicKey = authenticator.public_key.value;
    const walletPubkey = (this as WebAccount).publicKeyBytes();
    if (!eq(publicKey, walletPubkey)) {
      throw Error("public key don't match");
    }
    const verified = nacl.sign.detached.verify(
      signingMessage,
      signature,
      publicKey
    );
    if (!verified) {
      throw Error("invalid signature!");
    }
    return signedTxn;
  };
};

export abstract class WebAccount implements Account {
  abstract wallet: any;
  abstract walletSignTxnImpl(
    txn: TxnBuilderTypes.RawTransaction
  ): Promise<TxnBuilderTypes.SignedTransaction>;

  constructor(
    public readonly _address: string,
    public readonly _publicKey: string
  ) { }

  address(): HexString {
    return new HexString(this._address);
  }

  publicKey(): HexString {
    return new HexString(this._publicKey);
  }

  publicKeyBytes(): BCS.Bytes {
    return this.publicKey().toUint8Array();
  }

  @signFuncCheck
  async walletSignTxn(
    txn: TxnBuilderTypes.RawTransaction
  ): Promise<TxnBuilderTypes.SignedTransaction> {
    return this.walletSignTxnImpl(txn);
  }

  async sign(txn: TxnBuilderTypes.RawTransaction): Promise<BCS.Bytes> {
    const signedTx = await this.walletSignTxn(txn);
    return BCS.bcsToBytes(signedTx);
  }

  async getSigData(txn: TxnBuilderTypes.RawTransaction): Promise<SigData> {
    const signedTx = await this.walletSignTxn(txn);
    const authenticator =
      signedTx.authenticator as TxnBuilderTypes.TransactionAuthenticatorEd25519;
    const signingMessage = TransactionBuilder.getSigningMessage(txn);
    const sig = authenticator.signature;
    return [signingMessage, sig];
  }
}
