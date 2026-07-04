import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStella } from '../context/StellaContext';
import { claimsApi } from '../services/api';
import styles from './ReportClaimPage.module.css';

const LOSS_TYPES   = ['Property', 'Contents', 'Liability', 'Auto', 'Other'];
const CAUSE_TYPES  = ['Water Damage', 'Fire', 'Roof Damage', 'Wind/Hail', 'Theft', 'Vandalism', 'Other'];

export default function ReportClaimPage() {
  const navigate = useNavigate();
  const { updateContext } = useStella();

  const [form, setForm] = useState({
    policyNumber: '', insuredName: '', phone: '', email: '',
    addrLine1: '', addrLine2: '', city: '', state: '', zip: '',
    dateOfLoss: '', isHomeLivable: true, typeOfLoss: '', causeOfLoss: '', description: ''
  });
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useState(() => { updateContext({ page: 'report-claim', claimId: null, step: null }); }, []);

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  async function handlePolicyBlur() {
    if (!form.policyNumber) return;
    try {
      const data = await claimsApi.prefill(form.policyNumber);
      setForm(prev => ({
        ...prev,
        insuredName: data.insuredName || prev.insuredName,
        phone: data.phone || prev.phone,
        email: data.email || prev.email,
        addrLine1: data.address?.line1 || prev.addrLine1,
        city: data.address?.city || prev.city,
        state: data.address?.state || prev.state,
        zip: data.address?.zip || prev.zip
      }));
    } catch { /* policy not found — that's ok */ }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).map(f => f.name);
    setFiles(prev => [...prev, ...dropped]);
  }

  function handleFileInput(e) {
    const picked = Array.from(e.target.files).map(f => f.name);
    setFiles(prev => [...prev, ...picked]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const claim = await claimsApi.create({
        policyNumber: form.policyNumber,
        insuredName: form.insuredName,
        phone: form.phone,
        email: form.email,
        address: { line1: form.addrLine1, line2: form.addrLine2, city: form.city, state: form.state, zip: form.zip },
        dateOfLoss: form.dateOfLoss,
        isHomeLivable: form.isHomeLivable,
        typeOfLoss: form.typeOfLoss,
        causeOfLoss: form.causeOfLoss,
        description: form.description,
        documents: files
      });
      navigate(`/claims/${claim.id}/review`);
    } catch (err) {
      alert('Failed to submit claim: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    'Enter your policy and contact information.',
    'Provide your property address.',
    'Describe the incident and damage.',
    'Upload supporting documents or photos.',
    'Review your information and submit your claim.'
  ];

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h2 className={styles.sideTitle}>Report a New Claim</h2>
        <p className={styles.sideSubtitle}>Provide your claim details.</p>
        <ol className={styles.stepList}>
          {steps.map((s, i) => <li key={i} className={styles.stepItem}>{s}</li>)}
        </ol>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Section 01 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNum}>01</span>
            <h2>Policyholder Information</h2>
          </div>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Policy Number</label>
              <input className="form-input" value={form.policyNumber} onChange={e => set('policyNumber', e.target.value)} onBlur={handlePolicyBlur} placeholder="2024-001" />
            </div>
            <div className="form-group">
              <label className="form-label">First & Last Name</label>
              <input className="form-input" value={form.insuredName} onChange={e => set('insuredName', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john.smith@example.com" />
            </div>
          </div>
        </section>

        {/* Section 02 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNum}>02</span>
            <h2>Loss Property Address</h2>
          </div>
          <div className={styles.grid2}>
            <div className="form-group" style={{ gridColumn: '1/2' }}>
              <label className="form-label">Address Line 1</label>
              <input className="form-input" value={form.addrLine1} onChange={e => set('addrLine1', e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input className="form-input" value={form.addrLine2} onChange={e => set('addrLine2', e.target.value)} placeholder="Apt, Suite, etc." />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Orlando" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="FL" maxLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input className="form-input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="32801" />
            </div>
          </div>
        </section>

        {/* Section 03 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNum}>03</span>
            <h2>Incident Details</h2>
          </div>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Date of Loss</label>
              <input className="form-input" type="date" value={form.dateOfLoss} onChange={e => set('dateOfLoss', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Is the Home Livable?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radio}>
                  <input type="radio" checked={form.isHomeLivable === true}  onChange={() => set('isHomeLivable', true)} /> Yes
                </label>
                <label className={styles.radio}>
                  <input type="radio" checked={form.isHomeLivable === false} onChange={() => set('isHomeLivable', false)} /> No
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Type of Loss</label>
              <select className="form-input" value={form.typeOfLoss} onChange={e => set('typeOfLoss', e.target.value)}>
                <option value="">Select Option</option>
                {LOSS_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cause of Loss</label>
              <select className="form-input" value={form.causeOfLoss} onChange={e => set('causeOfLoss', e.target.value)}>
                <option value="">Select Option</option>
                {CAUSE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Additional Loss Description</label>
              <textarea
                className="form-input" rows={4}
                value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Briefly describe what happened..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </section>

        {/* Section 04 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNum}>04</span>
            <h2>Documentation &amp; Evidence</h2>
          </div>
          <div className={styles.uploadRow}>
            <div
              className={`${styles.dropzone} ${dragging ? styles.dropzoneDrag : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className={styles.dropIcon}>☁</span>
              <p>Drag and drop files or <label className={styles.browseLink}><input type="file" multiple hidden onChange={handleFileInput} />browse local files</label></p>
              <p className={styles.dropHint}>.JPG, .PDF, .DOCX (MAX 25MB EACH)</p>
            </div>
            <div className={styles.aiTip}>
              <div className="ai-tag" style={{ marginBottom: 8 }}>✦ AI TIP</div>
              <p>Upload high-resolution photos of the damage and speed up initial review by up to two days.</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((f, i) => (
                <div key={i} className={styles.fileItem}>
                  <span className={styles.fileIcon}>📄</span>
                  <span className={styles.fileName}>{f}</span>
                  <button type="button" className={styles.removeFile} onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.formFooter}>
          <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>← Cancel Claim</button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Claim →'}
          </button>
        </div>
      </form>
    </div>
  );
}
