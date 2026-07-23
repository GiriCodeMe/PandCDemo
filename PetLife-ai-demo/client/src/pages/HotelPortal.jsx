import { useState, useEffect } from 'react';
import {
  hotelHealthPass,
  hotelStayProtectionQuote,
  hotelStayProtectionBind,
  hotelIncidentReport,
  hotelLoyaltyApplyEvent,
  hotelLoyaltyLog,
  fnolGetPolicies,
} from '../api';

const HOTEL_FACILITIES = [
  { facilityId: 'HOTEL-PALACE-OHIO-02', name: 'Pet Palace Resort - Columbus, OH' },
  { facilityId: 'HOTEL-DEST-CA-07',     name: 'Destination Pet - Los Angeles, CA' },
  { facilityId: 'HOTEL-GINGR-TX-11',    name: 'Gingr Partner Resort - Houston, TX' },
];

const TABS = [
  { id: 'health',    icon: '🩺', label: 'Health Pass' },
  { id: 'stay',      icon: '🏠', label: 'Stay Protection' },
  { id: 'incident',  icon: '🚨', label: 'Incident Response' },
  { id: 'loyalty',   icon: '⭐', label: 'Loyalty Dashboard' },
];

const EVENT_TYPE_LABELS = {
  CHECKOUT_DEDUCTIBLE_CREDIT: 'Checkout Deductible Credit',
  VET_VISIT_DISCOUNT:         'Vet Visit Discount',
  BOARDING_INCIDENT_WRITEOFF: 'Boarding Incident Write-Off',
};

const VAX_STATUS_COLOR = {
  COMPLIANT:      '#10b981',
  EXPIRING_SOON:  '#f59e0b',
  NON_COMPLIANT:  '#ef4444',
  MISSING:        '#ef4444',
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  const diff = new Date(b) - new Date(a);
  return Math.max(0, Math.round(diff / 86400000));
}

