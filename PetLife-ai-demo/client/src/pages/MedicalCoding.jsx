import { useState } from 'react';
import { codeMedicalNote } from '../api';

const BODY_SYSTEM_COLORS = {
  'Musculoskeletal': '#3b82f6',
  'Cardiovascular':  '#ef4444',
  'Respiratory':     '#0891b2',
  'Digestive':       '#d97706',
  'Neurological':    '#7c3aed',
  'Integumentary':   '#059669',
  'Endocrine':       '#db2777',
  'Urinary':         '#4f46e5',
};

const MOCK_RESULT = {
  source: 'mock',
  coding_result: {
    note_summary: 'Canine patient presenting with 3-day history of lameness on right forelimb. Physical exam reveals soft tissue swelling at the carpus with pain on palpation. Radiographs indicate mild periarticular osteophytosis consistent with early osteoarthritis. Initiated NSAID therapy with recheck in 10 days.',
    primary_diagnosis: 'Osteoarthritis of the carpus (right)',
    species: 'canine',
    coded_findings: [
      { concept: 'Osteoarthritis of Carpus', snomed_code: '396275006', icd10_code: 'M19.031', body_system: 'Musculoskeletal', is_pre_existing: false, confidence_score: 0.97, confidence_tier: 'HIGH', evidence_text: 'periarticular osteophytosis consistent with early osteoarthritis' },
      { concept: 'Lameness — Right Forelimb', snomed_code: '16973004', icd10_code: 'M79.89', body_system: 'Musculoskeletal', is_pre_existing: false, confidence_score: 0.94, confidence_tier: 'HIGH', evidence_text: '3-day history of lameness on right forelimb' },
      { concept: 'NSAID Therapy Initiated', snomed_code: '416940007', icd10_code: 'Z79.899', body_system: 'Musculoskeletal', is_pre_existing: false, confidence_score: 0.89, confidence_tier: 'HIGH', evidence_text: 'Initiated NSAID therapy' },
    ],
    cpt_procedures: [
      { code: '99213', description: 'Office/outpatient visit, established patient, moderate complexity' },
      { code: '74000', description: 'Radiologic examination, abdomen/extremity, minimum 2 views' },
    ],
  }
};

function FileZone({ file, onFile }) {
  return (
    <label className={`upload-zone ${file ? 'has-file' : ''}`} style={{ cursor: 'pointer' }}>
      <input type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={e => onFile(e.target.files[0])} />
      <div className="upload-icon">{file ? '✅' : '📋'}</div>
      <div className="upload-text">{file ? file.name : 'Upload SOAP / Clinical Note'}</div>
      <div className="upload-hint">{file ? `${(file.size / 1024).toFixed(1)} KB · Click to change` : 'PDF, TXT, or image · Max 25MB'}</div>
    </label>
  );
}

function ConfidenceBar({ value }) {
  const tier = value >= 0.85 ? 'high' : value >= 0.60 ? 'medium' : 'low';
  return (
    <div className="confidence-bar mt-4">
      <div className={`confidence-fill ${tier}`} style={{ width: `${value * 100}%` }} />
    </div>
  );
}

