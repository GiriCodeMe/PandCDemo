import { getStore } from '../db/FileStore';

export interface BenefitsDocument {
  documentId: string;
  employerId: string;
  workspaceId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  sha256: string;
  documentType: string;
  planYear: number;
  lifecycleState: string;
  uploadedAt: string;
  validatedAt?: string;
  extractedAt?: string;
  analyzedAt?: string;
  requirementsGeneratedAt?: string;
  pageCount?: number;
  extractedRuleCount?: number;
  conflictCount?: number;
  ambiguityCount?: number;
  uploadedBy: string;
}

export interface Requirement {
  requirementId: string;
  epicId?: string;
  type: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  sourceDocumentId?: string | null;
  createdAt: string;
}

export interface UserStory {
  storyId: string;
  epicId?: string;
  title: string;
  userRole: string;
  narrative: string;
  acceptanceCriteria?: string[];
  priority?: string;
  status?: string;
}

export interface BusinessRule {
  ruleId: string;
  category?: string;
  title: string;
  rule: string;
  rationale?: string;
  enforcementLevel?: string;
  sourceDocumentId?: string | null;
}

export const documentService = {
  getAll(employerId?: string): BenefitsDocument[] {
    const all = getStore().readArray<BenefitsDocument>('documents/documents');
    if (employerId) return all.filter((d) => d.employerId === employerId);
    return all;
  },

  getById(documentId: string): BenefitsDocument | undefined {
    return getStore().findOne<BenefitsDocument & Record<string, unknown>>(
      'documents/documents',
      'documentId',
      documentId,
    ) as BenefitsDocument | undefined;
  },
};

export const requirementsService = {
  getAll(category?: string, priority?: string): Requirement[] {
    const all = getStore().readArray<Requirement>('requirements/requirements');
    let result = all;
    if (category) result = result.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    if (priority) result = result.filter((r) => r.priority.toLowerCase() === priority.toLowerCase());
    return result;
  },

  getUserStories(): UserStory[] {
    return getStore().readArray<UserStory>('requirements/userStories');
  },

  getBusinessRules(): BusinessRule[] {
    return getStore().readArray<BusinessRule>('requirements/businessRules');
  },
};
