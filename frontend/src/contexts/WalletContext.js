// src/contexts/WalletContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [networkName, setNetworkName] = useState("Unknown");
  const [chainId, setChainId] = useState(null);

  // 👉 Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      const _provider = new BrowserProvider(window.ethereum);
      const accounts = await _provider.send("eth_requestAccounts", []);
      const signer = await _provider.getSigner();
      const _contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Get network details
      const network = await _provider.getNetwork();
      setNetworkName(network.name || "Custom");
      setChainId(Number(network.chainId));

      setProvider(_provider);
      setAccount(accounts[0]);
      setContract(_contract);

      // ✅ Check if wallet is an authorized university
      try {
        const uniInfo = await _contract.getUniversity(accounts[0]);
        if (uniInfo[1]) {
          setIsAuthorized(true);
          setUniversityName(uniInfo[0]);
        } else {
          setIsAuthorized(false);
          setUniversityName("");
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch university status:", err);
        setIsAuthorized(false);
      }
    } catch (err) {
      console.error("❌ Failed to connect wallet:", err);
    }
  };

  // 👉 Disconnect wallet (frontend only)
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setIsAuthorized(false);
    setUniversityName("");
    setNetworkName("Unknown");
    setChainId(null);
  };

  // 👉 Auto-detect wallet & network changes
  useEffect(() => {
    if (window.ethereum) {
      (async () => {
        const _provider = new BrowserProvider(window.ethereum);
        const accounts = await _provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const signer = await _provider.getSigner();
          const _contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const network = await _provider.getNetwork();

          setProvider(_provider);
          setAccount(accounts[0]);
          setContract(_contract);
          setNetworkName(network.name || "Custom");
          setChainId(Number(network.chainId));

          try {
            const uniInfo = await _contract.getUniversity(accounts[0]);
            if (uniInfo[1]) {
              setIsAuthorized(true);
              setUniversityName(uniInfo[0]);
            }
          } catch (err) {
            console.warn("⚠️ Could not fetch university status:", err);
          }
        }
      })();

      // detect account change
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          connectWallet(); // refresh contract + network
        } else {
          disconnectWallet();
        }
      });

      // detect network change
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        contract,
        connectWallet,
        disconnectWallet,
        isAuthorized,
        universityName,
        networkName,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
