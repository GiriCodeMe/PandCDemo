import { useState, useEffect } from 'react';
import styles from './Steps.module.css';
import IoTSensorModal from '../IoTSensorModal';
import { aiApi } from '../../../services/api';

const VERDICT_COLOR = {
  ADDRESSES_CONSISTENT: '#16a34a',
  MINOR_DISCREPANCY: '#d97706',
  SIGNIFICANT_MISMATCH: '#dc2626',
  CONSISTENT: '#16a34a',
  UNCERTAIN: '#d97706',
  INCONSISTENT: '#dc2626',
  PASS: '#16a34a',
  FLAG: '#d97706',
  FAIL: '#dc2626'
};

const RISK_BG = {
  LOW: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', border: 'rgba(22,163,74,0.3)' },
  MEDIUM: { bg: 'rgba(217,119,6,0.1)', color: '#d97706', border: 'rgba(217,119,6,0.3)' },
  HIGH: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'rgba(220,38,38,0.3)' },
  CRITICAL: { bg: 'rgba(220,38,38,0.15)', color: '#dc2626', border: 'rgba(220,38,38,0.4)' }
};

function RiskChip({ level, label }) {
  const theme = RISK_BG[level] || RISK_BG.LOW;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', background: theme.bg, color: theme.color, border: `1px solid ${theme.border}`, textTransform: 'uppercase' }}>
      {label || level}
    </span>
  );
}

function VerdictBadge({ value, label }) {
  const color = VERDICT_COLOR[value] || '#6b7280';
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '18', border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 8px', letterSpacing: '0.3px' }}>
      {label || value?.replace(/_/g, ' ')}
    </span>
  );
}

function AiLoader({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>
      <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%' }} />
      {label}
    </div>
  );
}

function AiError({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0', color: '#dc2626', fontSize: 13 }}>
      <span>⚠</span>
      {label || 'Backend unavailable — check that the API server is running on port 3001.'}
    </div>
  );
}

function AddressComparePanel({ result }) {
  if (!result) return <AiLoader label="Gemini AI comparing addresses across documents…" />;
  if (result._error) return <AiError />;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <VerdictBadge value={result.overallVerdict} />
        <RiskChip level={result.riskLevel} />
      </div>
      <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.55, marginBottom: 10 }}>{result.summary}</p>

      {(result.comparisons || []).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {result.comparisons.map((c, i) => (
            <div key={i} style={{ background: '#f9fafb', border: `1px solid ${VERDICT_COLOR[c.result] || '#e5e7eb'}50`, borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>📄 {c.source}</span>
                <VerdictBadge value={c.result} />
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{c.explanation}</div>
            </div>
          ))}
        </div>
      )}

      {(result.fraudConcerns || []).length > 0 && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 8, marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: '#d97706', marginBottom: 5 }}>⚠ CONCERNS</div>
          {result.fraudConcerns.map((c, i) => <div key={i} style={{ fontSize: 11, color: '#4b5563', marginBottom: 3 }}>• {c}</div>)}
        </div>
      )}

      {(result.recommendedActions || []).length > 0 && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 8, marginTop: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: '#6366f1', marginBottom: 5 }}>RECOMMENDED ACTIONS</div>
          {result.recommendedActions.map((a, i) => <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 3 }}>→ {a}</div>)}
        </div>
      )}
    </div>
  );
}

function PhotoReviewPanel({ result }) {
  if (!result) return <AiLoader label="Gemini Vision analyzing damage photos…" />;
  if (result._error) return <AiError />;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <VerdictBadge value={result.overallConsistency} label={result.overallConsistency === 'CONSISTENT' ? 'CONSISTENT WITH CLAIM' : result.overallConsistency} />
        <RiskChip level={result.damageSeverity} label={result.damageSeverity + ' SEVERITY'} />
      </div>
      <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.55, marginBottom: 10 }}>{result.consistencyReason}</p>

      {(result.damageZones || []).length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 5 }}>DAMAGE ZONES</div>
          {result.damageZones.map((z, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 5 }}>
              <RiskChip level={z.severity} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{z.zone}</div>
                <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{z.finding}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(result.fraudIndicators || []).length > 0 ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 10px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: '#dc2626', marginBottom: 6 }}>⚠ FRAUD INDICATORS</div>
          {result.fraudIndicators.map((fi, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#991b1b' }}>{fi.indicator}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{fi.recommendation}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#16a34a', marginBottom: 8 }}>✓ No visual fraud indicators detected</div>
      )}

      {(result.nextActions || []).length > 0 && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: '#6366f1', marginBottom: 5 }}>RECOMMENDED ACTIONS</div>
          {result.nextActions.map((a, i) => <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 3 }}>→ {a}</div>)}
        </div>
      )}
    </div>
  );
}

