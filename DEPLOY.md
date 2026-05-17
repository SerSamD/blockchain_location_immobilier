Deployment guide (Frontend + Contracts)

1) Build the React frontend (production)

# from app1/
npm install
REACT_APP_DEFAULT_NETWORK=development \  # or sepolia, polygonMumbai
REACT_APP_RPC_URL=http://127.0.0.1:8545 \  # set RPC for the chosen network
REACT_APP_REAL_ESTATE_ADDRESS=0xFF6049B87215476aBf744eaA3a476cBAd46fB1cA \
REACT_APP_RENTAL_AGREEMENT_ADDRESS=0xA586074FA4Fe3E546A132a16238abe37951D41fE \
npm run build

2) Deploy static site
- Netlify: drag the `build/` folder to Netlify, or connect repo and set the build command `npm run build` and env vars in Netlify dashboard.
- Vercel: `vercel --prod` or connect repo and set build step to `npm run build`.

3) Publish contracts to a testnet (Sepolia/Polygon Mumbai)
- Create an Infura/Alchemy key and set it in `truffle-config.js` or use `@truffle/hdwallet-provider`.
- Add env variables in `.env` (MNEMONIC, PROJECT_ID).
- Run:

npx truffle migrate --network sepolia --reset

- After deployment, copy deployed addresses into the Netlify/Vercel env vars: `REACT_APP_REAL_ESTATE_ADDRESS` and `REACT_APP_RENTAL_AGREEMENT_ADDRESS`.

4) MetaMask testing
- Add custom RPC with the RPC URL above and corresponding Chain ID.
- Import a funded account (do NOT share private keys in public demos).

Notes:
- For production, remove deterministic Ganache configs and secure mnemonics via environment secrets.
- Consider using Alchemy/Infura and a hardware wallet or Truffle Dashboard for secure deployments.
