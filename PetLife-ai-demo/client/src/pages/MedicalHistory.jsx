import { useState } from 'react';
import { reviewHistory } from '../api';

const MOCK_RESULT = {
  source: 'mock',
  history_review: {
    policy_inception_date: '2024-01-15',
    review_period: '2023-01-01 to 2024-01-14',
    species: 'canine',
    patient_name: 'Biscuit',
    conditions_identified: [
      {
        condition: 'Hip Dysplasia',
        first_noted_date: '2023-04-10',
        is_pre_existing: true,
        certainty: 'CONFIRMED',
        clinical_evidence: 'Radiograph report 10-Apr-2023 confirming bilateral hip dysplasia. Severity: moderate.',
        policy_impact: 'EXCLUDE',
        icd10_code: 'M16.9',
        snomed_code: '57433007',
      },
      {
        condition: 'Atopic Dermatitis',
        first_noted_date: '2023-09-22',
        is_pre_existing: true,
        certainty: 'PROBABLE',
        clinical_evidence: 'Three visits in 2023 for recurrent pruritus with eosinophilia on CBC. Likely atopic in origin.',
        policy_impact: 'PENDING_REVIEW',
        icd10_code: 'L20',
        snomed_code: '24079001',
      },
      {
        condition: 'Acute Gastroenteritis',
        first_noted_date: '2024-03-05',
        is_pre_existing: false,
        certainty: 'CONFIRMED',
        clinical_evidence: 'Single episode post-policy inception. No prior GI history.',
        policy_impact: 'COVERABLE',
        icd10_code: 'K52.9',
        snomed_code: '10054005',
      },
    ],
    timeline_events: [
      { date: '2023-04-10', event: 'Hip Dysplasia diagnosed — bilateral, moderate severity', type: 'pre_existing', condition: 'Hip Dysplasia' },
      { date: '2023-06-15', event: 'Follow-up radiograph — progression stable', type: 'pre_existing', condition: 'Hip Dysplasia' },
      { date: '2023-09-22', event: 'Pruritus consultation #1 — prescribed antihistamines', type: 'pre_existing', condition: 'Atopic Dermatitis' },
      { date: '2023-11-03', event: 'Pruritus consultation #2 — CBC shows eosinophilia', type: 'pre_existing', condition: 'Atopic Dermatitis' },
      { date: '2024-01-15', event: '🟢 POLICY INCEPTION DATE', type: 'inception', condition: null },
      { date: '2024-03-05', event: 'Acute gastroenteritis — vomiting, diarrhoea, single episode', type: 'normal', condition: 'Acute Gastroenteritis' },
    ],
    pre_existing_summary: '2 pre-existing conditions identified prior to policy inception. Hip Dysplasia confirmed for exclusion. Atopic Dermatitis requires senior review.',
    coverable_conditions: ['Acute Gastroenteritis', 'Vaccinations', 'Parasite prevention'],
    recommended_exclusions: ['Hip Dysplasia (bilateral)', 'Atopic Dermatitis — pending senior review'],
  }
};

const DOT_STYLES = {
  pre_existing: { border: '#ef4444', bg: '#fef2f2' },
  inception:    { border: '#7c3aed', bg: '#f3e8ff' },
  normal:       { border: '#10b981', bg: '#f0fdf4' },
  chronic:      { border: '#f59e0b', bg: '#fffbeb' },
};

const IMPACT_CFG = {
  EXCLUDE:        { cls: 'badge-danger',  label: 'Exclude' },
  PENDING_REVIEW: { cls: 'badge-warning', label: 'Pending Review' },
  COVERABLE:      { cls: 'badge-success', label: 'Coverable' },
};

const CERTAINTY_CFG = {
  CONFIRMED: { cls: 'badge-danger',  label: 'Confirmed' },
  PROBABLE:  { cls: 'badge-warning', label: 'Probable' },
  POSSIBLE:  { cls: 'badge-info',    label: 'Possible' },
};