export default function Step2ClaimValidation({ claim }) {
  if (!claim) return null;
  const { coverageVerification: cv, documents, missingDocuments, dataInconsistencies } = claim;
  const [iotOpen, setIotOpen] = useState(false);
  const [addressResult, setAddressResult] = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const [aiLoaded, setAiLoaded] = useState(false);

  const iotDoc = (documents || []).find(d => d.type === 'iot');
  const regularDocs = (documents || []).filter(d => d.type !== 'iot');

  useEffect(() => {
    setAddressResult(null);
    setPhotoResult(null);
    setAiLoaded(false);
    Promise.allSettled([
      aiApi.addressCompare(claim.id),
      aiApi.photoReview(claim.id)
    ]).then(([addrRes, photoRes]) => {
      setAddressResult(addrRes.status === 'fulfilled' ? addrRes.value : { _error: true });
      setPhotoResult(photoRes.status === 'fulfilled' ? photoRes.value : { _error: true });
      setAiLoaded(true);
    });
  }, [claim.id]);

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.stepTitle}>Claim Validation</h1>

      <Section num="01" title="Policy and Coverage Verification">
        <div className={styles.coverageLabel}>POLICY COVERAGE SUMMARY</div>
        <div className={styles.coverageBadges}>
          {(cv?.coverages || []).map(c => <span key={c} className={styles.coverageBadge}>{c}</span>)}
        </div>

        <div className={styles.verifyBox}>
          <div className={styles.verifyRow}>
            <span className={styles.checkIcon}>✓</span>
            <span>AI Policy Verification Complete</span>
          </div>
          <div className={styles.verifyRow}>
            <span className={styles.checkIcon}>✓</span>
            <span>AI Recommendation — Claim is covered under the policy terms</span>
          </div>
          {cv?.rationale && (
            <div className={styles.rationaleBox}>
              <div className={styles.rationaleLabel}>RATIONALE</div>
              <div className={styles.rationaleText}>{cv.rationale}</div>
            </div>
          )}
        </div>
      </Section>

      <Section num="02" title="Document Reviews">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <div>
            <div className={styles.coverageLabel}>UPLOADED DOCUMENTS</div>
            <div className={styles.docList}>
              {regularDocs.length === 0 && !iotDoc
                ? <p className={styles.noDoc}>No documents uploaded.</p>
                : null}

              {regularDocs.map(d => (
                <div
                  key={d.id}
                  className={`${styles.docItem} ${d.url ? styles.docItemClickable : ''}`}
                  onClick={() => d.url && window.open(d.url, '_blank')}
                  title={d.url ? `Open ${d.name}` : undefined}
                >
                  <span className={styles.docIcon}>{d.name.endsWith('.jpg') || d.name.endsWith('.png') ? '🖼' : '📄'}</span>
                  <div>
                    <div className={styles.docName}>
                      {d.name}
                      {d.url && <span className={styles.docOpenHint}> ↗</span>}
                    </div>
                    <div className={styles.docDesc}>{d.description}</div>
                  </div>
                </div>
              ))}

              {iotDoc && (
                <div
                  className={`${styles.docItem} ${styles.docItemIot} ${styles.docItemClickable}`}
                  onClick={() => setIotOpen(true)}
                  title="View IoT Sensor Data"
                >
                  <span className={styles.docIcon}>📡</span>
                  <div>
                    <div className={styles.docName}>
                      {iotDoc.name}
                      <span className={styles.docOpenHint}> ↗</span>
                    </div>
                    <div className={styles.docDesc}>{iotDoc.description}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.insightPanel}>
            <div className={styles.insightHeader}>
              <span className={styles.insightTitle}>✦ Carrier Documents Insight</span>
              <span className={styles.betaBadge}>BETA</span>
            </div>
            {(missingDocuments || []).length > 0 && (
              <div className={styles.missingList}>
                <div className={styles.missingLabel}>⚠ MISSING DOCUMENTS</div>
                {missingDocuments.map(d => <div key={d} className={styles.missingItem}>• {d}</div>)}
              </div>
            )}
            {(dataInconsistencies || []).length > 0 && (
              <div className={styles.inconsistencyBox}>
                <div className={styles.inconsistencyLabel}>⚠ DATA INCONSISTENCY</div>
                {dataInconsistencies.map(d => <div key={d}>{d}</div>)}
              </div>
            )}
            {(missingDocuments || []).length === 0 && (dataInconsistencies || []).length === 0 && (
              <div style={{ color: '#16a34a', fontSize: 13 }}>✓ All documents verified, no inconsistencies found.</div>
            )}
          </div>
        </div>
      </Section>

      <Section num="03" title="AI Factory Analysis — Documents & Photos">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Powered by</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 4, padding: '1px 7px', letterSpacing: '0.3px' }}>Gemini 2.0 Flash</span>
          {!aiLoaded && <span style={{ fontSize: 11, color: '#9ca3af' }}>— running analysis…</span>}
          {aiLoaded && <span style={{ fontSize: 11, color: '#16a34a' }}>✓ Analysis complete</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1d2e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📍</span> Address Comparison
              <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 'auto' }}>CRM / SOR vs Documents</span>
            </div>
            <AddressComparePanel result={addressResult} />
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1d2e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🖼</span> Damage Photo Review
              <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 'auto' }}>Gemini Vision</span>
            </div>
            <PhotoReviewPanel result={photoResult} />
          </div>
        </div>
      </Section>

      {iotOpen && claim.iotSensors && (
        <IoTSensorModal sensors={claim.iotSensors} onClose={() => setIotOpen(false)} />
      )}
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNum}>{num}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
