import { useState } from 'react';
import styles from './Steps.module.css';
import IoTSensorModal from '../IoTSensorModal';

export default function Step1ReviewSubmission({ claim }) {
  if (!claim) return null;
  const { fnolNarrative, primaryPeril, initialReserves, contact, address, dateOfLoss, isHomeLivable, typeOfLoss, causeOfLoss, description } = claim;
  const [iotOpen, setIotOpen] = useState(false);

  const iotDoc = (claim.documents || []).find(d => d.type === 'iot');
  const regularDocs = (claim.documents || []).filter(d => d.type !== 'iot');

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.stepTitle}>Review Claim Submission</h1>

      <div className={styles.narrativeCard}>
        <h2 className={styles.narrativeTitle}>FNOL Narrative Overview</h2>
        <p className={styles.narrativeBody}>{fnolNarrative}</p>
        <div className={styles.narrativeMeta}>
          <div className={styles.metaBox}>
            <div className={styles.metaLabel}>PRIMARY PERIL</div>
            <div className={styles.metaValue}>{primaryPeril}</div>
          </div>
          <div className={styles.metaBox}>
            <div className={styles.metaLabel}>INITIAL RESERVES</div>
            <div className={styles.metaValue}>${(initialReserves || 0).toLocaleString()}.00 USD</div>
          </div>
        </div>
      </div>

      <Section num="01" title="Policyholder Information">
        <div className={styles.fieldGrid}>
          <Field label="Policy Number" value={claim.policyNumber} />
          <Field label="First & Last Name" value={claim.insuredName} />
          <Field label="Phone Number" value={contact?.phone} />
          <Field label="Email Address" value={contact?.email} />
        </div>
      </Section>

      <Section num="02" title="Loss Property Address">
        <div className={styles.fieldGrid}>
          <Field label="Address Line 1" value={address?.line1} wide />
          <Field label="Address Line 2" value={address?.line2 || '—'} />
          <Field label="City" value={address?.city} />
          <Field label="State" value={address?.state} />
          <Field label="Zip Code" value={address?.zip} />
        </div>
      </Section>

      <Section num="03" title="Incident Details">
        <div className={styles.fieldGrid}>
          <Field label="Date of Loss" value={dateOfLoss} />
          <Field label="Is the Home Livable?" value={isHomeLivable ? 'Yes' : 'No'} />
          <Field label="Type of Loss" value={typeOfLoss} />
          <Field label="Cause of Loss" value={causeOfLoss} />
          <Field label="Additional Loss Description" value={description} wide />
        </div>
      </Section>

      <Section num="04" title="Documentation & Evidence">
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
              <span className={styles.docSize}>{d.size}</span>
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
              <span className={styles.docSize}>{iotDoc.size}</span>
            </div>
          )}
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

function Field({ label, value, wide }) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{value || '—'}</div>
    </div>
  );
}
