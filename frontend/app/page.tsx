import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const CONTRACT_ADDRESS = "0x6ee367ae6704b26d31b7b0d7ae91efc81a7e82db";
const CONTRACT_ABI = [
  "function owner() public view returns (address)",
  "function setValue(uint256 _value) public",
  "function getValue() public view returns (uint256)",
  "event ValueUpdated(uint256 newValue)"
];

const AVALANCHE_FUJI = {
  chainId: '0xa869',
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

export default function SimpleStorageDApp() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [storedValue, setStoredValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    if (account && contract) {
      fetchData();
    }
  }, [account, contract]);

  const checkIfWalletConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setTxStatus('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setupContract();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await switchToAvalancheFuji();
      setupContract();
      setTxStatus('Wallet connected!');
    } catch (error) {
      console.error(error);
      setTxStatus('Failed to connect wallet');
    }
  };

  const switchToAvalancheFuji = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_FUJI.chainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_FUJI],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  };

  const setupContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      const value = await contract.getValue();
      setStoredValue(value.toString());
      
      const contractOwner = await contract.owner();
      setOwner(contractOwner);
      setIsOwner(contractOwner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetValue = async (e) => {
    e.preventDefault();
    if (!newValue) return;

    setLoading(true);
    setTxStatus('');

    try {
      const tx = await contract.setValue(newValue);
      setTxStatus('Transaction submitted... waiting for confirmation');
      await tx.wait();
      setTxStatus('Value updated successfully!');
      setNewValue('');
      await fetchData();
    } catch (error) {
      console.error(error);
      setTxStatus(error.message.includes('Not owner') ? 'Error: Only owner can update value' : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">SimpleStorage DApp</h1>
          <p className="text-blue-200 text-lg">Avalanche Fuji Testnet</p>
          <p className="text-blue-300 text-sm mt-2 break-all">Contract: {CONTRACT_ADDRESS}</p>
        </div>

        {/* Connect Wallet Button */}
        {!account ? (
          <div className="max-w-md mx-auto">
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
            >
              <Wallet className="w-6 h-6" />
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Account Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Connected Account</h2>
              </div>
              <p className="text-blue-200 break-all">{account}</p>
              {isOwner && (
                <div className="mt-3 flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">You are the contract owner</span>
                </div>
              )}
            </div>

            {/* Current Value */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Stored Value</h2>
              </div>
              <div className="text-5xl font-bold text-white text-center py-8">
                {storedValue || '0'}
              </div>
              <button
                onClick={fetchData}
                className="w-full mt-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 py-2 px-4 rounded-lg transition-all"
              >
                Refresh Value
              </button>
            </div>

            {/* Set Value Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Update Value</h2>
              {!isOwner && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">Only the contract owner can update the value</p>
                </div>
              )}
              <form onSubmit={handleSetValue} className="space-y-4">
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new value"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  disabled={loading || !isOwner}
                />
                <button
                  type="submit"
                  disabled={loading || !newValue || !isOwner}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Set Value'
                  )}
                </button>
              </form>
            </div>

            {/* Transaction Status */}
            {txStatus && (
              <div className={`p-4 rounded-xl border ${
                txStatus.includes('success') 
                  ? 'bg-green-500/20 border-green-500/30 text-green-200' 
                  : txStatus.includes('Error') || txStatus.includes('failed')
                  ? 'bg-red-500/20 border-red-500/30 text-red-200'
                  : 'bg-blue-500/20 border-blue-500/30 text-blue-200'
              }`}>
                {txStatus}
              </div>
            )}

            {/* Contract Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Contract Owner</h3>
              <p className="text-blue-200 break-all text-sm">{owner || 'Loading...'}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-blue-300 text-sm">
          <p>Make sure you're connected to Avalanche Fuji Testnet</p>
          <a 
            href="https://testnet.snowtrace.io/address/0x6ee367ae6704b26d31b7b0d7ae91efc81a7e82db"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline mt-2 inline-block"
          >
            View Contract on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}