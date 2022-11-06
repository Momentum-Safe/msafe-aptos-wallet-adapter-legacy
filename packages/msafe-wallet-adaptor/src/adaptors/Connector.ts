import { PontemAccount } from "./PontemAccount";
import { MartianAccount } from "./MartianAccount";
import { FewchaAccount } from "./FewchaAccount";
import { PetraAccount } from "./PetraAccount";
import { WebAccount } from "../lib/WebAccount";

export const WALLET_TYPE = {
    PONTEM: "Pontem",
    MARTIAN: "Martian",
    FEWCHA: "Fewcha",
    PETRA: "Petra",
} as const;

export type WalletType = typeof WALLET_TYPE[keyof typeof WALLET_TYPE];

type Account = { address: string, publicKey: string };
type Connectors = { [k in WalletType]: () => Promise<WebAccount> }

export const WalletConnectors: Connectors = {
    [WALLET_TYPE.PONTEM]: async () => {
        const account: Account = await window.pontem.connect();
        return new PontemAccount(account.address, account.publicKey);
    },
    [WALLET_TYPE.MARTIAN]: async () => {
        const account: Account = await window.martian.connect();
        return new MartianAccount(account.address, account.publicKey);
    },
    [WALLET_TYPE.FEWCHA]: async () => {
        const account: Account = await window.fewcha.connect().then((r: any) => r.data);
        return new FewchaAccount(account.address, account.publicKey);
    },
    [WALLET_TYPE.PETRA]: async () => {
        const account: Account = await window.petra.connect();
        return new PetraAccount(account.address, account.publicKey);
    },
};