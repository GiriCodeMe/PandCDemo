import { useState } from 'react';
import { verifyBreed } from '../api';

const BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'French Bulldog', 'German Shepherd',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Yorkshire Terrier',
  'Shih Tzu', 'Boxer', 'Doberman Pinscher', 'Border Collie', 'Cocker Spaniel',
  'Maine Coon', 'Persian', 'Bengal', 'Ragdoll', 'Siamese',
  'British Shorthair', 'Russian Blue', 'Scottish Fold', 'Abyssinian', 'Birman',
];

const MOCK_RESULT = {
  source: 'mock',
  verification: {
    declared_breed: 'Labrador Retriever',
    identified_breeds: [
      { breed: 'Labrador Retriever', probability: 0.87, risk_flag: false, notes: 'Classic Labrador features clearly identifiable' },
      { breed: 'Golden Retriever',   probability: 0.10, risk_flag: false, notes: 'Some resemblance, possible mixed heritage' },
    ],
    breed_match: true,
    match_confidence: 0.87,
    risk_level: 'LOW',
    risk_flags: [],
    fraud_indicators: [],
    physical_traits_observed: ['Compact muscular build', 'Short dense coat', 'Otter-type tail', 'Wide head with kind expression', 'Medium-sized floppy ears'],
    breed_health_risks: ['Hip dysplasia predisposition', 'Obesity risk', 'Progressive retinal atrophy'],
    policy_implications: 'Breed confirmed. No misrepresentation detected. Standard underwriting rates apply.',
    recommendation: 'ACCEPT',
  }
};

const HIGH_RISK_MOCK = {
  source: 'mock',
  verification: {
    declared_breed: 'Labrador Retriever',
    identified_breeds: [
      { breed: 'Pit Bull Terrier', probability: 0.72, risk_flag: true, notes: 'Strong physical indicators of Pit Bull type' },
      { breed: 'Labrador Retriever', probability: 0.18, risk_flag: false, notes: 'Minor visual similarity only' },
    ],
    breed_match: false,
    match_confidence: 0.18,
    risk_level: 'HIGH',
    risk_flags: ['Declared breed does not match visual analysis', 'Restricted breed detected — may affect coverage terms'],
    fraud_indicators: ['Significant discrepancy between declared and identified breed'],
    physical_traits_observed: ['Broad blocky head', 'Muscular compact build', 'Short smooth coat', 'Defined jaw structure', 'Characteristic cropped ear appearance'],
    breed_health_risks: ['Inherited cardiac conditions', 'Skin allergies', 'Hip dysplasia'],
    policy_implications: 'MISMATCH DETECTED. Declared breed conflicts with visual identification. Escalate to senior underwriter for review.',
    recommendation: 'REFER',
  }
};

function FileZone({ file, onFile }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (f) => {
    onFile(f);
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  return (
    <label className={`upload-zone ${file ? 'has-file' : ''}`} style={{ cursor: 'pointer', position: 'relative', minHeight: preview ? 220 : 180 }}>
      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => handleFile(e.target.files[0])} />
      {preview ? (
        <img src={preview} alt="Pet preview" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, objectFit: 'contain' }} />
      ) : (
        <>
          <div className="upload-icon">🐾</div>
          <div className="upload-text">Upload Pet Photo</div>
          <div className="upload-hint">JPG, PNG, WebP · Max 25MB</div>
        </>
      )}
      {file && <div className="upload-filename">{file.name}</div>}
    </label>
  );
}

