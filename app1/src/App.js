import { useMemo, useState } from "react";
import "./App.css";
import { NETWORKS, getDefaultNetwork } from "./config";

const ROLES = ["Propriétaire", "Locataire", "Admin"];
const PROPERTY_STATUSES = ["Disponible", "En contrat", "En validation"];
const CONTRACT_STATUSES = ["PENDING", "ACTIVE", "COMPLETED"];

const metrics = [
  { label: "Biens listés", value: "12", note: "Disponibles ou en validation" },
  { label: "Contrats actifs", value: "7", note: "Locations en cours (Ganache)" },
  { label: "Paiements suivis", value: "24", note: "Historique traçable on‑chain" },
  { label: "Litiges ouverts", value: "1", note: "Arbitrage prévu" },
];

const menu = [
  { id: "overview", label: "Vue générale" },
  { id: "properties", label: "Biens" },
  { id: "contracts", label: "Contrats" },
  { id: "payments", label: "Paiements" },
];

const allProperties = [
  {
    id: 1,
    title: "Appartement F3 — Cotonou",
    location: "Cotonou",
    status: "Disponible",
    price: 0.85,
    owner: "0xA12...9F4",
    tenant: "Aucun",
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Appartement", "2 chambres", "Caution 1 mois"],
  },
  {
    id: 2,
    title: "Maison familiale — Abidjan",
    location: "Abidjan",
    status: "En contrat",
    price: 1.4,
    owner: "0xC77...2B1",
    tenant: "0x4D0...8EE",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
    tags: ["Maison", "3 chambres", "Escrow actif"],
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState("Propriétaire");
  const [network, setNetwork] = useState(getDefaultNetwork());

  const getRoleInfo = () => {
    switch (userRole) {
      case "Propriétaire":
        return { desc: "Gérez vos propriétés, créez des contrats, suivez les paiements", color: "#4f46e5" };
      case "Locataire":
        return { desc: "Trouvez une propriété, faites une réservation, payez votre loyer", color: "#06b6d4" };
      case "Admin":
        return { desc: "Supervisez le réseau, résolvez les litiges, gérez les contrats critiques", color: "#f97316" };
      default:
        return { desc: "", color: "#666" };
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar card">
        <div>
          <p className="eyebrow">App1</p>
          <h1>Real Estate Chain</h1>
          <p className="sidebar-text">Plateforme blockchain de location immobilière — Production Ready</p>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Réseau actif</label>
          <select value={network} onChange={(e) => setNetwork(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8 }}>
            {Object.keys(NETWORKS).map((k) => (
              <option key={k} value={k}>{NETWORKS[k].name}</option>
            ))}
          </select>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>{NETWORKS[network].rpc} · Chain ID {NETWORKS[network].chainId}</div>
        </div>

        <div className="role-selector">
          <p className="eyebrow">Rôle utilisateur</p>
          <div className="role-buttons">
            {ROLES.map((role) => (
              <button
                key={role}
                className={`role-btn ${userRole === role ? "active" : ""}`}
                onClick={() => setUserRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, marginTop: 8, color: 'var(--text-muted)' }}>
            {getRoleInfo().desc}
          </p>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-nav">
          {menu.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="content-area">
          <div className="panel card intro-panel">
            <h2>Application Blockchain pour Location Immobilière</h2>
            <p>Plateforme prête pour la production avec smart contracts Solidity et interface React moderne.</p>
            <ul style={{ marginTop: '1rem' }}>
              <li>✅ Smart Contracts (RealEstateRegistry, RentalAgreement)</li>
              <li>✅ Intégration Web3/MetaMask</li>
              <li>✅ Tests unitaires complets (15+ cas de test)</li>
              <li>✅ Documentation complète (Architecture, Deploy, Guide)</li>
              <li>✅ Prêt pour déploiement (Netlify/Vercel + Sepolia)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;