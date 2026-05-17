const NETWORKS = {
  development: {
    id: 'development',
    name: 'Local (Ganache)',
    rpc: process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545',
    chainId: process.env.REACT_APP_CHAIN_ID || '1337',
    symbol: 'ETH',
  },
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia testnet',
    rpc: process.env.REACT_APP_SEPOLIA_RPC || '',
    chainId: process.env.REACT_APP_SEPOLIA_CHAIN_ID || '11155111',
    symbol: 'ETH',
  },
  polygonMumbai: {
    id: 'polygonMumbai',
    name: 'Polygon Mumbai',
    rpc: process.env.REACT_APP_MUMBAI_RPC || '',
    chainId: process.env.REACT_APP_MUMBAI_CHAIN_ID || '80001',
    symbol: 'MATIC',
  },
};

const getDefaultNetwork = () => process.env.REACT_APP_DEFAULT_NETWORK || 'development';

const CONTRACTS = {
  RealEstateRegistry: process.env.REACT_APP_REAL_ESTATE_ADDRESS || '',
  RentalAgreement: process.env.REACT_APP_RENTAL_AGREEMENT_ADDRESS || '',
};

const CONFIG = { NETWORKS, getDefaultNetwork, CONTRACTS };

export { NETWORKS, getDefaultNetwork, CONTRACTS };
export default CONFIG;