function FileZone({ file, onFile }) {
  return (
    <label className={`upload-zone ${file ? 'has-file' : ''}`} style={{ cursor: 'pointer' }}>
      <input type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={e => onFile(e.target.files[0])} />
      <div className="upload-icon">{file ? '✅' : '📚'}</div>
      <div className="upload-text">{file ? file.name : 'Upload Medical Records'}</div>
      <div className="upload-hint">{file ? `${(file.size / 1024).toFixed(1)} KB · Click to change` : 'PDF, TXT, or image · Max 25MB'}</div>
    </label>
  );
}

export default function MedicalHistory() {
  const [file, setFile]               = useState(null);
  const [inceptionDate, setInceptionDate] = useState('2024-01-15');
  const [species, setSpecies]         = useState('canine');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState('');

  const handleReview = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const res = await reviewHistory(file, inceptionDate, species);
      setResult(res.data);
    } catch (e) {
      console.warn('History review unavailable, using sample data');
      setResult(MOCK_RESULT);
    } finally { setLoading(false); }
  };

  const hr = result?.history_review;
  const preExisting = hr?.conditions_identified?.filter(c => c.is_pre_existing) || [];
  const newConditions = hr?.conditions_identified?.filter(c => !c.is_pre_existing) || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Longitudinal Medical History Review</div>
            <div className="page-subtitle">AI detection of pre-existing conditions relative to policy inception</div>
          </div>
          <span className="ai-tag">✨ Gemini</span>
        </div>
      </div>

      <div className="ai-panel mb-20">
        <div className="ai-panel-header">
          <span className="ai-panel-icon">📚</span>
          <span className="ai-panel-title">Pre-existing Condition Detection</span>
        </div>
        <p style={{ fontSize: 13, color: '#374151' }}>
          Upload multi-year medical records. Gemini analyses the chronological history against the policy inception date, identifying conditions that existed before coverage began. All findings are mapped to ICD-10 codes with policy impact recommendations.
        </p>
      </div>

      <div className="grid-2-1">
        {/* Input */}
        <div>
          <div className="card mb-20">
            <div className="card-header"><h3>Upload Medical Records</h3></div>
            <div className="card-body">
              <FileZone file={file} onFile={setFile} />
              <div className="alert alert-info mt-16 mb-0" style={{ fontSize: 12 }}>
                💡 Sample: <code>C:\AIBrain\PetLife\Longitudinal_Medical_History_Review\</code>
              </div>
            </div>
          </div>

          <div className="card mb-20">
            <div className="card-header"><h3>Review Parameters</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Policy Inception Date *</label>
                <input type="date" className="form-input" value={inceptionDate} onChange={e => setInceptionDate(e.target.value)} />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Conditions before this date are flagged as pre-existing</div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Patient Species</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['canine', 'feline', 'avian', 'rabbit'].map(s => (
                    <button key={s} onClick={() => setSpecies(s)} className={`btn btn-sm ${species === s ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ai btn-lg" onClick={handleReview} disabled={!file || loading}>
              {loading ? <><span className="spinner" />Reviewing...</> : '✨ Analyse History'}
            </button>
            <button className="btn btn-outline" onClick={() => setResult(MOCK_RESULT)}>Use Sample Data</button>
          </div>
          {loading && <div className="loading-bar mt-8" />}
        </div>

        {/* Legend */}
        <div className="card">
          <div className="card-header"><h3>Timeline Legend</h3></div>
          <div className="card-body">
            {[
              { color: '#ef4444', label: 'Pre-existing condition', desc: 'Occurred before policy inception' },
              { color: '#7c3aed', label: 'Policy inception date', desc: 'Start of coverage' },
              { color: '#10b981', label: 'Coverable event', desc: 'Occurred after inception' },
              { color: '#f59e0b', label: 'Chronic/recurring', desc: 'Ongoing condition' },
            ].map(({ color, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 2, border: `2px solid ${color}` }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{desc}</div>
                </div>
              </div>
            ))}
            <div className="mt-16" style={{ fontSize: 12, color: '#6b7280' }}>
              <strong>Policy Impact Codes:</strong>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-danger">EXCLUDE</span>
                <span className="badge badge-warning">PENDING REVIEW</span>
                <span className="badge badge-success">COVERABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {hr && (
        <div style={{ marginTop: 28 }}>
          <div className="section-label mb-16">History Review Results</div>

          {result?.source === 'mock' && (
            <div className="alert alert-warning mb-16">⚠️ Showing mock results — configure GEMINI_API_KEY for live analysis</div>
          )}

          {/* Summary stats */}
          <div className="grid-3 mb-20">
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Pre-existing</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: preExisting.length > 0 ? '#ef4444' : '#10b981' }}>{preExisting.length}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>condition{preExisting.length !== 1 ? 's' : ''} flagged</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Coverable</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981' }}>{newConditions.length}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>post-inception events</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Review Period</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{hr.review_period?.split(' to ')[0]}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>to {hr.review_period?.split(' to ')[1]}</div>
              </div>
            </div>
          </div>

          <div className="grid-2 mb-20">
            {/* Conditions table */}
            <div className="card">
              <div className="card-header"><h2>Identified Conditions</h2></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hr.conditions_identified?.map((c, i) => {
                  const imp = IMPACT_CFG[c.policy_impact] || { cls: 'badge-muted', label: c.policy_impact };
                  const cer = CERTAINTY_CFG[c.certainty] || { cls: 'badge-muted', label: c.certainty };
                  return (
                    <div key={i} style={{
                      border: `1px solid ${c.is_pre_existing ? '#fca5a5' : '#bbf7d0'}`,
                      borderRadius: 10, padding: '14px 16px',
                      background: c.is_pre_existing ? '#fef2f2' : '#f0fdf4',
                      borderLeft: `4px solid ${c.is_pre_existing ? '#ef4444' : '#10b981'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{c.condition}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className={`badge ${cer.cls}`}>{cer.label}</span>
                          <span className={`badge ${imp.cls}`}>{imp.label}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                        First noted: <strong>{c.first_noted_date}</strong> · {c.is_pre_existing ? '⚠️ BEFORE inception' : '✅ AFTER inception'}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>ICD-10: {c.icd10_code}</span>
                        <span style={{ background: '#faf5ff', color: '#7c3aed', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>SNOMED: {c.snomed_code}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>{c.clinical_evidence}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="card-header"><h2>Medical Timeline</h2></div>
              <div className="card-body">
                <div className="timeline">
                  {hr.timeline_events?.map((e, i) => {
                    const ds = DOT_STYLES[e.type] || DOT_STYLES.normal;
                    return (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" style={{ borderColor: ds.border, background: ds.bg }} />
                        <div className="timeline-date">{e.date}</div>
                        <div className={`timeline-title ${e.type === 'inception' ? '' : ''}`} style={{ color: e.type === 'inception' ? '#7c3aed' : 'inherit', fontWeight: e.type === 'inception' ? 800 : 600 }}>
                          {e.event}
                        </div>
                        {e.condition && <div className="timeline-desc">{e.condition}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card mb-20">
            <div className="card-header"><h3>Underwriting Recommendations</h3></div>
            <div className="card-body">
              <div className="grid-2" style={{ gap: 16 }}>
                <div>
                  <div className="section-label mb-8">Recommended Exclusions</div>
                  {hr.recommended_exclusions?.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fca5a5', marginBottom: 6, fontSize: 13 }}>
                      <span>🚫</span><span>{e}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="section-label mb-8">Coverable Conditions</div>
                  {hr.coverable_conditions?.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 6, fontSize: 13 }}>
                      <span>✅</span><span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ai-panel">
            <div className="ai-panel-header"><span className="ai-panel-icon">✨</span><span className="ai-panel-title">Gemini Summary</span></div>
            <p style={{ fontSize: 13, color: '#374151' }}>{hr.pre_existing_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
