# 🚀 Guide de Démarrage - Blockchain Real Estate

## Votre projet : Location d'immobiliers avec la blockchain

C'est un **système décentralisé de location** où :
- **Propriétaires** listent leurs immobiliers
- **Locataires** les louent via des contrats intelligents
- **Paiements** sécurisés avec escrow
- **Reviews** décentralisées

---

## ✅ Étape 1 : Vérifier les dépendances

```bash
cd "c:\Users\pc\Desktop\All-in-one\1. Work\PROJET_BLOCKCHAIN\app1"

# Vérifier que Truffle est installé
npm list truffle

# Vérifier que Ganache-CLI est installé
npm list ganache-cli
```

---

## ✅ Étape 2 : Configurer Ganache

### Option A : Ganache CLI (ligne de commande)

```bash
ganache-cli --deterministic --port 7545
```

**Cela créera:**
- 10 comptes de test avec ETH gratuit
- Une blockchain locale sur http://localhost:7545
- Une mnémonique pour importer dans MetaMask

### Option B : Ganache GUI (interface graphique)

Télécharger depuis: https://www.trufflesuite.com/ganache

---

## ✅ Étape 3 : Configurer MetaMask

1. **Ouvrir MetaMask** dans le navigateur
2. **Ajouter un réseau personnalisé:**
   - Nom: "Ganache"
   - RPC URL: `http://localhost:7545`
   - Chain ID: `5777`
   - Devise: `ETH`

3. **Importer un compte:**
   - Copier la mnémonique de Ganache
   - Dans MetaMask: "Import Account"
   - Coller la phrase secrète

---

## ✅ Étape 4 : Compiler les smart contracts

```bash
cd "c:\Users\pc\Desktop\All-in-one\1. Work\PROJET_BLOCKCHAIN\app1"

# Compiler les contrats
truffle compile
```

**Résultat attendu:**
```
✓ RealEstateRegistry.sol
✓ RentalAgreement.sol

Compilation successful
```

---

## ✅ Étape 5 : Déployer sur Ganache

```bash
# Assurez-vous que Ganache tourne en arrière-plan

# Déployer les contrats
truffle migrate --network development
```

**Copier les adresses affichées:**
```
RealEstateRegistry deployed at: 0x..........
RentalAgreement deployed at: 0x..........
```

Mettre à jour ces adresses dans `src/utils/web3.js`

---

## ✅ Étape 6 : Copier les ABIs

```bash
# Les fichiers compilés sont dans:
app1/build/contracts/

# Fichiers importants:
- RealEstateRegistry.json
- RentalAgreement.json
```

**Copier le contenu de `"abi"` de chaque fichier JSON**
Et le mettre dans `src/utils/web3.js`

---

## ✅ Étape 7 : Installer les dépendances React

```bash
# Installation des librairies Web3
npm install web3 ethers react-router-dom react-icons

# Installer Tailwind CSS (optionnel, pour le design)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## ✅ Étape 8 : Démarrer l'application

```bash
# Terminal 1 - Ganache reste actif
ganache-cli --deterministic --port 7545

# Terminal 2 - Déployer les contrats
truffle migrate --network development

# Terminal 3 - Démarrer React
npm start
```

L'application s'ouvre sur: `http://localhost:3000`

---

## 🔑 Fonctionnalités principales

### 👷 Propriétaire
- ✅ Lister une propriété
- ✅ Modifier les prix
- ✅ Voir les demandes de location
- ✅ Accepter/rejeter les locations
- ✅ Recevoir les paiements

### 🏘️ Locataire
- ✅ Voir les propriétés disponibles
- ✅ Filtrer par prix/localisation
- ✅ Créer une demande de location
- ✅ Payer le loyer chaque mois
- ✅ Laisser des reviews

### 💰 Flux de paiement
```
Locataire paye
    ↓
Fonds en attente (Escrow)
    ↓
Propriétaire confirme réception
    ↓
Fonds envoyés au propriétaire
```

---

## 📊 Structure des données

### Propriété
```solidity
{
  id: 0,
  owner: "0x...",
  location: "Paris, 5ème",
  description: "Bel appartement...",
  pricePerMonth: 1.5 ETH,
  bedrooms: 2,
  bathrooms: 1,
  available: true,
  imageURIs: ["ipfs://..."]
}
```

### Location
```solidity
{
  id: 0,
  propertyId: 0,
  tenant: "0x...",
  landlord: "0x...",
  startDate: 1684675200,
  endDate: 1715211200,
  monthlyPrice: 1.5 ETH,
  depositAmount: 3 ETH,
  status: "ACTIVE"
}
```

---

## 🐛 Troubleshooting

### ❌ "MetaMask not found"
- Installez l'extension MetaMask
- Actualisez la page

### ❌ "Contract address is not set"
- Vérifiez que les contrats sont déployés
- Mettez à jour `src/utils/web3.js` avec les bonnes adresses

### ❌ "Connection refused at 7545"
- Assurez-vous que Ganache tourne
- Vérifiez le port: `ganache-cli --port 7545`

### ❌ "Compilation errors"
```bash
# Nettoyer et recompiler
rm -rf build/
truffle compile
```

---

## 📚 Ressources

- 📖 [Truffle Docs](https://trufflesuite.com/docs/)
- 📖 [Solidity Docs](https://docs.soliditylang.org/)
- 📖 [Web3.js Docs](https://web3js.readthedocs.io/)
- 📖 [React Docs](https://react.dev/)

---

## 🎯 Prochaines fonctionnalités à développer

- [ ] System de disputes (arbitrage)
- [ ] Intégration IPFS (stockage décentralisé des images)
- [ ] Historique des transactions
- [ ] System de notation/reviews avancé
- [ ] Notifications push
- [ ] Contrats multi-signature
- [ ] Déployer sur testnet (Goerli)
- [ ] Déployer sur mainnet (production)

---

## 💡 Tips de développement

1. **Utilisez le console Ganache** pour voir toutes les transactions
2. **Testez avec des petits montants** avant la production
3. **Lisez les erreurs Solidity** pour corriger les contrats
4. **Utilisez Remix** pour tester les contrats rapidement: https://remix.ethereum.org
5. **Testez sur testnet** avant mainnet

---

## 📞 Besoin d'aide?

Consultez:
- `ARCHITECTURE.md` - Vue d'ensemble du système
- `IMPLEMENTATION_GUIDE.md` - Code complet React
- Les fichiers `.sol` pour la logique blockchain

Bon développement! 🚀
