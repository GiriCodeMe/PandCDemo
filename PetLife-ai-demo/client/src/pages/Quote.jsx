import { useState } from 'react';
import { generateQuote, verifyBreed, reviewHistory } from '../api';

const BREEDS_DOG = ['Labrador Retriever', 'French Bulldog', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Boxer', 'Siberian Husky', 'Great Dane', 'Dobermann', 'Border Collie', 'Shih Tzu', 'Chihuahua', 'Mixed Breed / Other'];
const BREEDS_CAT = ['British Shorthair', 'Persian', 'Maine Coon', 'Ragdoll', 'Siamese', 'Bengal', 'Scottish Fold', 'Russian Blue', 'Birman', 'Burmese', 'Mixed Breed / Other'];

const CONDITIONS = [
  'Skin or ear issues, including signs such as itchiness, chewing/licking skin or paws',
  'Has food allergies or suspected food allergies',
  'Digestive issues, like vomiting, diarrhea, or loss of appetite currently or in the past 6 months',
  'A vet has recommended a dental exam, cleaning or any other dental treatment',
  'Mobility/joint issues like limping, any other leg or back issues, even if not diagnosed currently or in the past 6 months',
  'Changes in urination or water intake, currently or in the past 6 months (even if not diagnosed)',
  'Growths, lumps, or bumps anywhere on or in the body, even if not diagnosed or previously removed',
  'Any other signs, symptoms or concerns you or your veterinarian have, even if not diagnosed',
];

const COVERAGE_TYPES = [
  { id: 'ACCIDENT_ILLNESS', label: 'Accident & Illness', desc: 'Covers accidents and illnesses' },
  { id: 'COMPREHENSIVE',    label: 'Comprehensive',      desc: 'Full coverage including wellness' },
  { id: 'PREMIUM',          label: 'Premium',            desc: 'Enhanced limits and lower deductible' },
  { id: 'BASIC',            label: 'Accident Only',      desc: 'Accidents only — lowest premium' },
];

const COVERAGE_BENCHMARKS = {
  BASIC: {
    deductibles: [100, 250, 500],
    benefits: [2500, 5000, 10000],
    defaultDeductible: 250,
    defaultBenefit: 5000,
    defaultReimbursement: 70,
    reimbursements: [50, 70, 80],
    description: 'Accident-only coverage for sudden injuries. Great starter plan at the lowest monthly cost.',
    features: ['Emergency surgery', 'Broken bones & lacerations', 'Swallowed objects / toxin ingestion', 'Bite wounds & trauma', 'Diagnostic imaging for accidents'],
    notCovered: ['Illnesses & infections', 'Wellness & preventive care', 'Dental disease', 'Pre-existing conditions'],
  },
  ACCIDENT_ILLNESS: {
    deductibles: [200, 250, 500, 750],
    benefits: [5000, 8000, 10000, 15000],
    defaultDeductible: 250,
    defaultBenefit: 5000,
    defaultReimbursement: 80,
    reimbursements: [70, 80, 90],
    description: 'Our most popular plan. Covers accidents and illnesses including cancer, infections, and hereditary conditions.',
    features: ['All accident coverage', 'Illnesses & infections', 'Cancer treatment', 'Hereditary & congenital conditions', 'Diagnostic tests & imaging', 'Specialist visits', 'Emergency & after-hours care'],
    notCovered: ['Routine wellness visits', 'Vaccinations', 'Dental cleanings', 'Pre-existing conditions'],
  },
  COMPREHENSIVE: {
    deductibles: [100, 250, 500],
    benefits: [5000, 10000, 15000, 25000],
    defaultDeductible: 250,
    defaultBenefit: 10000,
    defaultReimbursement: 80,
    reimbursements: [70, 80, 90],
    description: 'Complete coverage including wellness, dental cleanings, and routine preventive care.',
    features: ['All Accident & Illness benefits', 'Annual wellness exam', 'Vaccinations', 'Dental cleanings', 'Flea/tick/heartworm prevention', 'Spay/neuter (if not done)', 'Behavioral therapy'],
    notCovered: ['Pre-existing conditions', 'Cosmetic procedures', 'Breeding costs'],
  },
  PREMIUM: {
    deductibles: [50, 100, 200],
    benefits: [10000, 15000, 25000, 50000],
    defaultDeductible: 100,
    defaultBenefit: 15000,
    defaultReimbursement: 90,
    reimbursements: [80, 90],
    description: 'Elite coverage with highest benefit limits, lowest deductibles, and priority claim processing.',
    features: ['All Comprehensive benefits', 'Unlimited specialist visits', 'Stem cell therapy', 'Acupuncture & rehabilitation', 'Prescription food (when medically necessary)', 'Priority 48-hr claim processing', 'Dedicated account manager'],
    notCovered: ['Pre-existing conditions', 'Breeding / reproductive costs'],
  },
};

const fmtDate = d => { if (!d) return '—'; const p = d.split('-'); return p.length === 3 ? `${p[1]}/${p[2]}/${p[0]}` : d; };

const normalizeHistoryReview = (result) => {
  if (!result) return null;
  const preExisting = result.pre_existing_conditions ||
    (result.conditions_identified || []).filter(c => c.is_pre_existing).map(c => ({ condition: c.condition }));
  return { ...result, pre_existing_conditions: preExisting };
};

function PlanSummary({ data, quoteResult, loading, usedFallback, petImagePreview, breedVerification, historyReview, loadingMsg }) {
  const pet = data.pet || {};
  const coverage = data.coverage || {};
  const age = pet.dob ? Math.floor((Date.now() - new Date(pet.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const isFraudBlocked = breedVerification?.recommendation === 'REJECT';
  const preExistingCount = historyReview?.pre_existing_conditions?.length || 0;
  const bench = COVERAGE_BENCHMARKS[coverage.type] || COVERAGE_BENCHMARKS.ACCIDENT_ILLNESS;

  return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <div className="card-header" style={{ background: '#f8fafc' }}>
        <h3>Your Plan Summary</h3>
        {quoteResult && (
          <span className="ai-tag">
            ✨ AI Quote{usedFallback && <span title="Estimate — Gemini unavailable" style={{ marginLeft: 4, color: '#fbbf24' }}>⚠️</span>}
          </span>
        )}
      </div>
      <div className="card-body" style={{ padding: '16px 20px' }}>
        {pet.name ? (
          <>
            {/* Pet photo or emoji */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              {petImagePreview ? (
                <img
                  src={petImagePreview}
                  alt={pet.name}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '2px solid #e5e7eb', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '2px solid #e5e7eb' }}>
                  {pet.type === 'cat' ? '🐱' : pet.type === 'bird' ? '🐦' : '🐶'}
                </div>
              )}
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{pet.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {pet.breed && `${pet.breed} · `}{age !== null ? `${age} yr` : ''} {pet.sex}
                </div>
                {data.holder?.postcode && <div style={{ fontSize: 12, color: '#9ca3af' }}>{data.holder.postcode}</div>}
              </div>
            </div>

            {/* Breed verification badge */}
            {breedVerification && (
              <div style={{ marginBottom: 8 }}>
                {isFraudBlocked ? (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#991b1b', fontWeight: 600 }}>
                    🚫 Breed mismatch detected — policy blocked
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#065f46', fontWeight: 600 }}>
                    ✅ Breed verified — {breedVerification.declared_breed}
                  </div>
                )}
              </div>
            )}

            {/* Pre-existing badge */}
            {preExistingCount > 0 && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>
                ⚠️ {preExistingCount} pre-existing condition{preExistingCount > 1 ? 's' : ''} — {preExistingCount * 15}% loading applied
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />

            {coverage.type && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px' }}>Coverage</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{COVERAGE_TYPES.find(c => c.id === coverage.type)?.label || coverage.type}</div>
              </div>
            )}
            {coverage.reimbursement && (
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Reimbursement: </span>{coverage.reimbursement}%
              </div>
            )}
            {coverage.deductible && (
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Annual deductible: </span>${coverage.deductible}
              </div>
            )}
            {coverage.annual_benefit && (
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Annual benefit: </span>${coverage.annual_benefit?.toLocaleString()}
              </div>
            )}

            {/* What's included panel */}
            {coverage.type && !quoteResult && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px', marginBottom: 8 }}>What's Included</div>
                {bench.features.slice(0, 4).map((f, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
                {bench.features.length > 4 && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>+{bench.features.length - 4} more benefits</div>
                )}
              </>
            )}

            {quoteResult && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
                <div style={{ background: '#0a0f2c', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Your monthly total</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'white', margin: '4px 0' }}>${quoteResult.monthly_premium?.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Approx. ${quoteResult.annual_premium?.toFixed(0)}/year</div>
                </div>
                {quoteResult.risk_level && (
                  <div className={`badge mt-8 ${quoteResult.risk_level === 'LOW' ? 'badge-success' : quoteResult.risk_level === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                    Risk: {quoteResult.risk_level}
                  </div>
                )}
              </>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 8 }}>{loadingMsg || 'Gemini calculating premium...'}</div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
            <div style={{ fontSize: 13 }}>Fill in your pet's details to see a quote</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Quote() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [quoteResult, setQuoteResult] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [medicalFile, setMedicalFile] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [breedVerification, setBreedVerification] = useState(null);
  const [historyReview, setHistoryReview] = useState(null);
  const [data, setData] = useState({
    pet: { name: '', type: 'dog', breed: '', dob: '', sex: 'male', neutered: 'yes', since: 'puppy' },
    holder: { first_name: '', last_name: '', email: '', phone: '', address1: '', city: '', postcode: '' },
    coverage: { type: 'ACCIDENT_ILLNESS', reimbursement: 80, deductible: 250, annual_benefit: 5000 },
    health: { conditions: [], previously_insured: 'no' },
  });

  const update = (section, field, value) =>
    setData(d => ({ ...d, [section]: { ...d[section], [field]: value } }));

  const handleCoverageTypeChange = (type) => {
    const bench = COVERAGE_BENCHMARKS[type];
    setData(d => ({
      ...d,
      coverage: {
        ...d.coverage,
        type,
        deductible: bench.defaultDeductible,
        annual_benefit: bench.defaultBenefit,
        reimbursement: bench.defaultReimbursement,
      },
    }));
  };

  const handlePetImageChange = (file) => {
    if (!file) return;
    setPetImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPetImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleGetQuote = async () => {
    setLoading(true);
    setUsedFallback(false);
    setBreedVerification(null);
    setHistoryReview(null);
    let fraudResult = null;
    let histResult = null;

    try {
      setLoadingMsg('AI is analyzing your application...');
      const today = new Date().toISOString().split('T')[0];
      const species = data.pet.type === 'cat' ? 'feline' : 'canine';
      const holderName = `${data.holder.first_name} ${data.holder.last_name}`.trim();

      const [fraudSettled, histSettled] = await Promise.allSettled([
        petImageFile ? verifyBreed(petImageFile, data.pet.breed, holderName) : Promise.resolve(null),
        medicalFile ? reviewHistory(medicalFile, today, species) : Promise.resolve(null),
      ]);

      if (fraudSettled.status === 'fulfilled' && fraudSettled.value) {
        fraudResult = fraudSettled.value.data.verification;
        setBreedVerification(fraudResult);
      }
      if (histSettled.status === 'fulfilled' && histSettled.value) {
        histResult = normalizeHistoryReview(histSettled.value.data.history_review);
        setHistoryReview(histResult);
      }

      setLoadingMsg('Generating AI quote...');
      const pet = { ...data.pet, holder_name: holderName, postcode: data.holder.postcode };
      const res = await generateQuote(pet, data.holder, data.coverage.type, data.coverage.annual_benefit, data.health);
      let finalQuote = res.data.quote;
      if (res.data.source === 'fallback') setUsedFallback(true);

      // Apply pre-existing loading (15% per condition)
      const preExistingCount = histResult?.pre_existing_conditions?.length || 0;
      if (preExistingCount > 0) {
        const loadingFactor = 1 + (preExistingCount * 0.15);
        finalQuote = {
          ...finalQuote,
          monthly_premium: parseFloat((finalQuote.monthly_premium * loadingFactor).toFixed(2)),
          annual_premium: parseFloat((finalQuote.annual_premium * loadingFactor).toFixed(2)),
          breed_tier: Math.min((finalQuote.breed_tier || 1) + 1, 5),
          risk_level: preExistingCount >= 3 ? 'HIGH' : 'MEDIUM',
          exclusions_to_note: [
            ...(finalQuote.exclusions_to_note || []),
            `${preExistingCount} pre-existing condition(s) detected — ${preExistingCount * 15}% loading applied`,
          ],
        };
      }

      setQuoteResult(finalQuote);
      setStep(6);
    } catch (e) {
      console.warn('Quote generation unavailable, using estimate');
      setUsedFallback(true);
      setQuoteResult({
        monthly_premium: 72.50,
        annual_premium: 870,
        risk_level: 'MEDIUM',
        breed_tier: 2,
        coverage_summary: {
          annual_benefit: data.coverage.annual_benefit,
          deductible: data.coverage.deductible,
          coinsurance_pct: 100 - data.coverage.reimbursement,
        },
        breed_specific_notes: ['Standard breed risk profile'],
        exclusions_to_note: [],
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        ai_recommendation: 'Coverage recommendation based on breed and age profile.',
      });
      setStep(6);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const resetQuote = () => {
    setStep(1);
    setQuoteResult(null);
    setUsedFallback(false);
    setMedicalFile(null);
    setPetImageFile(null);
    setPetImagePreview(null);
    setBreedVerification(null);
    setHistoryReview(null);
    setData({
      pet: { name: '', type: 'dog', breed: '', dob: '', sex: 'male', neutered: 'yes', since: 'puppy' },
      holder: { first_name: '', last_name: '', email: '', phone: '', address1: '', city: '', postcode: '' },
      coverage: { type: 'ACCIDENT_ILLNESS', reimbursement: 80, deductible: 250, annual_benefit: 5000 },
      health: { conditions: [], previously_insured: 'no' },
    });
  };

  const handlePurchase = () => {
    const submission = {
      id: `UW-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      quoteResult,
      pet: data.pet,
      holder: data.holder,
      coverage: data.coverage,
      health: data.health,
      breedVerification,
      historyReview,
      PreExisting_Conditions_Declared: (historyReview?.pre_existing_conditions?.length || 0) > 0 || data.health.conditions.length > 0,
      Medical_History_Log: (historyReview?.conditions_identified || []).map(c => ({
        Condition_Type: c.is_pre_existing ? 'CHRONIC' : 'ACUTE',
        Diagnosis_Date: c.first_noted_date || '',
        Is_Resolved: !c.is_pre_existing,
      })),
      Pet_Microchip_ID: '',
      Primary_Vet_Clinic_ID: '',
      Wellness_Tier_Selection: 'STANDARD',
      channelType: 'INDIVIDUAL',
      creResult: null,
      agentResults: {},
      uwResult: null,
      override: null,
      auditTrail: [{
        timestamp: new Date().toISOString(),
        actor: 'Quote System',
        action: 'Application submitted from Quote flow',
        details: `Quote ID: ${quoteResult?.quote_id || 'N/A'} · Premium: $${quoteResult?.monthly_premium?.toFixed(2)}/mo · Coverage: ${data.coverage.type}`,
      }],
    };
    try {
      const existing = JSON.parse(localStorage.getItem('uwQueue') || '[]');
      existing.unshift(submission);
      localStorage.setItem('uwQueue', JSON.stringify(existing));
    } catch (e) { console.warn('Could not save to UW queue:', e); }
    setStep(7);
  };

  const isFraudBlocked = breedVerification?.recommendation === 'REJECT';
  const preExistingCount = historyReview?.pre_existing_conditions?.length || 0;
  const breeds = data.pet.type === 'cat' ? BREEDS_CAT : BREEDS_DOG;
  const bench = COVERAGE_BENCHMARKS[data.coverage.type] || COVERAGE_BENCHMARKS.ACCIDENT_ILLNESS;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">New Policy Quote</div>
        <div className="page-subtitle">Get an AI-powered insurance quote for your pet</div>
      </div>

      {/* Step indicator */}
      <div className="card mb-24" style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['Pet Info', 'Pet Details', 'Coverage', 'Health History', 'Your Info', 'Review & Buy'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => step > i + 1 && setStep(i + 1)}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: step > i + 1 ? '#10b981' : step === i + 1 ? '#e84040' : '#e5e7eb', color: step >= i + 1 ? 'white' : '#9ca3af', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? '#1a1d2e' : '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 5 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#10b981' : '#e5e7eb', margin: '0 6px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout: form + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Form area */}
        <div className="card">
          <div className="card-body">

            {/* Step 1: Pet Info */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#0a0f2c' }}>Tell us about your pet.</h2>
                <div className="form-group">
                  <label className="form-label">Your ZIP code</label>
                  <input className="form-input" style={{ maxWidth: 200 }} placeholder="e.g. 10001" value={data.holder.postcode} onChange={e => update('holder', 'postcode', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">What's your pet's name?</label>
                  <input className="form-input" style={{ maxWidth: 360 }} placeholder="Pet name" value={data.pet.name} onChange={e => update('pet', 'name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">What kind of pet {data.pet.name ? `is ${data.pet.name}` : 'do you have'}?</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    {[{ id: 'dog', icon: '🐶', label: 'DOG' }, { id: 'cat', icon: '🐱', label: 'CAT' }, { id: 'bird', icon: '🐦', label: 'BIRD / EXOTIC' }].map(t => (
                      <div key={t.id} onClick={() => update('pet', 'type', t.id)} style={{ width: 90, height: 90, border: `2px solid ${data.pet.type === t.id ? '#0a0f2c' : '#e5e7eb'}`, background: data.pet.type === t.id ? '#f0f4ff' : 'white', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6, transition: 'all 0.15s', position: 'relative' }}>
                        <span style={{ fontSize: 30 }}>{t.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: data.pet.type === t.id ? '#0a0f2c' : '#9ca3af', letterSpacing: '0.5px' }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">What breed {data.pet.name ? `is ${data.pet.name}` : ''}?</label>
                  <select className="form-select" style={{ maxWidth: 360 }} value={data.pet.breed} onChange={e => update('pet', 'breed', e.target.value)}>
                    <option value="">Select breed</option>
                    {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Pet photo upload — appears after breed is selected */}
                {data.pet.breed && (
                  <div className="card" style={{ marginBottom: 16, border: '1px solid #e5e7eb' }}>
                    <div className="card-header" style={{ background: '#f8fafc' }}>
                      <h3>📸 Pet Photo</h3>
                      <span className="badge badge-purple">AI Fraud Check</span>
                    </div>
                    <div className="card-body">
                      <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                        Upload a clear photo of {data.pet.name || 'your pet'} so our AI can verify the declared breed and detect any misrepresentation.
                      </p>
                      <label className={`upload-zone ${petImageFile ? 'has-file' : ''}`} style={{ cursor: 'pointer', padding: '20px' }}>
                        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => handlePetImageChange(e.target.files[0])} />
                        {petImagePreview ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <img src={petImagePreview} alt="Pet preview" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: '2px solid #10b981' }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>✅ {petImageFile.name}</div>
                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{(petImageFile.size / 1024).toFixed(1)} KB · Click to change</div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="upload-icon">📷</div>
                            <div className="upload-text">Upload a photo of {data.pet.name || 'your pet'}</div>
                            <div className="upload-hint">JPG or PNG · Max 25 MB · Recommended but optional</div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                <button className="btn btn-accent btn-lg mt-16" onClick={() => setStep(2)} disabled={!data.pet.name || !data.pet.breed}>Continue →</button>
              </div>
            )}

            {/* Step 2: Pet Details */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#0a0f2c' }}>A bit more about {data.pet.name}.</h2>
                <div className="form-group">
                  <label className="form-label">Date of birth (or close estimate)</label>
                  <input type="date" className="form-input" style={{ maxWidth: 220 }} value={data.pet.dob} onChange={e => update('pet', 'dob', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{data.pet.name} is a:</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['male', 'female'].map(s => (
                      <button key={s} className={`btn ${data.pet.sex === s ? 'btn-primary' : 'btn-outline'}`} style={{ minWidth: 100 }} onClick={() => update('pet', 'sex', s)}>
                        {s === 'male' ? 'Boy 🐾' : 'Girl 🐾'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Is {data.pet.name} neutered/spayed?</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['yes', 'no'].map(v => (
                      <button key={v} className={`btn ${data.pet.neutered === v ? 'btn-primary' : 'btn-outline'}`} style={{ minWidth: 100 }} onClick={() => update('pet', 'neutered', v)}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">When did you get {data.pet.name}?</label>
                  <select className="form-select" style={{ maxWidth: 360 }} value={data.pet.since} onChange={e => update('pet', 'since', e.target.value)}>
                    <option value="puppy">I have had them since a puppy/kitten</option>
                    <option value="recent">Less than 6 months ago</option>
                    <option value="1year">6 months to 1 year ago</option>
                    <option value="older">More than 1 year ago</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3: Coverage Selection */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#0a0f2c' }}>Choose your coverage.</h2>
                <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 13 }}>Customise the plan to fit {data.pet.name}'s needs and your budget.</p>

                <div className="form-group">
                  <label className="form-label">Coverage type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {COVERAGE_TYPES.map(ct => (
                      <div key={ct.id} onClick={() => handleCoverageTypeChange(ct.id)} style={{ border: `2px solid ${data.coverage.type === ct.id ? '#0a0f2c' : '#e5e7eb'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', background: data.coverage.type === ct.id ? '#f0f4ff' : 'white', transition: 'all 0.15s' }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{ct.label}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{ct.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's covered panel */}
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>{bench.description}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px', marginBottom: 6 }}>Covered</div>
                      {bench.features.map((f, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#374151', display: 'flex', gap: 5, marginBottom: 3 }}>
                          <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#ef4444', letterSpacing: '0.5px', marginBottom: 6 }}>Not Covered</div>
                      {bench.notCovered.map((f, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#6b7280', display: 'flex', gap: 5, marginBottom: 3 }}>
                          <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>{f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reimbursement rate</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {bench.reimbursements.map(r => (
                      <button key={r} className={`btn ${data.coverage.reimbursement === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => update('coverage', 'reimbursement', r)}>{r}%</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual deductible</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {bench.deductibles.map(d => (
                      <button key={d} className={`btn ${data.coverage.deductible === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => update('coverage', 'deductible', d)}>${d}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual benefit limit</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {bench.benefits.map(b => (
                      <button key={b} className={`btn ${data.coverage.annual_benefit === b ? 'btn-primary' : 'btn-outline'}`} onClick={() => update('coverage', 'annual_benefit', b)}>${b.toLocaleString()}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(4)}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 4: Health History */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#0a0f2c' }}>Just a bit more info.</h2>
                <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 13 }}>Please review the list below to see if {data.pet.name} has ever had any of the following signs or symptoms.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {CONDITIONS.map((cond, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: data.health.conditions.includes(i) ? '#fef2f2' : 'white' }}>
                      <input type="checkbox" checked={data.health.conditions.includes(i)} onChange={e => {
                        const arr = [...data.health.conditions];
                        e.target.checked ? arr.push(i) : arr.splice(arr.indexOf(i), 1);
                        update('health', 'conditions', arr);
                      }} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13 }}>{cond.replace('Has food allergies', `${data.pet.name || 'Your pet'} has food allergies`)}</span>
                    </label>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 600 }}>
                    <input type="checkbox" onChange={e => { if (e.target.checked) update('health', 'conditions', []); }} />
                    <span>None of the above apply</span>
                  </label>
                </div>

                {/* Medical records upload — always shown */}
                <div className="card mb-16">
                  <div className="card-header">
                    <h3>📋 Medical Records</h3>
                    <span className="badge badge-warning">Required for AI Risk Assessment</span>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                      Uploading {data.pet.name || 'your pet'}'s vet records helps our AI accurately assess risk, detect pre-existing conditions, and provide a fair premium. This reduces the chance of claim surprises.
                    </p>
                    <label className={`upload-zone ${medicalFile ? 'has-file' : ''}`} style={{ cursor: 'pointer' }}>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={e => setMedicalFile(e.target.files[0])} />
                      <div className="upload-icon">{medicalFile ? '✅' : '📋'}</div>
                      <div className="upload-text">{medicalFile ? medicalFile.name : 'Upload Vet / Medical Records'}</div>
                      <div className="upload-hint">{medicalFile ? `${(medicalFile.size / 1024).toFixed(1)} KB · Click to change` : 'PDF, image, or text · Strongly recommended'}</div>
                    </label>
                    {!medicalFile && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
                        No records? You can skip this step, but pre-existing conditions may be excluded at claim time.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(5)}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 5: Owner Info */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#0a0f2c' }}>Enter your contact & billing information.</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First name *</label>
                    <input className="form-input" placeholder="First name" value={data.holder.first_name} onChange={e => update('holder', 'first_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last name *</label>
                    <input className="form-input" placeholder="Last name" value={data.holder.last_name} onChange={e => update('holder', 'last_name', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" placeholder="Address line 1" value={data.holder.address1} onChange={e => update('holder', 'address1', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={data.holder.city} onChange={e => update('holder', 'city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input className="form-input" value={data.holder.postcode} onChange={e => update('holder', 'postcode', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={data.holder.email} onChange={e => update('holder', 'email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile number</label>
                    <input className="form-input" type="tel" placeholder="(555) 000-0000" value={data.holder.phone} onChange={e => update('holder', 'phone', e.target.value)} />
                  </div>
                </div>

                {petImageFile && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#065f46' }}>
                    ✅ Pet photo uploaded — AI breed verification will run with your quote
                  </div>
                )}
                {medicalFile && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#065f46' }}>
                    ✅ Medical records uploaded — AI will check for pre-existing conditions
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-outline" onClick={() => setStep(4)}>← Back</button>
                  <button className="btn btn-ai btn-lg" onClick={handleGetQuote} disabled={loading || !data.holder.first_name || !data.holder.email}>
                    {loading ? <><span className="spinner" />{loadingMsg || 'Generating...'}</> : '✨ Get AI Quote'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Review & Buy */}
            {step === 6 && quoteResult && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#0a0f2c' }}>
                  {data.pet.name ? `Here is the plan for ${data.pet.name}.` : 'Your AI Quote'}
                  {usedFallback && <span title="Estimated premium — Gemini unavailable" style={{ fontSize: 16, marginLeft: 8, color: '#f59e0b', verticalAlign: 'middle' }}>⚠️</span>}
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                  Quote valid until {fmtDate(quoteResult.valid_until)} · Quote ID: {quoteResult.quote_id || 'AI-QUOTE'}
                </p>

                {/* Fraud blocked banner */}
                {isFraudBlocked && (
                  <div className="decision-banner denied mb-20">
                    <span className="decision-icon">🚫</span>
                    <div>
                      <div className="decision-title" style={{ color: '#991b1b' }}>Policy Cannot Be Issued</div>
                      <div className="decision-sub" style={{ color: '#b91c1c' }}>
                        AI breed verification detected a mismatch between the declared breed and the photo provided. This application has been flagged for fraud review and cannot proceed to purchase.
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-existing warning */}
                {!isFraudBlocked && preExistingCount > 0 && (
                  <div className="decision-banner partial mb-20">
                    <span className="decision-icon">⚠️</span>
                    <div>
                      <div className="decision-title" style={{ color: '#92400e' }}>Pre-existing Conditions Detected</div>
                      <div className="decision-sub" style={{ color: '#b45309' }}>
                        {preExistingCount} pre-existing condition{preExistingCount > 1 ? 's' : ''} found in medical records.
                        A {preExistingCount * 15}% premium loading has been applied. Pre-existing conditions may be excluded from coverage.
                      </div>
                    </div>
                  </div>
                )}

                {/* Normal approval banner */}
                {!isFraudBlocked && preExistingCount === 0 && (
                  <div className="decision-banner approve mb-20">
                    <span className="decision-icon">✅</span>
                    <div>
                      <div className="decision-title" style={{ color: '#065f46' }}>Quote Ready</div>
                      <div className="decision-sub" style={{ color: '#047857' }}>${quoteResult.monthly_premium?.toFixed(2)}/month · {COVERAGE_TYPES.find(c => c.id === data.coverage.type)?.label}</div>
                    </div>
                  </div>
                )}

                <div className="grid-2 mb-20">
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
                    <div className="section-label mb-8">Coverage Details</div>
                    {[
                      ['Annual Benefit', `$${(quoteResult.coverage_summary?.annual_benefit || data.coverage.annual_benefit)?.toLocaleString()}`],
                      ['Annual Deductible', `$${quoteResult.coverage_summary?.deductible || data.coverage.deductible}`],
                      ['Reimbursement', `${data.coverage.reimbursement}%`],
                      ['Breed Risk Tier', `Tier ${quoteResult.breed_tier || 2}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280' }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
                    <div className="section-label mb-8">AI Recommendation</div>
                    <div className="ai-panel">
                      <div className="ai-panel-header">
                        <span className="ai-panel-icon">✨</span>
                        <span className="ai-panel-title">Gemini Analysis</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#374151' }}>{quoteResult.ai_recommendation}</p>
                    </div>
                  </div>
                </div>

                {quoteResult.breed_specific_notes?.length > 0 && (
                  <div className="alert alert-info mb-16">
                    <strong>Breed Notes ({data.pet.breed}):</strong>
                    <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                      {quoteResult.breed_specific_notes.map((n, i) => <li key={i} style={{ fontSize: 12 }}>{n}</li>)}
                    </ul>
                  </div>
                )}

                {quoteResult.exclusions_to_note?.length > 0 && (
                  <div className="alert alert-warning mb-16">
                    <strong>Exclusions to Note:</strong>
                    <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                      {quoteResult.exclusions_to_note.map((e, i) => <li key={i} style={{ fontSize: 12 }}>{e}</li>)}
                    </ul>
                  </div>
                )}

                {!isFraudBlocked && (
                  <div className="card mb-16" style={{ border: '2px solid #0a0f2c' }}>
                    <div className="card-header" style={{ background: '#0a0f2c' }}>
                      <h3 style={{ color: 'white' }}>Payment Information</h3>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>${quoteResult.monthly_premium?.toFixed(2)}/month</span>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label">Billing cycle</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-primary">Monthly — ${quoteResult.monthly_premium?.toFixed(2)}</button>
                          <button className="btn btn-outline">Annual — ${quoteResult.annual_premium?.toFixed(0)} (save {Math.max(0, Math.round((quoteResult.monthly_premium * 12 - quoteResult.annual_premium) / (quoteResult.monthly_premium * 12) * 100))}%)</button>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Card number</label>
                          <input className="form-input" placeholder="Enter card number" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Expiry</label>
                          <input className="form-input" placeholder="MM / YY" style={{ maxWidth: 120 }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                        <input type="checkbox" style={{ marginRight: 8 }} defaultChecked />
                        I accept the terms of service and confirm I am the pet owner
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setStep(5)}>← Back</button>
                  {isFraudBlocked ? (
                    <button className="btn btn-outline btn-lg" style={{ flex: 1, justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                      🚫 Application Blocked — Breed Mismatch Detected
                    </button>
                  ) : (
                    <button className="btn btn-accent btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePurchase}>
                      🐾 Just one more click — {data.pet.name} can be covered!
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 7: Policy Purchased */}
            {step === 7 && quoteResult && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginBottom: 8 }}>
                  {data.pet.name} is now covered!
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
                  Welcome to PetLife AI Insurance. Your policy is active and your coverage starts today.
                </p>

                <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 16, padding: '24px 28px', marginBottom: 24, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.6px', marginBottom: 12 }}>Policy Confirmation</div>
                  {[
                    ['Pet Name',        `${data.pet.name} (${data.pet.breed})`],
                    ['Policyholder',    `${data.holder.first_name} ${data.holder.last_name}`],
                    ['Coverage',        COVERAGE_TYPES.find(c => c.id === data.coverage.type)?.label || data.coverage.type],
                    ['Monthly Premium', `$${quoteResult.monthly_premium?.toFixed(2)}`],
                    ['Annual Benefit',  `$${(quoteResult.coverage_summary?.annual_benefit || data.coverage.annual_benefit)?.toLocaleString()}`],
                    ['Deductible',      `$${quoteResult.coverage_summary?.deductible || data.coverage.deductible}`],
                    ['Policy Start',    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
                    ['Policy Number',   `PL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #bbf7d0' }}>
                      <span style={{ color: '#6b7280' }}>{k}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-lg" onClick={resetQuote}>+ Quote Another Pet</button>
                  <button className="btn btn-outline btn-lg" onClick={() => window.print()}>🖨️ Print Policy</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plan Summary Sidebar */}
        <PlanSummary
          data={data}
          quoteResult={quoteResult}
          loading={loading}
          usedFallback={usedFallback}
          petImagePreview={petImagePreview}
          breedVerification={breedVerification}
          historyReview={historyReview}
          loadingMsg={loadingMsg}
        />
      </div>
    </div>
  );
}
