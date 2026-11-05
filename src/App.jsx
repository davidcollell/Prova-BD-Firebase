import { useEffect, useMemo, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc
} from 'firebase/firestore'
import {
  Activity, AlertCircle, Check, CheckCircle2, ChevronDown, CirclePlus, Cloud,
  Database, Edit3, ExternalLink, Filter, LayoutDashboard, LoaderCircle, Menu,
  MoreHorizontal, Pencil, Plus, RefreshCw, Search, ShieldAlert, Smartphone,
  Trash2, Wifi, X
} from 'lucide-react'
import { db, firebaseConfigured } from './firebase'

const emptyForm = { nom: '', descripcio: '', categoria: 'General', data: new Date().toISOString().slice(0, 10), actiu: true }

export default function App() {
  const [records, setRecords] = useState([])
  const [connection, setConnection] = useState(firebaseConfigured ? 'connecting' : 'missing')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Totes')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!firebaseConfigured) return
    const q = query(collection(db, 'proves'), orderBy('creatEl', 'desc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      setRecords(snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
      setConnection('connected')
      setError('')
    }, err => {
      setConnection('error')
      setError(err.code === 'permission-denied'
        ? 'Accés denegat. Revisa les regles de seguretat de Firestore.'
        : err.message)
    })
    return unsubscribe
  }, [])

  const categories = useMemo(() => ['Totes', ...new Set(records.map(r => r.categoria || 'General'))], [records])
  const filtered = useMemo(() => records.filter(r => {
    const text = `${r.nom || ''} ${r.descripcio || ''} ${r.categoria || ''}`.toLowerCase()
    return text.includes(search.toLowerCase()) && (categoryFilter === 'Totes' || r.categoria === categoryFilter)
  }), [records, search, categoryFilter])

  const activeCount = records.filter(r => r.actiu).length
  const categoriesCount = new Set(records.map(r => r.categoria || 'General')).size

  function openNew() {
    setEditing(null); setForm(emptyForm); setModalOpen(true)
  }
  function openEdit(record) {
    setEditing(record.id)
    setForm({
      nom: record.nom || '', descripcio: record.descripcio || '',
      categoria: record.categoria || 'General',
      data: record.data || new Date().toISOString().slice(0, 10),
      actiu: Boolean(record.actiu)
    })
    setModalOpen(true)
  }
  async function saveRecord(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSaving(true); setError('')
    try {
      const payload = { ...form, nom: form.nom.trim(), descripcio: form.descripcio.trim(), categoria: form.categoria.trim() || 'General', actualitzatEl: serverTimestamp() }
      if (editing) await updateDoc(doc(db, 'proves', editing), payload)
      else await addDoc(collection(db, 'proves'), { ...payload, creatEl: serverTimestamp() })
      setModalOpen(false)
      setNotice(editing ? 'Registre actualitzat correctament.' : 'Registre creat correctament.')
      setTimeout(() => setNotice(''), 3500)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }
  async function removeRecord(record) {
    if (!confirm(`Vols eliminar el registre «${record.nom}»? Aquesta acció no es pot desfer.`)) return
    try {
      await deleteDoc(doc(db, 'proves', record.id))
      setNotice('Registre eliminat.'); setTimeout(() => setNotice(''), 3000)
    } catch (err) { setError(err.message) }
  }
  async function toggleActive(record) {
    try { await updateDoc(doc(db, 'proves', record.id), { actiu: !record.actiu, actualitzatEl: serverTimestamp() }) }
    catch (err) { setError(err.message) }
  }

  const nav = [
    { id: 'dashboard', label: 'Resum', icon: LayoutDashboard },
    { id: 'records', label: 'Registres', icon: Database },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Database size={21}/></div><div><strong>Firestore Lab</strong><small>Entorn de proves</small></div></div>
      <div className="nav-label">ESPAI DE TREBALL</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-item ${activeTab === item.id ? 'selected' : ''}`} onClick={() => {setActiveTab(item.id); setMobileMenu(false)}}><item.icon size={18}/>{item.label}{item.id === 'records' && <span className="nav-count">{records.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="connection-card">
          <div className="connection-title"><span className={`status-dot ${connection}`}></span> Connexió Firebase</div>
          <p>{connection === 'connected' ? 'Connectat i sincronitzant' : connection === 'connecting' ? 'Connectant...' : connection === 'missing' ? 'Falta configurar Firebase' : 'No s’ha pogut connectar'}</p>
        </div>
        <div className="sidebar-foot"><span>Firestore Lab</span><span>v1.0.0</span></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Obrir menú"><Menu size={20}/></button>
        <div className="breadcrumb">Espai de treball <span>/</span> <strong>{activeTab === 'dashboard' ? 'Resum' : 'Registres'}</strong></div>
        <div className="topbar-right"><div className={`connection-pill ${connection}`}><span className="status-dot"></span>{connection === 'connected' ? 'En línia' : connection === 'connecting' ? 'Connectant' : connection === 'missing' ? 'Sense configurar' : 'Error'}</div><div className="avatar">FL</div></div>
      </header>

      <div className="content">
        {!firebaseConfigured && <div className="alert warning"><ShieldAlert size={19}/><div><strong>Falta configurar Firebase</strong><p>Crea el fitxer <code>.env.local</code> a partir de <code>.env.example</code> i afegeix les dades de la teva aplicació web de Firebase.</p></div></div>}
        {error && <div className="alert danger"><AlertCircle size={19}/><div><strong>Hi ha hagut un problema</strong><p>{error}</p></div><button className="icon-button" onClick={() => setError('')}><X size={17}/></button></div>}
        {notice && <div className="alert success"><CheckCircle2 size={18}/>{notice}</div>}

        {activeTab === 'dashboard' ? <>
          <div className="page-heading"><div><div className="eyebrow">PANELL DE CONTROL</div><h1>Bon dia 👋</h1><p>Consulta l’estat de la connexió i l’activitat de la base de dades.</p></div><button className="primary-button" onClick={openNew} disabled={!firebaseConfigured}><Plus size={17}/> Nou registre</button></div>
          <div className="stats-grid">
            <Stat icon={Database} label="Total registres" value={records.length} note="Documents a Firestore"/>
            <Stat icon={CheckCircle2} label="Registres actius" value={activeCount} note="Amb estat actiu"/>
            <Stat icon={LayoutDashboard} label="Categories" value={categoriesCount} note="Categories utilitzades"/>
            <div className="stat-card status-stat"><div className="stat-top"><span className="stat-icon"><Activity size={19}/></span><span className="stat-label">Estat de connexió</span></div><div className="status-value"><span className={`status-dot ${connection}`}></span>{connection === 'connected' ? 'Connectat' : connection === 'connecting' ? 'Connectant...' : connection === 'missing' ? 'Pendent' : 'Error'}</div><div className="stat-note">Sincronització en temps real</div></div>
          </div>
          <div className="dashboard-grid">
            <section className="panel recent-panel"><div className="panel-heading"><div><h2>Últims registres</h2><p>Les dades més recents de Firestore</p></div><button className="text-button" onClick={() => setActiveTab('records')}>Veure tots <ExternalLink size={14}/></button></div>
              {records.length === 0 ? <EmptyState onAdd={openNew} disabled={!firebaseConfigured}/> : <div className="recent-list">{records.slice(0,5).map(r => <div className="recent-row" key={r.id}><div className="record-avatar">{(r.nom || '?').slice(0,1).toUpperCase()}</div><div className="recent-info"><strong>{r.nom}</strong><span>{r.categoria || 'General'} · {r.data || 'Sense data'}</span></div><span className={`state-tag ${r.actiu ? 'active' : 'inactive'}`}>{r.actiu ? 'Actiu' : 'Inactiu'}</span><button className="icon-button" onClick={() => openEdit(r)} aria-label="Editar"><Pencil size={16}/></button></div>)}</div>}
            </section>
            <section className="panel info-panel"><div className="panel-heading"><div><h2>Proves de connexió</h2><p>Què pots comprovar amb aquesta app</p></div><span className="info-icon"><Wifi size={19}/></span></div>
              <div className="check-list"><CheckLine text="Connexió amb el projecte Firebase" done={connection === 'connected'}/><CheckLine text="Lectura de documents de Firestore" done={connection === 'connected'}/><CheckLine text="Sincronització automàtica" done={connection === 'connected'}/><CheckLine text="Escriptura i modificació de dades" done={records.length > 0}/></div>
              <div className="tip-box"><strong>Consell</strong><p>Obre aquesta app en dos dispositius o pestanyes. Quan modifiquis un registre en un, veuràs el canvi a l’altre automàticament.</p></div>
            </section>
          </div>
        </> : <>
          <div className="page-heading"><div><div className="eyebrow">BASE DE DADES / PROVES</div><h1>Registres</h1><p>Gestiona els documents de la col·lecció <code>proves</code>.</p></div><button className="primary-button" onClick={openNew} disabled={!firebaseConfigured}><Plus size={17}/> Nou registre</button></div>
          <section className="panel table-panel">
            <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca registres..."/></div><div className="filter-box"><Filter size={16}/><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14}/></div><span className="results-count">{filtered.length} resultats</span></div>
            <div className="table-wrap"><table><thead><tr><th>NOM</th><th>CATEGORIA</th><th>DATA</th><th>ESTAT</th><th className="actions-head">ACCIONS</th></tr></thead><tbody>
              {filtered.map(r => <tr key={r.id}><td><div className="table-name"><div className="record-avatar small">{(r.nom || '?').slice(0,1).toUpperCase()}</div><div><strong>{r.nom}</strong><span>{r.descripcio || 'Sense descripció'}</span></div></div></td><td><span className="category-tag">{r.categoria || 'General'}</span></td><td>{r.data || '—'}</td><td><button className={`state-tag ${r.actiu ? 'active' : 'inactive'} state-button`} onClick={() => toggleActive(r)}>{r.actiu ? 'Actiu' : 'Inactiu'}</button></td><td><div className="row-actions"><button className="icon-button" onClick={() => openEdit(r)} title="Editar"><Edit3 size={16}/></button><button className="icon-button delete-button" onClick={() => removeRecord(r)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>)}
            </tbody></table>{filtered.length === 0 && <EmptyState onAdd={openNew} disabled={!firebaseConfigured} isFiltered={records.length > 0}/>}</div>
          </section>
          <div className="table-foot"><span><span className="status-dot connected"></span> Dades sincronitzades en temps real</span><span>Col·lecció: <code>proves</code></span></div>
        </>}
      </div>
    </main>

    {modalOpen && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setModalOpen(false)}}><form className="modal" onSubmit={saveRecord}>
      <div className="modal-head"><div><div className="eyebrow">{editing ? 'MODIFICAR DOCUMENT' : 'NOU DOCUMENT'}</div><h2>{editing ? 'Editar registre' : 'Crear registre'}</h2></div><button type="button" className="icon-button" onClick={() => setModalOpen(false)}><X size={19}/></button></div>
      <label>Nom <span>*</span><input autoFocus required maxLength="100" value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} placeholder="Ex. Prova de connexió"/></label>
      <label>Descripció<textarea rows="3" maxLength="500" value={form.descripcio} onChange={e => setForm({...form, descripcio:e.target.value})} placeholder="Afegeix una descripció..."/></label>
      <div className="form-row"><label>Categoria<input maxLength="60" value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})} placeholder="General"/></label><label>Data<input type="date" value={form.data} onChange={e => setForm({...form, data:e.target.value})}/></label></div>
      <label className="toggle-label"><span>Registre actiu</span><button type="button" className={`toggle ${form.actiu ? 'on' : ''}`} onClick={() => setForm({...form, actiu:!form.actiu})}><span/></button></label>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel·lar</button><button className="primary-button" disabled={saving || !firebaseConfigured}>{saving ? <><LoaderCircle className="spin" size={17}/> Desant...</> : <><Check size={17}/> {editing ? 'Guardar canvis' : 'Crear registre'}</>}</button></div>
    </form></div>}
  </div>
}

function Stat({icon: Icon, label, value, note}) {
  return <div className="stat-card"><div className="stat-top"><span className="stat-icon"><Icon size={19}/></span><span className="stat-label">{label}</span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>
}
function CheckLine({text, done}) { return <div className="check-line"><span className={`check-circle ${done ? 'done' : ''}`}>{done && <Check size={12}/>}</span>{text}</div> }
function EmptyState({onAdd, disabled, isFiltered}) {
  return <div className="empty-state"><div className="empty-icon"><Database size={25}/></div><h3>{isFiltered ? 'No hi ha resultats' : 'Encara no hi ha registres'}</h3><p>{isFiltered ? 'Prova de canviar els filtres de cerca.' : 'Crea el primer registre per comprovar que Firebase funciona correctament.'}</p>{!isFiltered && <button className="primary-button" onClick={onAdd} disabled={disabled}><Plus size={16}/> Crear primer registre</button>}</div>
}
