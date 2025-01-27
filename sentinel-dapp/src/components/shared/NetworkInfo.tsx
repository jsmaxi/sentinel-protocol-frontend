"use client";

import { Badge } from "../ui/badge";
import config from "../../config/markets.json";

const NetworkInfo = () => {
  return (
    <Badge title="Network" className="mx-2 bg-green-500/20 text-green-500">
      {config.isTestnet ? "Testnet" : "Mainnet"}
    </Badge>
  );
};

export default NetworkInfo;