export default function MedicalCoding() {
  const [file, setFile]       = useState(null);
  const [species, setSpecies] = useState('canine');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const handleCode = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const res = await codeMedicalNote(file, species);
      setResult(res.data);
    } catch (e) {
      console.warn('Coding unavailable, using sample data');
      setResult(MOCK_RESULT);
    } finally { setLoading(false); }
  };

  const useMock = () => setResult(MOCK_RESULT);

  const cr = result?.coding_result;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Medical Coding Assistant</div>
            <div className="page-subtitle">AI-powered SNOMED-CT & ICD-10 coding from SOAP notes</div>
          </div>
          <span className="ai-tag">✨ Gemini gemini-1.5-pro</span>
        </div>
      </div>

      {/* Info panel */}
      <div className="ai-panel mb-20">
        <div className="ai-panel-header">
          <span className="ai-panel-icon">🔬</span>
          <span className="ai-panel-title">Automated Medical Coding</span>
        </div>
        <p style={{ fontSize: 13, color: '#374151' }}>
          Upload a SOAP note or clinical record. Gemini performs a two-pass coding analysis: first extracting clinical concepts, then mapping each to SNOMED-CT, ICD-10, and CPT procedure codes. Pre-existing conditions are automatically flagged for adjudication.
        </p>
      </div>

      <div className="grid-2-1">
        {/* Input panel */}
        <div>
          <div className="card mb-20">
            <div className="card-header"><h3>Upload Clinical Document</h3></div>
            <div className="card-body">
              <FileZone file={file} onFile={setFile} />
              <div className="alert alert-info mt-16" style={{ marginBottom: 0, fontSize: 12 }}>
                💡 Sample: <code>C:\AIBrain\PetLife\Automated_Medical_Coding\</code>
              </div>
            </div>
          </div>

          <div className="card mb-20">
            <div className="card-header"><h3>Configuration</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Patient Species</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['canine', 'feline', 'avian', 'rabbit', 'equine'].map(s => (
                    <button key={s} onClick={() => setSpecies(s)}
                      className={`btn btn-sm ${species === s ? 'btn-primary' : 'btn-outline'}`}
                      style={{ textTransform: 'capitalize' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ai btn-lg" onClick={handleCode} disabled={!file || loading}>
              {loading ? <><span className="spinner" />Coding...</> : '✨ Run Medical Coding'}
            </button>
            <button className="btn btn-outline" onClick={useMock}>Use Sample Data</button>
          </div>
          {loading && <div className="loading-bar mt-8" />}
        </div>

        {/* Quick ref */}
        <div>
          <div className="card">
            <div className="card-header"><h3>Coding Standards</h3></div>
            <div className="card-body">
              {[
                { code: 'SNOMED-CT', desc: 'Clinical terminology — concepts, findings, procedures', color: '#3b82f6' },
                { code: 'ICD-10',   desc: 'International disease classification codes', color: '#10b981' },
                { code: 'CPT',      desc: 'Current Procedural Terminology for billing', color: '#7c3aed' },
              ].map(c => (
                <div key={c.code} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ background: c.color, color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.code}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{c.desc}</span>
                </div>
              ))}
              <div className="mt-16" style={{ fontSize: 12, color: '#6b7280' }}>
                <strong>Two-pass process:</strong>
                <ol style={{ marginTop: 6, paddingLeft: 16 }}>
                  <li style={{ marginBottom: 4 }}>Extract clinical concepts from free text</li>
                  <li>Map each concept to standard codes with confidence scores</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {cr && (
        <div style={{ marginTop: 28 }}>
          <div className="section-label mb-16">
            Coding Results
            {result?.source === 'mock' && <span title="Sample data — Gemini unavailable" style={{fontSize:13,marginLeft:8,color:'#f59e0b',fontWeight:'normal'}}>⚠️</span>}
          </div>


          {/* Summary */}
          <div className="ai-panel mb-20">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">📋</span>
              <span className="ai-panel-title">Clinical Summary</span>
              <span className={`badge ${cr.species === 'canine' ? 'badge-navy' : 'badge-info'} ml-auto`}>{cr.species}</span>
            </div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{cr.note_summary}</p>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(124,58,237,0.1)', borderRadius: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginRight: 8 }}>PRIMARY DIAGNOSIS:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{cr.primary_diagnosis}</span>
            </div>
          </div>

          {/* Coded findings */}
          <div className="card mb-20">
            <div className="card-header">
              <h2>Coded Findings</h2>
              <span className="badge badge-purple">{cr.coded_findings?.length} concepts mapped</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cr.coded_findings?.map((f, i) => (
                <div key={i} style={{
                  border: `1px solid ${f.is_pre_existing ? '#fca5a5' : '#e5e7eb'}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  background: f.is_pre_existing ? '#fef2f2' : 'white',
                  borderLeft: `4px solid ${BODY_SYSTEM_COLORS[f.body_system] || '#94a3b8'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{f.concept}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {f.is_pre_existing && <span className="badge badge-danger">⚠️ Pre-existing</span>}
                      <span className={`badge ${f.confidence_tier === 'HIGH' ? 'badge-success' : f.confidence_tier === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>{f.confidence_tier}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace' }}>SNOMED {f.snomed_code}</span>
                    <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace' }}>ICD-10 {f.icd10_code}</span>
                    <span style={{ background: '#faf5ff', color: '#7c3aed', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>{f.body_system}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginBottom: 6 }}>"{f.evidence_text}"</div>
                  <ConfidenceBar value={f.confidence_score} />
                  <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', marginTop: 2 }}>{(f.confidence_score * 100).toFixed(0)}% confidence</div>
                </div>
              ))}
            </div>
          </div>

          {/* CPT Procedures */}
          {cr.cpt_procedures?.length > 0 && (
            <div className="card mb-20">
              <div className="card-header"><h3>CPT Procedure Codes</h3><span className="badge badge-navy">Billing</span></div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>CPT Code</th><th>Description</th></tr></thead>
                  <tbody>
                    {cr.cpt_procedures.map((p, i) => (
                      <tr key={i}>
                        <td><span className="td-id">{p.code}</span></td>
                        <td>{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => { const d = JSON.stringify(cr, null, 2); const b = new Blob([d], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'coding-result.json'; a.click(); }}>
              ⬇️ Export JSON
            </button>
            <button className="btn btn-outline" onClick={() => setResult(null)}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
