# Architecture - Location d'Immobiliers avec Blockchain

## 🏗️ Vue d'ensemble du système

### Acteurs principaux
1. **Propriétaires** : Peuvent lister leurs immobiliers
2. **Locataires** : Peuvent chercher et louer des immobiliers
3. **Administrateur** : Gère les frais et disputes

### Modules clés

## 1️⃣ COUCHE BLOCKCHAIN (Smart Contracts)

### Contrats Solidity à développer:

#### A. `RealEstateRegistry.sol` - Registre des immobiliers
- Lister un immobilier (adresse, prix/mois, description, photos)
- Modifier les informations
- Supprimer une annonce
- Récupérer les immobiliers disponibles

#### B. `RentalAgreement.sol` - Contrats de location
- Créer un accord de location
- Gérer les paiements mensuels
- Historique des loyers
- Conditions du contrat (durée, prix, dépôt de garantie)

#### C. `EscrowPayment.sol` - Gestion des paiements
- Retenez les fonds du locataire
- Libérez les fonds au propriétaire après vérification
- Remboursement de la caution
- Pénalités et frais

#### D. `DisputeResolution.sol` - Résolution des litiges
- Créer un litige
- Voter pour résoudre
- Arbitrage par l'administrateur

---

## 2️⃣ COUCHE FRONTEND (React)

### Pages principales:

#### Dashboard
- Vue d'ensemble des annonces/locations actives
- Solde du portefeuille
- Alertes de paiement

#### Pages Propriétaire
- **Lister un immobilier** : Formulaire pour ajouter un bien
- **Mes immobiliers** : Liste de tous les biens listés
- **Locations actives** : Suivi des locataires et paiements
- **Historique** : Revenues, transactions

#### Pages Locataire
- **Rechercher immobiliers** : Filtres (prix, localisation, type)
- **Détails du bien** : Images, description, reviews
- **Mes locations** : Contrats actifs
- **Paiements** : Suivi des versements

#### Pages Admin
- **Litiges** : Gestion des disputes
- **Utilisateurs** : Vérification KYC
- **Frais système** : Configuration

---

## 3️⃣ FLUX FONCTIONNELS

### Flux de location standard:
```
1. Propriétaire liste un immobilier
   ↓
2. Locataire voit l'annonce
   ↓
3. Locataire clique "Louer"
   ↓
4. Contrat créé en blockchain
   ↓
5. Locataire paye caution + 1er mois
   ↓
6. Fonds en escrow
   ↓
7. Propriétaire valide l'accès
   ↓
8. Contrat activé
   ↓
9. Paiements mensuels automatiques
   ↓
10. Fin du contrat → Restitution caution
```

### Flux de paiement:
```
Locataire envoie fonds
    ↓
Contrat escrow reçoit
    ↓
Attente vérification
    ↓
Propriétaire valide réception
    ↓
Fonds libérés au propriétaire
```

---

## 4️⃣ STRUCTURE DE DONNÉES

### Immobilier:
```solidity
struct Property {
  uint id;
  address owner;
  string location;
  string description;
  uint pricePerMonth;
  bool available;
  uint createdAt;
}
```

### Contrat de location:
```solidity
struct Rental {
  uint id;
  uint propertyId;
  address tenant;
  address landlord;
  uint startDate;
  uint endDate;
  uint monthlyPrice;
  uint depositAmount;
  enum Status { PENDING, ACTIVE, COMPLETED, DISPUTED }
}
```

### Paiement:
```solidity
struct Payment {
  uint id;
  uint rentalId;
  uint amount;
  uint timestamp;
  enum Status { PENDING, CONFIRMED, RELEASED }
}
```

---

## 5️⃣ TECHNOLOGIES

### Backend Blockchain:
- **Solidity** : Smart Contracts
- **Truffle** : Framework de déploiement
- **Ganache** : Blockchain locale
- **Web3.js** : Interaction avec blockchain

### Frontend:
- **React** : UI
- **Web3.js / ethers.js** : Communication blockchain
- **MetaMask** : Portefeuille Ethereum
- **Axios** : API calls
- **CSS/Tailwind** : Styling

### Infrastructure:
- **IPFS** : Stockage décentralisé des images
- **Firebase/Backend** : Données off-chain (reviews, messages)

---

## 6️⃣ SÉCURITÉ

✅ Contrôles d'accès : Vérifier le propriétaire/locataire
✅ Reentrancy Guard : Protection contre les attaques
✅ Escrow : Fonds sécurisés
✅ KYC/AML : Vérification des utilisateurs
✅ Audit des contrats : Vérifier la sécurité

---

## 7️⃣ PHASES DE DÉVELOPPEMENT

### Phase 1 : MVP (2-3 semaines)
- [ ] Deployer Ganache
- [ ] Créer RealEstateRegistry.sol
- [ ] Créer RentalAgreement.sol
- [ ] Dashboard React basique
- [ ] Connexion MetaMask

### Phase 2 : Paiements (2 semaines)
- [ ] EscrowPayment.sol
- [ ] Interface paiement
- [ ] Historique transactions

### Phase 3 : Avancé (2 semaines)
- [ ] DisputeResolution.sol
- [ ] Système de notes
- [ ] IPFS pour images

### Phase 4 : Production
- [ ] Deploy sur testnet (Goerli)
- [ ] UI/UX polish
- [ ] Tests complets
