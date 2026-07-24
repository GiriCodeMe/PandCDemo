export interface OwnerData {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  dob: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface Location {
  id: string;
  name: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface BusinessData {
  legalName: string;
  dba: string;
  entityType: string;
  ein: string;
  sicCode: string;
  naicsCode: string;
  natureOfBusiness: string;
  yearEstablished: string;
  totalEmployees: string;
  locations: Location[];
  contacts: Contact[];
}

export interface CensusEmployee {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  hireDate: string;
  salary: string;
  status: 'Active' | 'Inactive';
  employmentClass: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'OWNER';
  weeklyHours: number;
  selected: boolean;
}

export interface CensusIssue {
  type: 'ERROR' | 'WARNING';
  employeeId: string;
  employeeName: string;
  message: string;
}

export interface CensusData {
  provider: 'adp' | 'quickbooks' | 'ukg' | 'upload' | 'manual' | null;
  connected: boolean;
  employees: CensusEmployee[];
  aiIssues: CensusIssue[];
  aiValidated: boolean;
}

export interface SelectedPlan {
  planId: string;
  name: string;
  price: string;
}

export interface SelectedProduct {
  productId: string;
  name: string;
  type: 'statutory' | 'voluntary';
  selectedPlan: SelectedPlan | null;
}

export interface AIProductRecommendation {
  productId: string;
  recommendedPlanId: string;
  confidence: number;
  reasoning: string;
  estimatedMonthlyPerEmployee: number;
}

export interface QuoteLineItem {
  productId: string;
  productName: string;
  planName: string;
  employeeCount: number;
  monthlyPerEmployee: number;
  monthlyTotal: number;
  type: 'statutory' | 'voluntary';
}

export interface EnrollmentRecord {
  employeeId: string;
  productId: string;
  enrolled: boolean;
}

export interface EnrollmentException {
  employeeId: string;
  employeeName: string;
  message: string;
  severity: 'warning' | 'error';
  resolved: boolean;
}

export interface UnderwritingResult {
  decision: 'APPROVE' | 'CONDITIONAL_APPROVAL' | 'REJECT';
  confidence: number;
  reasons: string[];
  requiredDocuments: string[];
  approvedCount: number;
  exceptionCount: number;
  summary: string;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  classification: string;
  status: 'uploading' | 'analyzing' | 'accepted' | 'rejected';
  extractedData: { key: string; value: string }[];
}

export interface BillingData {
  payrollDeductionEnabled: boolean;
  payrollFrequency: string;
  employerBillingFrequency: string;
  billingContactName: string;
  billingEmail: string;
}

export interface PaymentData {
  method: 'ach' | 'card';
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

export interface CFOApproval {
  approverName: string;
  approverTitle: string;
  signature: string;
  approved: boolean;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'CENSUS_VALIDATION'
  | 'QUOTE_GENERATED'
  | 'ENROLLMENT_IN_PROGRESS'
  | 'AI_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'READY_FOR_SUBMISSION'
  | 'PENDING_SIGNATURE'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'PAYMENT_PENDING'
  | 'ACTIVE';

export interface WizardState {
  applicationStatus: ApplicationStatus;
  owner: OwnerData;
  business: BusinessData;
  census: CensusData;
  products: SelectedProduct[];
  aiRecommendations: AIProductRecommendation[];
  quoteLines: QuoteLineItem[];
  quoteGenerated: boolean;
  enrollments: EnrollmentRecord[];
  enrollmentExceptions: EnrollmentException[];
  underwritingResult: UnderwritingResult | null;
  documents: UploadedDocument[];
  billing: BillingData;
  payment: PaymentData;
  cfoApproval: CFOApproval;
  agreedToTerms: boolean;
  signature: string;
}

export const INITIAL_STATE: WizardState = {
  applicationStatus: 'DRAFT',
  owner: { firstName: '', lastName: '', title: '', email: '', phone: '', dob: '', address1: '', address2: '', city: '', state: '', zip: '' },
  business: { legalName: '', dba: '', entityType: '', ein: '', sicCode: '', naicsCode: '', natureOfBusiness: '', yearEstablished: '', totalEmployees: '', locations: [{ id: 'loc-1', name: 'Headquarters', address1: '', city: '', state: '', zip: '', isPrimary: true }], contacts: [] },
  census: { provider: null, connected: false, employees: [], aiIssues: [], aiValidated: false },
  products: [],
  aiRecommendations: [],
  quoteLines: [],
  quoteGenerated: false,
  enrollments: [],
  enrollmentExceptions: [],
  underwritingResult: null,
  documents: [],
  billing: { payrollDeductionEnabled: true, payrollFrequency: 'Bi-Weekly', employerBillingFrequency: 'Monthly', billingContactName: '', billingEmail: '' },
  payment: { method: 'ach', bankName: '', routingNumber: '', accountNumber: '', accountType: 'Checking', cardName: '', cardNumber: '', cardExpiry: '', cardCvv: '' },
  cfoApproval: { approverName: '', approverTitle: 'CFO', signature: '', approved: false },
  agreedToTerms: false,
  signature: '',
};