export default function HotelPortal() {
  const [activeTab, setActiveTab] = useState('health');
  const [pets, setPets]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // ---- Health Pass ----
  const [selectedPetId, setSelectedPetId] = useState('');
  const [healthResult, setHealthResult]   = useState(null);
  const [checkedIn, setCheckedIn]         = useState(null);

  // ---- Stay Protection ----
  const [facilityId, setFacilityId]     = useState('');
  const [checkIn, setCheckIn]           = useState('');
  const [checkOut, setCheckOut]         = useState('');
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [petName, setPetName]           = useState('');
  const [petSpecies, setPetSpecies]     = useState('Canine');
  const [petBreed, setPetBreed]         = useState('');
  const [petAge, setPetAge]             = useState('');
  const [microchipId, setMicrochipId]   = useState('');
  const [linkPetId, setLinkPetId]       = useState('');
  const [linkPetEnabled, setLinkPetEnabled] = useState(false);
  const [addProtection, setAddProtection]   = useState(false);
  const [quote, setQuote]               = useState(null);
  const [binderResult, setBinderResult] = useState(null);

  // ---- Incident ----
  const [incidentPetId, setIncidentPetId]           = useState('');
  const [incidentFacilityId, setIncidentFacilityId] = useState('');
  const [incidentType, setIncidentType]             = useState('ILLNESS');
  const [symptomsDesc, setSymptomsDesc]             = useState('');
  const [staffId, setStaffId]                       = useState('');
  const [incidentDatetime, setIncidentDatetime]     = useState('');
  const [incidentResult, setIncidentResult]         = useState(null);

  // ---- Loyalty ----
  const [loyaltyLog, setLoyaltyLog]   = useState([]);
  const [simPetId, setSimPetId]       = useState('');
  const [simEventType, setSimEventType] = useState('CHECKOUT_DEDUCTIBLE_CREDIT');
  const [simResult, setSimResult]     = useState(null);

  // Load pets on mount
  useEffect(() => {
    fnolGetPolicies()
      .then(res => setPets(res.data?.policies || []))
      .catch(() => {});
  }, []);

  // Load loyalty log when tab becomes active
  useEffect(() => {
    if (activeTab === 'loyalty') {
      fetchLoyaltyLog();
    }
  }, [activeTab]);

  // Pre-fill link pet info when linkPetId changes
  useEffect(() => {
    if (!linkPetId || !linkPetEnabled) return;
    const found = pets.find(p => p.petId === linkPetId || p.id === linkPetId);
    if (found) {
      setPetName(found.petName || found.name || '');
      setPetSpecies(found.species || 'Canine');
      setPetBreed(found.breed || '');
      setPetAge(found.age != null ? String(found.age) : '');
      setMicrochipId(found.microchipId || '');
      setFirstName(found.holderFirstName || found.ownerFirstName || '');
      setLastName(found.holderLastName || found.ownerLastName || '');
      setEmail(found.holderEmail || found.email || '');
      setPhone(found.holderPhone || found.phone || '');
    }
  }, [linkPetId, linkPetEnabled, pets]);

  // Default incidentDatetime to now when tab opens
  useEffect(() => {
    if (activeTab === 'incident' && !incidentDatetime) {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setIncidentDatetime(local);
    }
  }, [activeTab]);

  // ---- Computed ----
  const stayDays = daysBetween(checkIn, checkOut);
  const DAILY_RATE = 3.50;
  const stayTotal = stayDays * DAILY_RATE;

  // ---- Helpers ----
  function petOptionLabel(p) {
    const name = p.petName || p.name || p.petId || p.id;
    const id   = p.petId || p.id;
    return `${name} (${id})`;
  }

  function petId(p) {
    return p.petId || p.id;
  }

  async function fetchLoyaltyLog() {
    try {
      const res = await hotelLoyaltyLog();
      setLoyaltyLog(res.data?.log || []);
    } catch (_) {}
  }

  // ---- Handlers ----
  async function handleHealthPass() {
    if (!selectedPetId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await hotelHealthPass(selectedPetId);
      setHealthResult(res.data);
      setCheckedIn(null);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Health pass lookup failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetQuote() {
    setError(null);
    setLoading(true);
    try {
      const res = await hotelStayProtectionQuote(checkIn, checkOut, linkPetEnabled && linkPetId ? linkPetId : undefined);
      setQuote(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Quote request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleBind() {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        facilityId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        owner: { firstName, lastName, email, phone },
        pet: {
          name: petName,
          species: petSpecies,
          breed: petBreed,
          age: petAge ? parseInt(petAge) : undefined,
          microchipId: microchipId || undefined,
        },
        linkedPetId: linkPetEnabled && linkPetId ? linkPetId : undefined,
      };
      const res = await hotelStayProtectionBind(payload);
      setBinderResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Booking confirmation failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleResetStay() {
    setFacilityId(''); setCheckIn(''); setCheckOut('');
    setFirstName(''); setLastName(''); setEmail(''); setPhone('');
    setPetName(''); setPetSpecies('Canine'); setPetBreed(''); setPetAge('');
    setMicrochipId(''); setLinkPetId(''); setLinkPetEnabled(false);
    setAddProtection(false); setQuote(null); setBinderResult(null);
  }

  async function handleIncidentSubmit() {
    if (!incidentPetId || !symptomsDesc || symptomsDesc.length < 10) return;
    setError(null);
    setLoading(true);
    try {
      const payload = {
        petId: incidentPetId,
        facilityId: incidentFacilityId,
        incidentType,
        symptomsDescription: symptomsDesc,
        staffId: staffId || undefined,
        incidentDatetime: incidentDatetime || new Date().toISOString(),
      };
      const res = await hotelIncidentReport(payload);
      setIncidentResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Incident report submission failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSimEvent() {
    if (!simPetId) return;
    setError(null);
    setSimResult(null);
    setLoading(true);
    try {
      const res = await hotelLoyaltyApplyEvent({
        petId: simPetId,
        eventType: simEventType,
        triggerContext: {
          stayDays: 6,
          reservationId: 'SIM-001',
          facilityId: HOTEL_FACILITIES[0].facilityId,
        },
      });
      setSimResult({ success: true, data: res.data });
      await fetchLoyaltyLog();
    } catch (err) {
      setSimResult({ success: false, message: err?.response?.data?.error || err?.response?.data?.detail || err.message });
    } finally {
      setLoading(false);
    }
  }

  // ---- Badge helpers ----
  function healthClearanceBadge(status) {
    if (status === 'GREEN') return { bg: '#10b981', label: 'CLEARED FOR CHECK-IN' };
    if (status === 'AMBER') return { bg: '#f59e0b', label: 'CONDITIONAL — REVIEW REQUIRED' };
    return { bg: '#ef4444', label: 'NOT CLEARED — DO NOT CHECK IN' };
  }

  function insuranceBadge(status) {
    if (status === 'ACTIVE') return 'badge badge-success';
    if (status === 'LAPSED') return 'badge badge-danger';
    return 'badge badge-muted';
  }

  // ---- Loyalty aggregation ----
  function loyaltySummaryByPet() {
    const map = {};
    for (const entry of loyaltyLog) {
      const id = entry.petId;
      if (!map[id]) map[id] = { petId: id, credits: 0, discountPct: 0, lastExpiry: null };
      const numericValue = parseFloat(String(entry.rewardValue || '0').replace(/[^0-9.]/g, '')) || 0;
      if (entry.eventType === 'CHECKOUT_DEDUCTIBLE_CREDIT') map[id].credits += numericValue;
      if (entry.eventType === 'VET_VISIT_DISCOUNT') map[id].discountPct = Math.max(map[id].discountPct, numericValue);
      if (entry.expiryDate) {
        if (!map[id].lastExpiry || entry.expiryDate > map[id].lastExpiry) map[id].lastExpiry = entry.expiryDate;
      }
    }
    return Object.values(map);
  }

  // ============================================================
  // TAB RENDERS
  // ============================================================

  function renderHealthPass() {
    const r = healthResult;
    const clearance = r ? healthClearanceBadge(r.overallStatus) : null;

    return (
      <div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">Pet Check-In Clearance</div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="section-label">Select Pet</label>
                <select className="form-input" style={{ width: '100%' }} value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)}>
                  <option value="">— Select a Pet —</option>
                  {pets.map(p => (
                    <option key={petId(p)} value={petId(p)}>{petOptionLabel(p)}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleHealthPass} disabled={loading || !selectedPetId}>
                {loading ? 'Running…' : 'Run Health Check'}
              </button>
            </div>
          </div>
        </div>

        {r && (
          <div className="result-card">
            {/* Clearance badge */}
            <div style={{
              background: clearance.bg,
              borderRadius: '8px 8px 0 0',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ fontSize: 28 }}>
                {r.overallStatus === 'GREEN' ? '✅' : r.overallStatus === 'AMBER' ? '⚠️' : '🚫'}
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{clearance.label}</div>
                {r.clearanceCode && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Code: {r.clearanceCode}</div>}
              </div>
            </div>

            <div className="result-body">
              {/* Pet identity */}
              <div style={{ marginBottom: 16 }}>
                <div className="section-label">Pet &amp; Owner</div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div><span className="text-muted text-sm">Name:</span> <strong>{r.petName}</strong></div>
                  <div><span className="text-muted text-sm">Species:</span> {r.species}</div>
                  <div><span className="text-muted text-sm">Breed:</span> {r.breed}</div>
                  <div><span className="text-muted text-sm">Policy:</span> {r.policyNumber}</div>
                </div>
              </div>

              {/* Vaccination table */}
              <div className="section-label">Vaccination Status</div>
              <table className="data-table" style={{ width: '100%', marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th>Administered By</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(r.vaccinations || {}).map(([vaccineName, vax]) => (
                    <tr key={vaccineName}>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{vaccineName}</td>
                      <td>
                        <span style={{
                          background: `${VAX_STATUS_COLOR[vax.status] || '#6b7280'}20`,
                          color: VAX_STATUS_COLOR[vax.status] || '#6b7280',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: 12,
                          fontWeight: 700,
                        }}>
                          {vax.status}
                        </span>
                      </td>
                      <td className="text-sm">{vax.expiryDate || '—'}</td>
                      <td className="text-sm text-muted">{vax.administeredBy || '—'}</td>
                    </tr>
                  ))}
                  {Object.keys(r.vaccinations || {}).length === 0 && (
                    <tr><td colSpan={4} className="text-muted text-sm" style={{ textAlign: 'center', padding: 12 }}>No vaccination records</td></tr>
                  )}
                </tbody>
              </table>

              {/* Insurance & stay protection */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 14px' }}>
                  <div className="text-muted text-sm">Insurance Status</div>
                  <span className={insuranceBadge(r.policyStatus)} style={{ marginTop: 4, display: 'inline-block' }}>{r.policyStatus || 'NONE'}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 14px' }}>
                  <div className="text-muted text-sm">Stay Protection</div>
                  <span className={r.activeStayBinder ? 'badge badge-success' : 'badge badge-muted'} style={{ marginTop: 4, display: 'inline-block' }}>
                    {r.activeStayBinder ? 'ACTIVE' : 'Not Active'}
                  </span>
                </div>
              </div>

              {/* Check-in button */}
              {checkedIn ? (
                <div className="alert" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: '#10b981', display: 'inline-block', padding: '8px 16px' }}>
                  Checked in at {checkedIn}
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => setCheckedIn(new Date().toLocaleTimeString())}>
                  Mark as Checked In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStayProtection() {
    const b = binderResult;

    return (
      <div>
        {/* Section A — Facility & Dates */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">Facility &amp; Stay Dates</div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="section-label">Facility</label>
                <select className="form-input" style={{ width: '100%' }} value={facilityId} onChange={e => setFacilityId(e.target.value)}>
                  <option value="">— Select Facility —</option>
                  {HOTEL_FACILITIES.map(f => (
                    <option key={f.facilityId} value={f.facilityId}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="section-label">Check-In Date</label>
                <input type="date" className="form-input" style={{ width: '100%' }} value={checkIn} min={todayStr()} onChange={e => setCheckIn(e.target.value)} />
              </div>
              <div>
                <label className="section-label">Check-Out Date</label>
                <input type="date" className="form-input" style={{ width: '100%' }} value={checkOut} min={checkIn ? addDays(checkIn, 1) : todayStr()} onChange={e => setCheckOut(e.target.value)} />
              </div>
            </div>

            {stayDays > 0 && (
              <div className="text-sm" style={{ marginBottom: 12, color: '#a5b4fc' }}>
                Stay Duration: <strong>{stayDays} day{stayDays !== 1 ? 's' : ''}</strong> — Rate: $3.50/day — Total: <strong>${stayTotal.toFixed(2)}</strong>
              </div>
            )}

            <button className="btn btn-primary" onClick={handleGetQuote} disabled={loading || !checkIn || !checkOut || stayDays < 1}>
              {loading ? 'Getting Quote…' : 'Get Quote'}
            </button>

            {/* Quote card */}
            {quote && (
              <div style={{ marginTop: 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '14px 16px' }}>
                {quote.existingPolicyWarning && (
                  <div className="alert alert-warning" style={{ marginBottom: 10 }}>
                    {quote.existingPolicyWarning}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Daily Premium',    value: `$${quote.dailyPremium?.toFixed(2) ?? stayTotal > 0 ? DAILY_RATE.toFixed(2) : '—'}` },
                    { label: 'Total Days',        value: quote.totalDays ?? stayDays },
                    { label: 'Total Premium',     value: `$${quote.totalPremium?.toFixed(2) ?? stayTotal.toFixed(2)}` },
                    { label: 'Coverage Cap',      value: quote.coverageCap ? `$${quote.coverageCap.toLocaleString()}` : '$5,000' },
                    { label: 'Deductible',        value: '$0' },
                    { label: 'Reimbursement',     value: '100%' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="text-muted" style={{ fontSize: 11 }}>{item.label}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={addProtection} onChange={e => setAddProtection(e.target.checked)} />
                  <span className="text-sm">
                    Add Stay Protection for {quote.totalDays ?? stayDays} day{stayDays !== 1 ? 's' : ''} — ${(quote.totalPremium ?? stayTotal).toFixed(2)}
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Section B — Owner */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">Owner Information</div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'First Name', value: firstName, setter: setFirstName },
                { label: 'Last Name',  value: lastName,  setter: setLastName },
                { label: 'Email',      value: email,     setter: setEmail },
                { label: 'Phone',      value: phone,     setter: setPhone },
              ].map(field => (
                <div key={field.label}>
                  <label className="section-label">{field.label}</label>
                  <input className="form-input" style={{ width: '100%' }} value={field.value} onChange={e => field.setter(e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section C — Pet */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">Pet Information</div>
          <div className="card-body">
            {/* Link to existing policy toggle */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={linkPetEnabled} onChange={e => setLinkPetEnabled(e.target.checked)} />
                <span className="text-sm">Link to Existing PetLife Policy</span>
              </label>
              {linkPetEnabled && (
                <div style={{ marginTop: 8 }}>
                  <select className="form-input" style={{ width: '100%', maxWidth: 340 }} value={linkPetId} onChange={e => setLinkPetId(e.target.value)}>
                    <option value="">— Select Pet from Policies —</option>
                    {pets.map(p => (
                      <option key={petId(p)} value={petId(p)}>{petOptionLabel(p)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label className="section-label">Pet Name</label>
                <input className="form-input" style={{ width: '100%' }} value={petName} onChange={e => setPetName(e.target.value)} />
              </div>
              <div>
                <label className="section-label">Species</label>
                <select className="form-input" style={{ width: '100%' }} value={petSpecies} onChange={e => setPetSpecies(e.target.value)}>
                  <option value="Canine">Canine</option>
                  <option value="Feline">Feline</option>
                </select>
              </div>
              <div>
                <label className="section-label">Breed</label>
                <input className="form-input" style={{ width: '100%' }} value={petBreed} onChange={e => setPetBreed(e.target.value)} />
              </div>
              <div>
                <label className="section-label">Age (years)</label>
                <input type="number" min="0" className="form-input" style={{ width: '100%' }} value={petAge} onChange={e => setPetAge(e.target.value)} />
              </div>
              <div>
                <label className="section-label">Microchip ID (optional)</label>
                <input className="form-input" style={{ width: '100%' }} value={microchipId} onChange={e => setMicrochipId(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            className="btn btn-primary"
            onClick={handleBind}
            disabled={loading || !addProtection || !quote || !facilityId || !checkIn || !checkOut}
          >
            {loading ? 'Confirming…' : 'Confirm Booking'}
          </button>
          <button className="btn btn-outline" onClick={handleResetStay}>Reset</button>
        </div>

        {/* Binder confirmation */}
        {b && (
          <div className="result-card">
            <div className="result-header" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '8px 8px 0 0', padding: '14px 18px', fontWeight: 700, fontSize: 15 }}>
              Stay Protection Bound Successfully
            </div>
            <div className="result-body">
              <div style={{ marginBottom: 14 }}>
                <div className="section-label">Policy Number</div>
                <span className="font-mono" style={{ background: 'rgba(16,185,129,0.12)', padding: '3px 12px', borderRadius: 5, fontSize: 14, display: 'inline-block' }}>
                  {b.policyNumber || b.microPolicyNumber || '—'}
                </span>
              </div>

              {(b.coverageStartDate || b.coverageEndDate) && (
                <div style={{ marginBottom: 14 }}>
                  <div className="section-label">Coverage Term</div>
                  <div className="text-sm">{b.coverageStartDate} → {b.coverageEndDate}</div>
                </div>
              )}

              {b.coverageLimits && (
                <div style={{ marginBottom: 14 }}>
                  <div className="section-label">Coverage Limits</div>
                  <table className="data-table" style={{ width: '100%' }}>
                    <tbody>
                      {Object.entries(b.coverageLimits).map(([k, v]) => (
                        <tr key={k}>
                          <td className="text-muted text-sm">{k.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{typeof v === 'number' ? `$${v.toLocaleString()}` : String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <a
                  href={`/api/hotel/stay-protection/policy-pdf?policyNumber=${b.policyNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Download Policy PDF
                </a>
              </div>

              {phone && (
                <div className="text-sm text-muted">
                  SMS confirmation sent to {phone}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderIncident() {
    const r = incidentResult;
    const coverage = r?.coverageStatus;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: r ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Left — Form */}
        <div className="card">
          <div className="card-header">Incident Report Form</div>
          <div className="card-body">
            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Select Pet</label>
              <select className="form-input" style={{ width: '100%' }} value={incidentPetId} onChange={e => setIncidentPetId(e.target.value)}>
                <option value="">— Select a Pet —</option>
                {pets.map(p => (
                  <option key={petId(p)} value={petId(p)}>{petOptionLabel(p)}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Incident Type</label>
              <select className="form-input" style={{ width: '100%' }} value={incidentType} onChange={e => setIncidentType(e.target.value)}>
                <option value="ILLNESS">Illness</option>
                <option value="INJURY">Injury</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Symptoms / Description</label>
              <textarea
                className="form-input"
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                value={symptomsDesc}
                onChange={e => setSymptomsDesc(e.target.value)}
                placeholder="Describe symptoms or incident (min 10 characters)…"
              />
              {symptomsDesc.length > 0 && symptomsDesc.length < 10 && (
                <div className="text-sm" style={{ color: '#ef4444', marginTop: 4 }}>Minimum 10 characters required.</div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Incident Date &amp; Time</label>
              <input type="datetime-local" className="form-input" style={{ width: '100%' }} value={incidentDatetime} onChange={e => setIncidentDatetime(e.target.value)} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Reported By (Staff ID)</label>
              <input className="form-input" style={{ width: '100%' }} value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="e.g. STAFF-007" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="section-label">Facility</label>
              <select className="form-input" style={{ width: '100%' }} value={incidentFacilityId} onChange={e => setIncidentFacilityId(e.target.value)}>
                <option value="">— Select Facility —</option>
                {HOTEL_FACILITIES.map(f => (
                  <option key={f.facilityId} value={f.facilityId}>{f.name}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleIncidentSubmit}
              disabled={loading || !incidentPetId || symptomsDesc.length < 10}
              style={{ background: '#ef4444', borderColor: '#ef4444' }}
            >
              {loading ? 'Submitting…' : 'Submit Incident Report'}
            </button>
          </div>
        </div>

        {/* Right — Response panel */}
        {r && (
          <div>
            {/* Incident ref */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-body" style={{ padding: '12px 16px' }}>
                <div className="text-muted text-sm">Incident Reference</div>
                <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                  {r.incidentRef || r.incidentReferenceNumber || '—'}
                </div>
              </div>
            </div>

            {/* Coverage status */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-header">Coverage Status</div>
              <div className="card-body">
                {r.coverageStatus === 'FULL_POLICY' && (
                  <div>
                    <span className="badge badge-success">Full Policy Coverage</span>
                    {r.preAuth?.deductibleRemaining != null && (
                      <div className="text-sm" style={{ marginTop: 8 }}><span className="text-muted">Deductible Remaining:</span> ${r.preAuth.deductibleRemaining}</div>
                    )}
                  </div>
                )}
                {r.coverageStatus === 'STAY_PROTECTION' && (
                  <div>
                    <span className="badge badge-warning">Stay Protection Coverage</span>
                  </div>
                )}
                {(!r.coverageStatus || r.coverageStatus === 'NONE') && (
                  <div>
                    <span className="badge badge-muted">No Active Coverage</span>
                    <div className="text-sm text-muted" style={{ marginTop: 6 }}>Direct payment required.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pre-auth */}
            {r.preAuth && r.coverageStatus !== 'NONE' && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="card-header">Pre-Authorization</div>
                <div className="card-body">
                  <div className="text-sm">
                    <div><span className="text-muted">Auth Ref:</span> <span className="font-mono">{r.preAuth.preAuthRef}</span></div>
                    <div><span className="text-muted">Pre-Approved Amount:</span> <strong>${r.preAuth.preApprovedAmount ?? 500}</strong></div>
                    {r.preAuth.coveredServices && (
                      <div style={{ marginTop: 4 }}><span className="text-muted">Covers:</span> {r.preAuth.coveredServices.join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Nearest vet */}
            {r.nearestVet && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="card-header">Dispatched Vet Facility</div>
                <div className="card-body text-sm">
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.nearestVet.name}</div>
                  <div className="text-muted">{r.nearestVet.address}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className="text-muted">Phone:</span> {r.nearestVet.phone}
                    &nbsp;·&nbsp;
                    <span className="badge badge-success" style={{ fontSize: 11 }}>In-Network</span>
                  </div>
                  {r.nearestVet.estimatedTransportMinutes != null && (
                    <div className="text-muted" style={{ marginTop: 4 }}>Est. transport: {r.nearestVet.estimatedTransportMinutes} min</div>
                  )}
                </div>
              </div>
            )}

            {/* Owner notification */}
            {r.notification && r.notification.smsStatus === 'DISPATCHED' && (
              <div className="text-sm text-muted" style={{ marginBottom: 12 }}>
                SMS + Email notifications dispatched to owner.
              </div>
            )}

            {/* Loyalty action banner */}
            {r.preAuth?.loyaltyAction === 'BOARDING_FEE_WAIVED' && (
              <div className="alert alert-warning">
                Boarding fee for today waived. Insurance co-pay waiver applied.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderLoyalty() {
    const summary = loyaltySummaryByPet();

    return (
      <div>
        {/* Summary cards */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Loyalty Summary by Pet</div>
          {summary.length === 0 ? (
            <div className="text-muted text-sm">No loyalty data yet. Fire an event below to get started.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {summary.map(s => {
                const pet = pets.find(p => petId(p) === s.petId);
                const displayName = pet ? (pet.petName || pet.name || s.petId) : s.petId;
                return (
                  <div key={s.petId} className="card">
                    <div className="card-body">
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>{displayName}</div>
                      <div className="text-sm"><span className="text-muted">Deductible Credits:</span> <strong>${s.credits.toFixed(2)}</strong></div>
                      <div className="text-sm"><span className="text-muted">Boarding Discount:</span> <strong>{s.discountPct}%</strong></div>
                      {s.lastExpiry && (
                        <div className="text-sm text-muted" style={{ marginTop: 4 }}>Next Expiry: {s.lastExpiry}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log table */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">Loyalty Event Log</div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pet</th>
                  <th>Event Type</th>
                  <th>Reward</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loyaltyLog.length === 0 && (
                  <tr><td colSpan={5} className="text-muted text-sm" style={{ textAlign: 'center', padding: 16 }}>No loyalty events recorded.</td></tr>
                )}
                {loyaltyLog.map((entry, i) => {
                  const pet = pets.find(p => petId(p) === entry.petId);
                  const displayName = pet ? (pet.petName || pet.name || entry.petId) : entry.petId;
                  return (
                    <tr key={i}>
                      <td className="text-sm">{(entry.appliedAt || entry.date || entry.createdAt || '').slice(0, 10) || '—'}</td>
                      <td className="text-sm">{displayName}</td>
                      <td className="text-sm">{EVENT_TYPE_LABELS[entry.eventType] || entry.eventType}</td>
                      <td className="text-sm">
                        {entry.rewardValue != null ? String(entry.rewardValue) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${entry.status === 'APPLIED' ? 'badge-success' : entry.status === 'PENDING' ? 'badge-warning' : 'badge-muted'}`} style={{ fontSize: 11 }}>
                          {entry.status || 'APPLIED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simulate event */}
        <div className="card">
          <div className="card-header">Simulate Loyalty Event</div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
              <div>
                <label className="section-label">Select Pet</label>
                <select className="form-input" value={simPetId} onChange={e => setSimPetId(e.target.value)} style={{ minWidth: 200 }}>
                  <option value="">— Select a Pet —</option>
                  {pets.map(p => (
                    <option key={petId(p)} value={petId(p)}>{petOptionLabel(p)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="section-label">Event Type</label>
                <select className="form-input" value={simEventType} onChange={e => setSimEventType(e.target.value)} style={{ minWidth: 220 }}>
                  {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleSimEvent} disabled={loading || !simPetId}>
                {loading ? 'Firing…' : 'Fire Event'}
              </button>
            </div>

            {simResult && (
              <div className={simResult.success ? 'alert' : 'alert alert-danger'} style={simResult.success ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981' } : {}}>
                {simResult.success ? 'Loyalty event applied successfully.' : simResult.message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>PetHotel Portal</h1>
        <div className="text-muted text-sm" style={{ marginTop: 4 }}>Hospitality Network Integration</div>
      </div>

      {/* Global error */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab.id ? '#6366f1' : 'var(--color-text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.15s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'health'   && renderHealthPass()}
      {activeTab === 'stay'     && renderStayProtection()}
      {activeTab === 'incident' && renderIncident()}
      {activeTab === 'loyalty'  && renderLoyalty()}
    </div>
  );
}
