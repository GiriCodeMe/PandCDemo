import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ClaimStepper from '../components/claim/ClaimStepper';
import ClaimSummaryBar from '../components/claim/ClaimSummaryBar';
import Step1ReviewSubmission from '../components/claim/steps/Step1ReviewSubmission';
import Step2ClaimValidation from '../components/claim/steps/Step2ClaimValidation';
import Step3InsightsReview from '../components/claim/steps/Step3InsightsReview';
import Step4CommunicationsLog from '../components/claim/steps/Step4CommunicationsLog';
import Step5NextSteps from '../components/claim/steps/Step5NextSteps';
import { claimsApi } from '../services/api';
import { useStella } from '../context/StellaContext';
import styles from './ReviewClaimPage.module.css';

const STEP_PAGES = [null, 'claim-submission', 'claim-validation', 'insights-review', 'communication-log', 'next-steps'];

export default function ReviewClaimPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateContext, clearMessages } = useStella();

  const step = parseInt(searchParams.get('step') || '1', 10);

  useEffect(() => {
    setLoading(true);
    clearMessages();
    claimsApi.get(id)
      .then(data => { setClaim(data); setLoading(false); })
      .catch(() => { setError('Failed to load claim.'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    updateContext({ page: STEP_PAGES[step] || 'claim-submission', claimId: id, step });
  }, [id, step, updateContext]);

  function goToStep(n) {
    setSearchParams({ step: n });
  }

  function goBack() {
    if (step > 1) goToStep(step - 1);
    else navigate('/claims');
  }

  function goNext() {
    if (step < 5) goToStep(step + 1);
  }

  if (loading) return <div className={styles.loading}>Loading claim...</div>;
  if (error)   return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <ClaimSummaryBar claim={claim} />

      <div className={styles.stepperWrap}>
        <ClaimStepper current={step} onStepClick={goToStep} />
      </div>

      <div className={styles.content}>
        {step === 1 && <Step1ReviewSubmission claim={claim} />}
        {step === 2 && <Step2ClaimValidation claim={claim} />}
        {step === 3 && <Step3InsightsReview claim={claim} />}
        {step === 4 && <Step4CommunicationsLog claim={claim} />}
        {step === 5 && <Step5NextSteps claim={claim} />}
      </div>

      <div className={styles.navBar}>
        <button className="btn btn--outline" onClick={goBack}>
          {step === 1 ? '← Back to Claims' : '← Previous'}
        </button>
        <span className={styles.stepIndicator}>Step {step} of 5</span>
        {step < 5
          ? <button className="btn btn--primary" onClick={goNext}>Next →</button>
          : <button className="btn btn--accent" onClick={() => navigate('/claims')}>Complete Review ✓</button>
        }
      </div>
    </div>
  );
}
