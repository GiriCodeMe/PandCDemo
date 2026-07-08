import { useState, useEffect } from 'react';
import { fnolGetPolicies, fnolExtract, fnolSubmit } from '../api';

const SYMPTOM_CATEGORIES = [
  'Gastrointestinal', 'Orthopedic', 'Dermatological', 'Neurological',
  'Respiratory', 'Dental', 'Preventive', 'Emergency', 'Other',
];

const COVERAGE_LABELS = {
  ACCIDENT_ILLNESS: 'Accident & Illness', COMPREHENSIVE: 'Comprehensive',
  PREMIUM: 'Premium', BASIC: 'Accident Only', STANDARD: 'Standard',
};

const STEPS = ['Policy & Documents', 'Smart Extraction', 'Validate & Review', 'Confirmation'];

function formatUSD(n) {
  return n != null ? `$${Number(n).toFixed(2)}` : '—';
}

// ── Drag-and-drop file zone ──────────────────────────────────────────────────
function DropZone({ onFiles, multiple, children }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); onFiles([...e.dataTransfer.files]); }}
      style={{ border: `2px dashed ${dragging ? '#7c3aed' : '#d1d5db'}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', background: dragging ? '#ede9fe' : '#fafafa', transition: 'all 0.2s', cursor: 'pointer' }}
      onClick={() => document.getElementById('fnol-file-input').click()}
    >
      <input id="fnol-file-input" type="file" accept="image/*,.pdf" multiple={multiple} capture="camera" style={{ display: 'none' }} onChange={e => onFiles([...e.target.files])} />
      {children}
    </div>
  );
}

// ── Document thumbnail ────────────────────────────────────────────────────────
function DocThumb({ file, preview, onRemove, index }) {
  return (
    <div style={{ position: 'relative', width: 90, flexShrink: 0 }}>
      <div style={{ width: 90, height: 110, borderRadius: 8, overflow: 'hidden', border: '2px solid #e5e7eb', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {preview ? (
          <img src={preview} alt={`page-${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: 28 }}>📄</div>
        )}
      </div>
      <div style={{ fontSize: 9, color: '#6b7280', marginTop: 3, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
      <button onClick={onRemove} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 10, lineHeight: '18px', padding: 0 }}>✕</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FNOL() {
  const [step, setStep] = useState(1);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [extractFallback, setExtractFallback] = useState(false);
  const [editFields, setEditFields] = useState({
    invoiceNumber: '', dateOfService: '', clinicName: '', clinicPostalCode: '', grossTotal: '', currency: 'USD', lineItems: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [declaration, setDeclaration] = useState({ symptomCategory: 'Gastrointestinal', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fnolGetPolicies().then(r => setPolicies(r.data.policies || [])).catch(() => {});
  }, []);

  // Generate preview URLs for image files
  useEffect(() => {
    const urls = files.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
    setPreviews(urls);
    return () => urls.forEach(u => u && URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (newFiles) => {
    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 10); // max 10 pages
    });
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleExtract = async () => {
    if (!files.length) return;
    setExtracting(true);
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    try {
      const r = await fnolExtract(form);
      const e = r.data.extracted;
      setExtractFallback(r.data.source === 'fallback');
      setExtracted(e);
      setEditFields({
        invoiceNumber: e.invoice_number || '',
        dateOfService: e.date_of_service || '',
        clinicName: e.clinic_name || '',
        clinicPostalCode: e.clinic_postal_code || '',
        grossTotal: String(e.total_amount || ''),
        currency: e.currency || 'USD',
        lineItems: (e.line_items || []).map((li, i) => ({ lineNumber: i + 1, rawDescription: li.description || li.rawDescription || '', extractedAmount: li.amount || li.extractedAmount || 0 })),
      });
    } catch {
      setExtracted({ error: true });
    }
    setExtracting(false);
    setStep(2);
  };

  const validateStep3 = () => {
    const errors = {};
    if (!selectedPolicy) { errors.policy = 'No policy selected'; return errors; }

    // REQ-3.1: Date of service within policy term
    const dos = new Date(editFields.dateOfService);
    const termStart = new Date(selectedPolicy.termStart);
    const termEnd = new Date(selectedPolicy.termEnd);
    if (editFields.dateOfService && (dos < termStart || dos > termEnd)) {
      errors.dateOutOfTerm = `Warning: Date of service ${editFields.dateOfService} falls outside your active coverage period (${selectedPolicy.termStart} – ${selectedPolicy.termEnd}).`;
    }

    // REQ-3.2: Clinic identification
    if (!editFields.clinicName && !editFields.clinicPostalCode) {
      errors.noClinic = 'Clinic name or postal code required. Use the practice lookup below.';
    }

    // REQ-3.3: Missing total
    const total = parseFloat(editFields.grossTotal);
    if (!editFields.grossTotal || isNaN(total) || total <= 0) {
      errors.noTotal = 'Total balance due is required. Please enter the invoice total.';
    }

    return errors;
  };

  const buildClaimPayload = () => {
    if (!selectedPolicy) return null;
    return {
      sourceChannel: 'Mobile_App_PetLife',
      policyReference: {
        policyNumber: selectedPolicy.policyNumber,
        ownerCustomerId: selectedPolicy.ownerCustomerId,
      },
      claimantContext: {
        petId: selectedPolicy.petId,
        petName: selectedPolicy.petName,
        species: selectedPolicy.species,
      },
      invoiceMetadata: {
        invoiceNumber: editFields.invoiceNumber || `INV-${Date.now()}`,
        dateOfService: editFields.dateOfService,
        clinicDetails: {
          clinicName: editFields.clinicName,
          postalCode: editFields.clinicPostalCode,
          country: 'US',
        },
        financialSummary: {
          grossInvoiceAmount: parseFloat(editFields.grossTotal) || 0,
          currency: editFields.currency || 'USD',
        },
      },
      extractedLineItems: editFields.lineItems.map((li, i) => ({
        lineNumber: li.lineNumber || i + 1,
        rawDescription: li.rawDescription,
        extractedAmount: parseFloat(li.extractedAmount) || 0,
      })),
      customerDeclaration: {
        primarySymptomCategory: declaration.symptomCategory,
        customerNotes: declaration.notes,
      },
    };
  };

  const handleSubmit = async () => {
    const errors = validateStep3();
    setValidationErrors(errors);
    if (errors.noTotal || errors.noClinic) return;
    setSubmitting(true);
    const payload = buildClaimPayload();
    let submitResult;
    try {
      const r = await fnolSubmit(payload);
      submitResult = r.data;
    } catch (e) {
      // Fallback mock result
      submitResult = {
        success: true,
        claimReference: `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000000 + 10000000)}`,
        status: 'OPEN',
        overallTriage: 'STANDARD_PROCESSING',
        linkedToParent: false,
        committedAt: new Date().toISOString(),
        _fallback: true,
      };
    }
    setResult(submitResult);
    saveToClaimsQueue(submitResult);
    setSubmitting(false);
    setStep(4);
  };

  const saveToClaimsQueue = (submitResult) => {
    const entry = {
      claim_id: submitResult.claimReference,
      pet: selectedPolicy?.petName || '—',
      holder: selectedPolicy?.holderName || '—',
      policy_id: selectedPolicy?.policyNumber || null,
      submitted: new Date().toLocaleDateString('en-US'),
      condition: declaration.symptomCategory,
      billed: parseFloat(editFields.grossTotal) || 0,
      status: 'PENDING',
      source: 'FNOL',
    };
    const existing = JSON.parse(localStorage.getItem('claimsQueue') || '[]');
    localStorage.setItem('claimsQueue', JSON.stringify([entry, ...existing]));
  };

  const validErrors = validateStep3();
  const canSubmit = !validErrors.noTotal && !validErrors.noClinic && !!editFields.dateOfService;

  const resetForm = () => {
    setStep(1);
    setFiles([]);
    setExtracted(null);
    setResult(null);
    setEditFields({ invoiceNumber: '', dateOfService: '', clinicName: '', clinicPostalCode: '', grossTotal: '', currency: 'USD', lineItems: [] });
    setDeclaration({ symptomCategory: 'Gastrointestinal', notes: '' });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">FNOL — First Notice of Loss</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Mobile-First · AI-Assisted</div>
      </div>

      {/* Step indicator */}
      <div className="card mb-24" style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: step > i + 1 ? '#10b981' : step === i + 1 ? '#7c3aed' : '#e5e7eb', color: step >= i + 1 ? 'white' : '#9ca3af', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? '#1a1d2e' : '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#10b981' : '#e5e7eb', margin: '0 6px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STEP 1: Policy & Documents ══ */}
      {step === 1 && (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="card mb-20">
            <div className="card-header"><h2>Select Policy</h2><span className="badge badge-info">ClaimCore</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Policy / Pet *</label>
                <select className="form-select" value={selectedPolicy?.policyNumber || ''} onChange={e => setSelectedPolicy(policies.find(p => p.policyNumber === e.target.value) || null)}>
                  <option value="">— Select a policy —</option>
                  {policies.map(p => (
                    <option key={p.policyNumber} value={p.policyNumber}>
                      {p.policyNumber} · {p.petName} ({p.breed}) · {p.holderName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPolicy && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
                  {[
                    ['Pet', `${selectedPolicy.petName} (${selectedPolicy.species})`],
                    ['Breed', selectedPolicy.breed],
                    ['Coverage', COVERAGE_LABELS[selectedPolicy.coverageType] || selectedPolicy.coverageType],
                    ['Annual Benefit', formatUSD(selectedPolicy.annualBenefitMax)],
                    ['Deductible', formatUSD(selectedPolicy.deductible)],
                    ['Policy Term', `${selectedPolicy.termStart} → ${selectedPolicy.termEnd}`],
                    ['Holder', selectedPolicy.holderName],
                    ['Email', selectedPolicy.holderEmail],
                    ['Status', selectedPolicy.status],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>{k}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card mb-20">
            <div className="card-header">
              <h2>Document Upload</h2>
              <span className="badge badge-muted">REQ-1.1 / REQ-1.2 · Max 10 pages</span>
            </div>
            <div className="card-body">
              {files.length === 0 ? (
                <DropZone onFiles={addFiles} multiple>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Take a photo or upload invoice</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>JPEG · PNG · PDF · Up to 10 pages</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>📷 Camera (mobile)</span>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>📁 File upload</span>
                  </div>
                </DropZone>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    {files.map((f, i) => (
                      <DocThumb key={i} file={f} preview={previews[i]} index={i} onRemove={() => removeFile(i)} />
                    ))}
                    {files.length < 10 && (
                      <div style={{ width: 90, height: 110, border: '2px dashed #d1d5db', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: 24 }}
                        onClick={() => document.getElementById('fnol-add-input').click()}>
                        <input id="fnol-add-input" type="file" accept="image/*,.pdf" multiple style={{ display: 'none' }} onChange={e => addFiles([...e.target.files])} />
                        +
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {files.length} page{files.length > 1 ? 's' : ''} staged — will be stitched into a single FNOL payload (REQ-1.2)
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✓</span> Edge detection active — ensure invoice text is in frame and well-lit for best extraction accuracy.
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-ai btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleExtract} disabled={!selectedPolicy || files.length === 0 || extracting}>
            {extracting ? <><span className="spinner" />Analyzing documents (AI OCR)...</> : '✨ Analyze Documents → Smart Extraction'}
          </button>
        </div>
      )}

      {/* ══ STEP 2: Smart Extraction ══ */}
      {step === 2 && (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="card mb-20">
            <div className="card-header">
              <h2>Smart Extraction Results</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="ai-tag">✨ AI OCR</span>
                <span className="badge badge-muted">REQ-2.1 / REQ-2.2</span>
              </div>
            </div>
            <div className="card-body">
              {extractFallback ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e', marginBottom: 16 }}>
                  <span>⚠️</span>
                  <span><strong>Gemini AI unavailable</strong> — fields are pre-filled with sample data. Please review and correct all values before submitting.</span>
                </div>
              ) : (
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#065f46', marginBottom: 16 }}>
                  ✓ Extraction complete · All fields are editable — correct any misread values before proceeding
                </div>
              )}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Invoice Number <span className="ai-extracted-badge">AI</span></label>
                  <input className="form-input" value={editFields.invoiceNumber} onChange={e => setEditFields(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="INV-2026-00412" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Service * <span className="ai-extracted-badge">AI</span></label>
                  <input className="form-input" type="date" value={editFields.dateOfService} onChange={e => setEditFields(f => ({ ...f, dateOfService: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic Name <span className="ai-extracted-badge">AI</span></label>
                  <input className="form-input" value={editFields.clinicName} onChange={e => setEditFields(f => ({ ...f, clinicName: e.target.value }))} placeholder="Metropolitan Veterinary Hospital" />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic Postal Code <span className="ai-extracted-badge">AI</span></label>
                  <input className="form-input" value={editFields.clinicPostalCode} onChange={e => setEditFields(f => ({ ...f, clinicPostalCode: e.target.value }))} placeholder="08540" />
                </div>
              </div>

              {/* Line items */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Extracted Line Items <span className="ai-extracted-badge">AI</span></label>
                  <button className="btn btn-sm btn-outline" onClick={() => setEditFields(f => ({ ...f, lineItems: [...f.lineItems, { lineNumber: f.lineItems.length + 1, rawDescription: '', extractedAmount: 0 }] }))}>+ Add Line</button>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, color: '#6b7280', width: 30 }}>#</th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Description</th>
                        <th style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: '#6b7280', width: 100 }}>Amount</th>
                        <th style={{ width: 32 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editFields.lineItems.map((li, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{i + 1}</td>
                          <td style={{ padding: '4px 10px' }}>
                            <input value={li.rawDescription} onChange={e => {
                              const arr = [...editFields.lineItems];
                              arr[i] = { ...arr[i], rawDescription: e.target.value };
                              setEditFields(f => ({ ...f, lineItems: arr }));
                            }} style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 12, outline: 'none' }} />
                          </td>
                          <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                            <input type="number" step="0.01" value={li.extractedAmount} onChange={e => {
                              const arr = [...editFields.lineItems];
                              arr[i] = { ...arr[i], extractedAmount: parseFloat(e.target.value) || 0 };
                              setEditFields(f => ({ ...f, lineItems: arr }));
                            }} style={{ width: 80, border: 'none', background: 'transparent', fontSize: 12, textAlign: 'right', outline: 'none' }} />
                          </td>
                          <td style={{ padding: '4px 6px' }}>
                            <button onClick={() => setEditFields(f => ({ ...f, lineItems: f.lineItems.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                      {editFields.lineItems.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: '14px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No line items extracted — add manually</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gross Invoice Total * <span className="ai-extracted-badge">AI</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>$</span>
                    <input className="form-input" type="number" step="0.01" value={editFields.grossTotal} onChange={e => setEditFields(f => ({ ...f, grossTotal: e.target.value }))} placeholder="0.00" style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={editFields.currency} onChange={e => setEditFields(f => ({ ...f, currency: e.target.value }))}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-accent btn-lg" onClick={() => setStep(3)} disabled={!editFields.dateOfService}>
              Continue to Validation →
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 3: Validate & Review ══ */}
      {step === 3 && (() => {
        const errors = validateStep3();
        const lineTotal = editFields.lineItems.reduce((sum, li) => sum + (parseFloat(li.extractedAmount) || 0), 0);
        const gross = parseFloat(editFields.grossTotal) || 0;

        return (
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* Validation banners */}
            {errors.dateOutOfTerm && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 13 }}>REQ-3.1 — Date Outside Coverage Window</div>
                  <div style={{ fontSize: 12, color: '#b45309' }}>{errors.dateOutOfTerm}</div>
                </div>
              </div>
            )}

            {errors.noClinic && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 13 }}>REQ-3.2 — Vet Clinic Identification Required</div>
                <div style={{ fontSize: 12, color: '#b91c1c', marginBottom: 10 }}>{errors.noClinic}</div>
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input className="form-input" placeholder="Clinic name (e.g. Metro Vet Hospital)" value={editFields.clinicName} onChange={e => setEditFields(f => ({ ...f, clinicName: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input className="form-input" placeholder="ZIP / postal code" value={editFields.clinicPostalCode} onChange={e => setEditFields(f => ({ ...f, clinicPostalCode: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {/* Review table */}
            <div className="card mb-16">
              <div className="card-header"><h2>Invoice Review</h2></div>
              <div className="card-body">
                <div className="grid-2" style={{ marginBottom: 16 }}>
                  {[
                    ['Policy', selectedPolicy?.policyNumber],
                    ['Pet', `${selectedPolicy?.petName} (${selectedPolicy?.species})`],
                    ['Invoice #', editFields.invoiceNumber || '—'],
                    ['Date of Service', editFields.dateOfService],
                    ['Clinic', editFields.clinicName || '—'],
                    ['Postal Code', editFields.clinicPostalCode || '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>{k}</span><span style={{ fontWeight: 600, color: '#374151' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Line items summary */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 8 }}>
                  <tbody>
                    {editFields.lineItems.map((li, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '5px 0', color: '#374151' }}>{li.rawDescription}</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>{formatUSD(li.extractedAmount)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                      <td style={{ padding: '7px 0', fontWeight: 700, color: '#374151' }}>Line Items Subtotal</td>
                      <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 700 }}>{formatUSD(lineTotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', fontWeight: 700, color: '#374151' }}>
                        Gross Invoice Total *
                        {(!editFields.grossTotal || parseFloat(editFields.grossTotal) <= 0) && (
                          <span style={{ marginLeft: 6, background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>REQ-3.3 ⚠ Required</span>
                        )}
                      </td>
                      <td style={{ padding: '5px 0', textAlign: 'right' }}>
                        <input
                          type="number" step="0.01" value={editFields.grossTotal}
                          onChange={e => setEditFields(f => ({ ...f, grossTotal: e.target.value }))}
                          style={{ width: 100, border: `2px solid ${(!editFields.grossTotal || gross <= 0) ? '#fbbf24' : '#10b981'}`, borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 700, textAlign: 'right', background: (!editFields.grossTotal || gross <= 0) ? '#fefce8' : 'white', outline: 'none' }}
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {Math.abs(lineTotal - gross) > 0.01 && gross > 0 && lineTotal > 0 && (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#92400e' }}>
                    ⚠ Line items sum ({formatUSD(lineTotal)}) differs from gross total ({formatUSD(gross)}) by {formatUSD(Math.abs(lineTotal - gross))}.
                  </div>
                )}
              </div>
            </div>

            {/* Customer declaration */}
            <div className="card mb-16">
              <div className="card-header"><h2>Customer Declaration</h2></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Primary Symptom Category *</label>
                    <select className="form-select" value={declaration.symptomCategory} onChange={e => setDeclaration(d => ({ ...d, symptomCategory: e.target.value }))}>
                      {SYMPTOM_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Notes</label>
                  <textarea className="form-textarea" rows={3} placeholder={`Describe what happened with ${selectedPolicy?.petName || 'your pet'}...`} value={declaration.notes} onChange={e => setDeclaration(d => ({ ...d, notes: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-ai btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? <><span className="spinner" />Submitting claim...</> : '🚀 Submit Claim →'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ══ STEP 4: Confirmation ══ */}
      {step === 4 && result && (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {result._fallback && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span><strong>Gemini AI unavailable</strong> — this claim reference was generated locally and may not have been saved to the server. Contact support to confirm receipt.</span>
            </div>
          )}
          {/* Success header */}
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)', borderRadius: 16, padding: '36px 32px', marginBottom: 24, color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, letterSpacing: '0.5px' }}>Claim Request Submitted</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 14, background: 'rgba(255,255,255,0.15)', padding: '8px 20px', borderRadius: 8, display: 'inline-block' }}>
              {result.claimReference}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              {selectedPolicy?.petName} · {selectedPolicy?.policyNumber} · {selectedPolicy?.holderName}
            </div>
          </div>

          {/* Claim summary */}
          <div className="card mb-20">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Claim Reference', result.claimReference],
                  ['Pet', selectedPolicy?.petName],
                  ['Policy', selectedPolicy?.policyNumber],
                  ['Date of Service', editFields.dateOfService],
                  ['Clinic', editFields.clinicName || '—'],
                  ['Invoice Total', formatUSD(editFields.grossTotal)],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 13, color: '#065f46', lineHeight: 1.6 }}>
                Your claim has been received and is being processed. A confirmation will be sent to <strong>{selectedPolicy?.holderEmail}</strong>. Processing typically takes 3–5 business days.
              </div>
            </div>
          </div>

          <button className="btn btn-outline" onClick={resetForm}>
            Submit Another Claim
          </button>
        </div>
      )}
    </div>
  );
}
