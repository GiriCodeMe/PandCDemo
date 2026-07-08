export interface Note {
  id: number;
  category: string;
  document: { id: string; name: string } | null;
  text: string;
  isEdited: boolean;
  lastEditedAt: string;
}

export interface ApplicationData {
  id: string;
  applicantName: string;
  policyType: string;
  coverageAmount: string;
  status?: string;
  priority?: string;
  submittedDate?: string;
  occupation?: string;
  annualIncome?: string;
  dateOfBirth?: string;
  coverageTerm?: string;
  additionalInfo?: string;
  details?: {
    notes?: Note[];
    medicalConditions?: any[];
    labResults?: any[];
    financialOverview?: any;
    lifestyle?: string;
    familyHistory?: any[];
    requirements?: any[];
    hobbies?: string[];
    travelFrequency?: string;
    alcoholUse?: string;
    tobaccoUse?: string;
  };
  documents?: any[];
  tasks?: any[];
  aiRiskAnalysis?: any;
  timelineEvents?: any[];
}
