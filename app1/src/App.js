import { useMemo, useState } from "react";
import "./App.css";

const ROLES = ["Owner", "Tenant", "Admin"];
const PROPERTY_STATUSES = ["Disponible", "En contrat", "Validation"];
const CONTRACT_STATUSES = ["PENDING", "ACTIVE", "COMPLETED"];

const metrics = [
  { label: "Biens list�s", value: "12", note: "Disponibles ou en validation" },
  { label: "Contrats actifs", value: "7", note: "Locations en cours sur Ganache" },
  { label: "Paiements suivis", value: "24", note: "Historique tra�able on-chain" },
  { label: "Litiges ouverts", value: "1", note: "Arbitrage futur pr�vu" },
];

const menu = [
  { id: "overview", label: "Vue g�n�rale" },
  { id: "properties", label: "Biens" },
  { id: "contracts", label: "Contrats" },
  { id: "payments", label: "Paiements" },
  { id: "future", label: "Futur" },
];

const allProperties = [
  {
    id: 1,
    title: "Appartement F3 - Cotonou",
    location: "Cotonou",
    status: "Disponible",
    price: 0.85,
    owner: "0xA12...9F4",
    tenant: "Aucun locataire",
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Appartement", "2 chambres", "Caution 1 mois"],
  },
  {
    id: 2,
    title: "Maison familiale - Abidjan",
    location: "Abidjan",
    status: "En contrat",
    price: 1.4,
    owner: "0xC77...2B1",
    tenant: "0x4D0...8EE",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
    tags: ["Maison", "3 chambres", "Escrow actif"],
  },
  {
    id: 3,
    title: "Studio urbain - Dakar",
    location: "Dakar",
    status: "Validation",
    price: 0.42,
    owner: "0x9AE...119",
    tenant: "Demande en attente",
    image:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
    tags: ["Studio", "Id�al �tudiant", "Review pr�vue"],
  },
  {
    id: 4,
    title: "Penthouse - Accra",
    location: "Accra",
    status: "Disponible",
    price: 2.5,
    owner: "0xB3E...F2K",
    tenant: "Aucun locataire",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    tags: ["Luxe", "4 chambres", "Terrasse panoramique"],
  },
];

const featuredShots = [allProperties[0], allProperties[1], allProperties[3]];

const allContracts = [
  {
    id: 'CTR-1042',
    property: 'Appartement F3 - Cotonou',
    tenant: '0x4D0...8EE',
    status: 'PENDING',
    amount: 0.85,
    nextStep: 'Validation owner',
  },
  {
    id: 'CTR-1043',
    property: 'Maison familiale - Abidjan',
    tenant: '0x77A...19C',
    status: 'ACTIVE',
    amount: 1.4,
    nextStep: 'Paiement du mois en cours',
  },
  {
    id: 'CTR-1044',
    property: 'Studio urbain - Dakar',
    tenant: '0x2BE...88F',
    status: 'COMPLETED',
    amount: 0.42,
    nextStep: 'Archivage',
  },
];

const contractFlow = [
  "1. Le propri�taire publie le bien sur la plateforme.",
  "2. Le locataire consulte les d�tails et fait une demande.",
  "3. Le contrat est cr�� sur la blockchain locale (Ganache).",
  "4. La caution et le premier mois passent par l'escrow.",
  "5. Le bail devient actif apr�s validation.",
  "6. Les paiements et le statut restent tra�ables.",
];

const futurePlan = [
  {
    title: "MVP r�el",
    detail: "Publier un bien, voir les annonces, cr�er un bail, suivre un paiement.",
  },
  {
    title: "Version utile",
    detail: "Escrow complet, notifications, filtres, historique, tableau de bord.",
  },
  {
    title: "Version future",
    detail: "IPFS, KYC, litiges, signature multiple, analytics, testnet.",
  },
];

