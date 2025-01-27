"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const explorer = "https://stellar.expert/explorer/testnet/account/";

interface WalletProps {
  publicKey: string | null;
  onClick: () => void;
}

const ConnectWallet = ({ publicKey, onClick }: WalletProps) => {
  if (publicKey)
    return (
      <span className="text-sm font-medium">
        <span>Connected: </span>
        <Link
          href={explorer + publicKey}
          target="_blank"
          className="hover:underline text-accent"
        >
          {publicKey.slice(0, 4)}...
          {publicKey.slice(-4)}
        </Link>
      </span>
    );

  return <Button onClick={onClick}>Connect Wallet</Button>;
};

export default ConnectWallet;
