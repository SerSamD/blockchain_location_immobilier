# Guide d'Implémentation React - Location d'Immobiliers Blockchain

## 📦 Installation des dépendances

```bash
npm install web3 ethers axios react-router-dom react-icons tailwindcss
```

## 🔌 Web3 Integration - `src/utils/web3.js`

```javascript
import Web3 from 'web3';

// ABI des contrats (à copier depuis les fichiers compilés)
export const REAL_ESTATE_ABI = [...]; // À remplir après compilation
export const RENTAL_AGREEMENT_ABI = [...]; // À remplir après compilation

// Adresses des contrats (à mettre à jour après déploiement)
export const REAL_ESTATE_ADDRESS = '0x...';
export const RENTAL_AGREEMENT_ADDRESS = '0x...';

let web3 = null;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3;
    } catch (error) {
      console.error('User denied account access');
    }
  } else {
    console.error('MetaMask not found');
  }
};

export const getWeb3 = () => web3;

export const getAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

export const getRealEstateContract = () => {
  return new web3.eth.Contract(REAL_ESTATE_ABI, REAL_ESTATE_ADDRESS);
};

export const getRentalContract = () => {
  return new web3.eth.Contract(RENTAL_AGREEMENT_ABI, RENTAL_AGREEMENT_ADDRESS);
};
```

---

## 🏠 Composants React

### 1. `src/components/PropertyCard.js`

```javascript
import React from 'react';
import { FaBed, FaBath, FaMapMarkerAlt, FaEuroSign } from 'react-icons/fa';

export default function PropertyCard({ property, onSelect }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition">
      <img 
        src={property.imageURIs?.[0] || 'https://via.placeholder.com/300'} 
        alt={property.location}
        className="w-full h-48 object-cover rounded-lg mb-3"
      />
      
      <h3 className="text-xl font-bold mb-2">{property.location}</h3>
      <p className="text-gray-600 text-sm mb-3">{property.description.substring(0, 100)}...</p>
      
      <div className="flex justify-between items-center mb-3">
        <span className="flex items-center gap-1 text-gray-700">
          <FaBed /> {property.bedrooms} rooms
        </span>
        <span className="flex items-center gap-1 text-gray-700">
          <FaBath /> {property.bathrooms} baths
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-blue-600">
          {property.pricePerMonth} ETH
        </span>
        <button 
          onClick={() => onSelect(property.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Détails
        </button>
      </div>
    </div>
  );
}
```

### 2. `src/components/ListProperty.js`

```javascript
import React, { useState } from 'react';
import { getRealEstateContract, getAccount } from '../utils/web3';

export default function ListProperty() {
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    pricePerMonth: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    imageURIs: []
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const account = await getAccount();
      const contract = getRealEstateContract();
      
      // Convertir le prix en Wei
      const priceInWei = Web3.utils.toWei(formData.pricePerMonth, 'ether');
      
      await contract.methods.listProperty(
        formData.location,
        formData.description,
        priceInWei,
        formData.propertyType,
        formData.bedrooms,
        formData.bathrooms,
        formData.imageURIs
      ).send({ from: account });
      
      alert('Propriété listée avec succès!');
      setFormData({
        location: '', description: '', pricePerMonth: '',
        propertyType: 'apartment', bedrooms: '', bathrooms: '', imageURIs: []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Lister une propriété</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Localisation</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
            rows="4"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Prix par mois (ETH)</label>
            <input
              type="number"
              name="pricePerMonth"
              value={formData.pricePerMonth}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="apartment">Appartement</option>
              <option value="house">Maison</option>
              <option value="villa">Villa</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Chambres</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Salles de bain</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
        >
          {loading ? 'En cours...' : 'Lister la propriété'}
        </button>
      </form>
    </div>
  );
}
```

### 3. `src/components/PropertyList.js`

```javascript
import React, { useState, useEffect } from 'react';
import { getRealEstateContract } from '../utils/web3';
import PropertyCard from './PropertyCard';

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const contract = getRealEstateContract();
      const propertyIds = await contract.methods.getAvailableProperties().call();
      
      const props = await Promise.all(
        propertyIds.map(async (id) => {
          return await contract.methods.getProperty(id).call();
        })
      );
      
      setProperties(props);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {properties.map(property => (
        <PropertyCard 
          key={property.id} 
          property={property}
          onSelect={(id) => console.log('Selected:', id)}
        />
      ))}
    </div>
  );
}
```

### 4. `src/components/CreateRental.js`

```javascript
import React, { useState } from 'react';
import { getRentalContract, getAccount } from '../utils/web3';
import Web3 from 'web3';

export default function CreateRental({ propertyId, onClose }) {
  const [formData, setFormData] = useState({
    landlord: '',
    startDate: '',
    endDate: '',
    depositAmount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const account = await getAccount();
      const contract = getRentalContract();
      
      const startTimestamp = new Date(formData.startDate).getTime() / 1000;
      const endTimestamp = new Date(formData.endDate).getTime() / 1000;
      const deposit = Web3.utils.toWei(formData.depositAmount, 'ether');
      
      await contract.methods.createRental(
        propertyId,
        formData.landlord,
        startTimestamp,
        endTimestamp,
        deposit
      ).send({ from: account });
      
      alert('Location créée avec succès!');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Créer une location</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Adresse du propriétaire</label>
            <input
              type="text"
              value={formData.landlord}
              onChange={(e) => setFormData({...formData, landlord: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Date de début</label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Date de fin</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Dépôt de garantie (ETH)</label>
            <input
              type="number"
              value={formData.depositAmount}
              onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              step="0.01"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 📱 Page Principale - `src/App.js`

```javascript
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initWeb3 } from './utils/web3';
import Navigation from './components/Navigation';
import PropertyList from './components/PropertyList';
import ListProperty from './components/ListProperty';
import Dashboard from './pages/Dashboard';

function App() {
  const [web3Ready, setWeb3Ready] = useState(false);

  useEffect(() => {
    const setupWeb3 = async () => {
      await initWeb3();
      setWeb3Ready(true);
    };
    setupWeb3();
  }, []);

  if (!web3Ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Blockchain Real Estate</h1>
          <p>Connectez MetaMask pour continuer...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<PropertyList />} />
        <Route path="/list" element={<ListProperty />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🚀 Prochaines étapes

1. **Compiler les contrats:**
   ```bash
   cd app1
   truffle compile
   ```

2. **Démarrer Ganache:**
   ```bash
   ganache-cli
   ```

3. **Déployer les contrats:**
   ```bash
   truffle migrate --network development
   ```

4. **Copier les ABIs:**
   - Récupérez les fichiers JSON dans `build/contracts/`
   - Mettez-à-jour les adresses et ABIs dans `web3.js`

5. **Démarrer l'app React:**
   ```bash
   npm start
   ```

---

## 📋 Structure finale

```
app1/
├── contracts/
│   ├── RealEstateRegistry.sol
│   └── RentalAgreement.sol
├── migrations/
│   └── 2_deploy_contracts.js
├── src/
│   ├── components/
│   │   ├── PropertyCard.js
│   │   ├── PropertyList.js
│   │   ├── ListProperty.js
│   │   ├── CreateRental.js
│   │   └── Navigation.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   └── PropertyDetails.js
│   ├── utils/
│   │   └── web3.js
│   └── App.js
└── package.json
```