function ConfidenceBar({ value, label }) {
  const tier = value >= 0.75 ? 'high' : value >= 0.40 ? 'medium' : 'low';
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{(value * 100).toFixed(0)}%</span>
      </div>}
      <div className="confidence-bar">
        <div className={`confidence-fill ${tier}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

export default function FraudBreed() {
  const [file, setFile]                 = useState(null);
  const [declaredBreed, setDeclaredBreed] = useState('Labrador Retriever');
  const [policyHolder, setPolicyHolder] = useState('');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState('');

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const res = await verifyBreed(file, declaredBreed, policyHolder);
      setResult(res.data);
    } catch (e) {
      console.warn('Breed verification unavailable, using sample data');
      setResult(MOCK_RESULT);
    } finally { setLoading(false); }
  };

  const vr = result?.verification;
  const riskColor = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
  const recColor = { ACCEPT: '#10b981', REFER: '#f59e0b', REJECT: '#ef4444' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Breed & Fraud Verification</div>
            <div className="page-subtitle">AI vision analysis to verify declared breed against photo evidence</div>
          </div>
          <span className="ai-tag">✨ Gemini Vision</span>
        </div>
      </div>

      <div className="ai-panel mb-20">
        <div className="ai-panel-header">
          <span className="ai-panel-icon">🐾</span>
          <span className="ai-panel-title">Breed Identification & Fraud Detection</span>
        </div>
        <p style={{ fontSize: 13, color: '#374151' }}>
          Upload a photo of the pet. Gemini Vision analyses physical traits to identify the breed, comparing it against the declared breed on the policy. Mismatches, restricted breeds, and fraud indicators are automatically flagged.
        </p>
      </div>

      <div className="grid-2-1">
        {/* Input */}
        <div>
          <div className="card mb-20">
            <div className="card-header"><h3>Photo Upload</h3></div>
            <div className="card-body">
              <FileZone file={file} onFile={setFile} />
              <div className="alert alert-info mt-16 mb-0" style={{ fontSize: 12 }}>
                💡 Sample pet photos: use any pet image from your <code>PetImages</code> folder or PetLife sample PDFs
              </div>
            </div>
          </div>

          <div className="card mb-20">
            <div className="card-header"><h3>Policy Details</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Declared Breed on Policy *</label>
                <select className="form-select" value={declaredBreed} onChange={e => setDeclaredBreed(e.target.value)}>
                  {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Policyholder Name (optional)</label>
                <input className="form-input" placeholder="e.g. Sarah Mitchell" value={policyHolder} onChange={e => setPolicyHolder(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ai btn-lg" onClick={handleVerify} disabled={!file || loading}>
              {loading ? <><span className="spinner" />Analysing...</> : '✨ Verify Breed'}
            </button>
            <button className="btn btn-outline" onClick={() => { setResult(MOCK_RESULT); }}>Match Sample</button>
            <button className="btn btn-outline" style={{ borderColor: '#fca5a5', color: '#dc2626' }} onClick={() => { setResult(HIGH_RISK_MOCK); }}>High-Risk Sample</button>
          </div>
          {loading && <div className="loading-bar mt-8" />}
        </div>

        {/* Tips */}
        <div>
          <div className="card">
            <div className="card-header"><h3>Photo Quality Tips</h3></div>
            <div className="card-body">
              {[
                ['✅', 'Full body visible', 'Both sides of the animal'],
                ['✅', 'Clear face shot', 'Muzzle, ear shape, eye placement'],
                ['✅', 'Good lighting', 'Natural or bright indoor light'],
                ['✅', 'Minimal blur', 'Pet standing or sitting still'],
                ['❌', 'No heavy filters', 'Avoid Instagram filters'],
                ['❌', 'Avoid occlusion', 'No clothing, costumes, or hats'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {vr && (
        <div style={{ marginTop: 28 }}>
          <div className="section-label mb-16">
            Verification Results
            {result?.source === 'mock' && <span title="Sample data — Gemini unavailable" style={{fontSize:13,marginLeft:8,color:'#f59e0b',fontWeight:'normal'}}>⚠️</span>}
          </div>


          <div className="grid-3 mb-20">
            {/* Overall verdict */}
            <div className={`decision-banner ${vr.recommendation === 'ACCEPT' ? 'approve' : vr.recommendation === 'REJECT' ? 'denied' : 'partial'}`}>
              <span className="decision-icon">{vr.recommendation === 'ACCEPT' ? '✅' : vr.recommendation === 'REJECT' ? '❌' : '⚠️'}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>Recommendation</div>
                <div className="decision-title" style={{ color: recColor[vr.recommendation] }}>{vr.recommendation}</div>
                <div className="decision-sub">Breed {vr.breed_match ? 'CONFIRMED' : 'MISMATCH'}</div>
              </div>
            </div>

            {/* Risk level */}
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Risk Level</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: riskColor[vr.risk_level] }}>{vr.risk_level}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {vr.fraud_indicators?.length} fraud indicator{vr.fraud_indicators?.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Match confidence */}
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Match Confidence</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: vr.match_confidence >= 0.75 ? '#10b981' : '#ef4444' }}>
                  {(vr.match_confidence * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Declared: {vr.declared_breed}</div>
              </div>
            </div>
          </div>

          {/* Identified breeds */}
          <div className="card mb-20">
            <div className="card-header"><h2>Breed Identification</h2><span className="badge badge-purple">Vision AI</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vr.identified_breeds?.map((b, i) => (
                <div key={i} style={{ border: `1px solid ${b.risk_flag ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 10, padding: '12px 16px', background: b.risk_flag ? '#fef2f2' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{b.breed}</span>
                      {b.breed === vr.declared_breed && <span className="badge badge-info ml-auto" style={{ marginLeft: 8 }}>Declared</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.risk_flag && <span className="badge badge-danger">⚠️ Risk Flag</span>}
                      <span style={{ fontWeight: 800, color: riskColor[b.probability >= 0.5 ? 'HIGH' : 'LOW'] }}>{(b.probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <ConfidenceBar value={b.probability} />
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{b.notes}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2 mb-20">
            {/* Physical traits */}
            <div className="card">
              <div className="card-header"><h3>Physical Traits Observed</h3></div>
              <div className="card-body">
                {vr.physical_traits_observed?.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span>🔍</span><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breed health risks */}
            <div className="card">
              <div className="card-header"><h3>Breed Health Risks</h3><span className="badge badge-warning">Underwriting</span></div>
              <div className="card-body">
                {vr.breed_health_risks?.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span>⚕️</span><span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flags & Policy implications */}
          {(vr.risk_flags?.length > 0 || vr.fraud_indicators?.length > 0) && (
            <div className="card mb-20">
              <div className="card-header"><h3>⚠️ Flags & Indicators</h3></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...vr.risk_flags, ...vr.fraud_indicators].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fca5a5' }}>
                    <span>🚨</span><span style={{ fontSize: 13 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ai-panel">
            <div className="ai-panel-header"><span className="ai-panel-icon">✨</span><span className="ai-panel-title">Policy Implications</span></div>
            <p style={{ fontSize: 13, color: '#374151' }}>{vr.policy_implications}</p>
          </div>
        </div>
      )}
    </div>
  );
}