const statuses = [
  { title: "Network", value: "Ganache local" },
  { title: "Wallet", value: "MetaMask connected" },
  { title: "Contracts", value: "Compiled & deployed" },
];

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState("Owner");
  const [priceFilter, setPriceFilter] = useState(3);
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [activityLog, setActivityLog] = useState([
    'Dashboard initialized',
    'Ready for property and contract actions',
  ]);

  const selectedProperty = allProperties.find((property) => property.id === selectedPropertyId) || null;

  const pushActivity = (message) => {
    setActivityLog((currentLog) => [message, ...currentLog.slice(0, 4)]);
  };

  // Filter properties based on role and filters
  const filteredProperties = useMemo(() => {
    return allProperties.filter((prop) => {
      const priceOk = prop.price <= priceFilter;
      const locationOk = !locationFilter || prop.location.toLowerCase().includes(locationFilter.toLowerCase());
      const statusOk = !statusFilter || prop.status === statusFilter;

      if (userRole === "Owner") {
        return priceOk && locationOk && statusOk;
      } else if (userRole === "Tenant") {
        return prop.status === "Disponible" && priceOk && locationOk && statusOk;
      } else if (userRole === "Admin") {
        return priceOk && locationOk && statusOk;
      }
      return true;
    });
  }, [priceFilter, locationFilter, statusFilter, userRole]);

  const filteredContracts = useMemo(() => {
    return allContracts.filter((contract) => {
      const statusOk = !contractFilter || contract.status === contractFilter;

      if (userRole === 'Tenant') {
        return statusOk && contract.status !== 'COMPLETED';
      }

      return statusOk;
    });
  }, [contractFilter, userRole]);

  // Get role-specific info
  const getRoleInfo = () => {
    switch (userRole) {
      case "Owner":
        return { desc: "G�rez vos propri�t�s, cr�ez des contrats, suivez les paiements", color: "#4f46e5" };
      case "Tenant":
        return { desc: "Trouvez une propri�t�, faites une r�servation, payez votre loyer", color: "#06b6d4" };
      case "Admin":
        return { desc: "Supervisez le r�seau, r�solvez les litiges, g�rez les contrats critiques", color: "#f97316" };
      default:
        return { desc: "", color: "#666" };
    }
  };

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "properties":
        return (
          <div className="section-grid two-col">
            <section className="panel card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Property registry</p>
                  <h2>Registre des biens immobiliers</h2>
                </div>
                <span className="badge">On-chain</span>
              </div>

              {/* Property filters */}
              <div className="filter-row">
                <label>
                  <span>Prix max (ETH/mois)</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(parseFloat(e.target.value))}
                  />
                  <span className="filter-value">{priceFilter.toFixed(2)} ETH</span>
                </label>

                <label>
                  <span>Localisation</span>
                  <input
                    type="text"
                    placeholder="Cotonou, Dakar..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </label>

                <label>
                  <span>Statut</span>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Tous</option>
                    {PROPERTY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="btn-reset"
                  onClick={() => {
                    setPriceFilter(3);
                    setLocationFilter("");
                    setStatusFilter("");
                  }}
                >
                  R�initialiser
                </button>
              </div>

              <div className="list-stack">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <article
                      className={selectedPropertyId === property.id ? 'property-card property-card-selected' : 'property-card'}
                      key={property.id}
                    >
                      <div className="property-visual">
                        <img src={property.image} alt={property.title} loading="lazy" />
                        <span className="property-visual-badge">{property.location}</span>
                      </div>
                      <div className="property-top">
                        <div>
                          <h3>{property.title}</h3>
                          <p>{property.price.toFixed(2)} ETH / mois</p>
                        </div>
                        <span className="status-pill">{property.status}</span>
                      </div>
                      <div className="meta-grid">
                        <div>
                          <span>Owner</span>
                          <strong>{property.owner}</strong>
                        </div>
                        <div>
                          <span>Tenant</span>
                          <strong>{property.tenant}</strong>
                        </div>
                      </div>
                      <div className="tag-row">
                        {property.tags.map((tag) => (
                          <span className="tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      {userRole === "Tenant" && property.status === "Disponible" && (
                        <button
                          className="btn-action"
                          onClick={() => {
                            setSelectedPropertyId(property.id);
                            pushActivity(`Tenant request started for ${property.title}`);
                          }}
                        >
                          Demander la location
                        </button>
                      )}
                      {userRole === "Owner" && (
                        <button
                          className="btn-action"
                          onClick={() => {
                            setSelectedPropertyId(property.id);
                            pushActivity(`Owner reviewed ${property.title}`);
                          }}
                        >
                          Éditer / Retirer
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="no-results">Aucun bien ne correspond � vos crit�res.</div>
                )}
              </div>
            </section>

            <aside className="panel card form-panel">
              <p className="eyebrow">Create listing</p>
              <h2>Template de cr�ation d''un bien</h2>
              <div className="form-grid">
                <label>
                  Titre du bien
                  <input type="text" placeholder="Appartement F4 - Lom�" />
                </label>
                <label>
                  Localisation
                  <input type="text" placeholder="Ville, quartier, pays" />
                </label>
                <label>
                  Loyer mensuel (ETH)
                  <input type="number" placeholder="0.90" step="0.01" />
                </label>
                <label>
                  D�p�t de garantie
                  <input type="text" placeholder="1 mois" />
                </label>
                <label className="full-width">
                  Description
                  <textarea rows="4" placeholder="D�crire le bien, les pi�ces, les conditions..." />
                </label>
                <button className="btn-primary" onClick={() => pushActivity('New listing form opened for publishing')}>
                  Publier le bien
                </button>
              </div>
            </aside>
          </div>
        );

      case "contracts":
        return (
          <div className="section-grid two-col">
            <section className="panel card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Rental workflow</p>
                  <h2>Logique d''un contrat de location</h2>
                </div>
                <span className="badge badge-soft">State machine</span>
              </div>

              {/* Contract status filters */}
              <div className="filter-row">
                <label>
                  <span>Filtrer par statut</span>
                  <select value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
                    <option value="">Tous</option>
                    {CONTRACT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flow-list">
                {contractFlow.map((step) => (
                  <div className="flow-item" key={step}>
                    <span className="flow-dot" />
                    <p>{step}</p>
                  </div>
                ))}
              </div>

              <div className="contract-list">
                {filteredContracts.map((contract) => (
                  <article className="contract-card" key={contract.id}>
                    <div>
                      <strong>{contract.id}</strong>
                      <p>{contract.property}</p>
                    </div>
                    <div className="contract-meta">
                      <span>{contract.status}</span>
                      <strong>{contract.amount.toFixed(2)} ETH</strong>
                    </div>
                    <small>{contract.nextStep}</small>
                  </article>
                ))}
              </div>
            </section>

            <aside className="panel card timeline-panel">
              <p className="eyebrow">Status timeline</p>
              <h2>Cycle du bail</h2>
              <div className="timeline">
                <div className="timeline-step active">Listed</div>
                <div className="timeline-step">Reserved</div>
                <div className="timeline-step">Active</div>
                <div className="timeline-step">Paid</div>
                <div className="timeline-step">Completed</div>
              </div>
              <div className="callout">
                <strong>Escrow</strong>
                <p>Les fonds du locataire restent contr�l�s jusqu''� validation du contrat.</p>
              </div>

              <div className="contract-actions">
                {userRole === "Owner" && (
                  <button className="btn-action" onClick={() => pushActivity('Owner created a new contract draft')}>
                    Créer un contrat
                  </button>
                )}
                {userRole === "Tenant" && (
                  <button className="btn-action" onClick={() => pushActivity('Tenant opened their contracts')}>
                    Consulter mes contrats
                  </button>
                )}
                {userRole === "Admin" && (
                  <button className="btn-action" onClick={() => pushActivity('Admin opened dispute resolution panel')}>
                    Arbitrer un litige
                  </button>
                )}
              </div>
            </aside>
          </div>
        );

      case "payments":
        return (
          <div className="section-grid two-col">
            <section className="panel card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Payment ledger</p>
                  <h2>Suivi des paiements</h2>
                </div>
                <span className="badge">Traceable</span>
              </div>
              <div className="ledger-list">
                <div className="ledger-row">
                  <span>2026-05-01</span>
                  <strong>0.85 ETH</strong>
                  <p>Loyer mensuel - confirm�</p>
                </div>
                <div className="ledger-row">
                  <span>2026-04-01</span>
                  <strong>0.85 ETH</strong>
                  <p>Loyer mensuel - confirm�</p>
                </div>
                <div className="ledger-row">
                  <span>2026-03-01</span>
                  <strong>1.40 ETH</strong>
                  <p>Caution + premier mois</p>
                </div>
              </div>

              {userRole === "Tenant" && (
                <button
                  className="btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={() => pushActivity('Tenant triggered a rent payment action')}
                >
                  Payer mon loyer
                </button>
              )}
            </section>

            <aside className="panel card metrics-panel">
              <p className="eyebrow">Wallet view</p>
              <h2>Solde et activit�</h2>
              <div className="wallet-box">
                <strong>Balance</strong>
                <span>14.72 ETH</span>
              </div>
              <div className="wallet-box wallet-box-soft">
                <strong>Last action</strong>
                <span>Payment confirmed on-chain</span>
              </div>
              <div className="wallet-box wallet-box-soft" style={{ marginTop: "1rem" }}>
                <strong>Utilisateur</strong>
                <span>{userRole === "Owner" ? "Propri�taire" : userRole === "Tenant" ? "Locataire" : "Administrateur"}</span>
              </div>
            </aside>
          </div>
        );

      case "future":
        return (
          <div className="section-grid two-col">
            <section className="panel card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Roadmap</p>
                  <h2>Ce que l''application doit devenir</h2>
                </div>
                <span className="badge badge-future">Future ready</span>
              </div>
              <div className="future-grid">
                {futurePlan.map((item) => (
                  <article className="future-card" key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="panel card">
              <p className="eyebrow">Technical path</p>
              <h2>�volution recommand�e</h2>
              <ul className="bullet-list">
                <li>Ganache local pour le prototype.</li>
                <li>Truffle pour compiler et d�ployer.</li>
                <li>React pour l''interface utilisateur.</li>
                <li>Web3 / ethers pour la connexion wallet.</li>
                <li>IPFS, KYC et litiges dans une version future.</li>
              </ul>
            </aside>
          </div>
        );

      case "overview":
      default:
        return (
          <div className="section-grid two-col">
            <section className="panel card intro-panel">
              <p className="eyebrow">Project dashboard</p>
              <h2>Application de location immobili�re blockchain</h2>
              <p className="lead-text">
                Cette maquette sert � visualiser la logique r�elle du projet: publier un bien, cr�er un contrat,
                s�curiser les paiements et pr�parer une version future plus robuste.
              </p>
              <div className="status-row">
                {statuses.map((status) => (
                  <div className="status-chip" key={status.title}>
                    <span>{status.title}</span>
                    <strong>{status.value}</strong>
                  </div>
                ))}
              </div>

              <div className="hero-visual">
                <div className="hero-main-image">
                  <img src={featuredShots[0].image} alt={featuredShots[0].title} />
                  <div className="hero-main-copy">
                    <span>Featured listing</span>
                    <strong>{featuredShots[0].title}</strong>
                    <p>{featuredShots[0].location} • {featuredShots[0].price.toFixed(2)} ETH</p>
                  </div>
                </div>

                <div className="hero-thumb-grid">
                  {featuredShots.slice(1).map((property) => (
                    <article className="hero-thumb" key={property.id}>
                      <img src={property.image} alt={property.title} loading="lazy" />
                      <div>
                        <strong>{property.title}</strong>
                        <p>{property.location}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <aside className="panel card metrics-panel">
              <p className="eyebrow">Current snapshot</p>
              <div className="metrics-grid">
                {metrics.map((metric) => (
                  <article className="metric-card" key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <p>{metric.note}</p>
                  </article>
                ))}
              </div>

              <div className="activity-panel">
                <div className="activity-head">
                  <h3>Recent activity</h3>
                  <button className="btn-reset" onClick={() => pushActivity('Activity feed refreshed')}>
                    Refresh
                  </button>
                </div>
                <div className="activity-list">
                  {activityLog.map((item) => (
                    <div className="activity-item" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        );
    }
  }, [
    activeTab,
    filteredProperties,
    filteredContracts,
    userRole,
    priceFilter,
    locationFilter,
    statusFilter,
    contractFilter,
    selectedPropertyId,
    activityLog,
  ]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar card">
        <div>
          <p className="eyebrow">App1</p>
          <h1>Real Estate Chain</h1>
          <p className="sidebar-text">Prototype de location immobili�re sur blockchain locale.</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          <p className="eyebrow">R�le utilisateur</p>
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
          <p className="role-desc">{getRoleInfo().desc}</p>
        </div>

        <nav className="nav-stack">
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Ganache</span>
          <strong>localhost:7545</strong>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-banner card">
          <div>
            <p className="eyebrow">Status</p>
            <h2>Dashboard {userRole} - Conception adapt�e au vrai usage</h2>
          </div>
          <div className="top-banner-meta">
            <span style={{ color: getRoleInfo().color }}>● {userRole}</span>
            <span>Smart contracts + React</span>
          </div>
        </header>

        {selectedProperty && (
          <section className="panel card selection-banner">
            <div>
              <p className="eyebrow">Selected property</p>
              <h3>{selectedProperty.title}</h3>
              <p>
                {selectedProperty.location} • {selectedProperty.status} • {selectedProperty.price.toFixed(2)} ETH / mois
              </p>
            </div>
            <button className="btn-reset" onClick={() => setSelectedPropertyId(null)}>
              Clear
            </button>
          </section>
        )}

        {tabContent}
      </main>
    </div>
  );
}

export default App;
