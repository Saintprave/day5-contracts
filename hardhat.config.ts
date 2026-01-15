
import { task, type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { ETHERSCAN_API, USER_PRIVATE_KEY } from "./helpers/constants";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: { enabled: true, runs: 1000 },
    },
  },
  networks: {
    avalancheFuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [USER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API,
  },
};

task("accounts", "Prints accounts", async (_, hre) => {
  const accounts = await hre.viem.getWalletClients();
  for (const acc of accounts) {
    console.log(acc.account.address);
  }
});

export default config;
