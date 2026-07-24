import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { documentService } from '../services/document.service';
import { requirementsService } from '../services/document.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(requireAuth);

// GET /api/documents?employerId=
router.get('/', (req: AuthRequest, res) => {
  const employerId = (req.query.employerId as string) || 'ACM-001';
  const docs = documentService.getAll(employerId);
  sendSuccess(res, docs);
});

// GET /api/documents/:id
router.get('/:documentId', (req, res) => {
  const doc = documentService.getById(req.params.documentId);
  if (!doc) {
    sendError(res, 'NOT_FOUND', 'Document not found', 404);
    return;
  }
  sendSuccess(res, doc);
});

// POST /api/documents/upload — mock upload (no real file storage in Phase 2)
router.post('/upload', (req: AuthRequest, res) => {
  const { filename, documentType, planYear, employerId } = req.body as {
    filename?: string;
    documentType?: string;
    planYear?: number;
    employerId?: string;
  };
  if (!filename || !documentType) {
    sendError(res, 'MISSING_FIELDS', 'filename and documentType are required', 400);
    return;
  }
  const now = new Date().toISOString();
  const doc = {
    documentId: 'DOC-' + uuidv4().slice(0, 8).toUpperCase(),
    employerId: employerId || 'ACM-001',
    workspaceId: 'WS-ACM-001-2027',
    originalFilename: filename,
    mimeType: filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSizeBytes: 0,
    sha256: 'pending',
    documentType: documentType || 'Benefits Guide',
    planYear: planYear || 2027,
    lifecycleState: 'UPLOADED',
    uploadedAt: now,
    uploadedBy: req.persona?.name || 'admin',
    pageCount: null,
    extractedRuleCount: null,
    conflictCount: null,
    ambiguityCount: null,
  };
  sendSuccess(res, { document: doc, message: 'Document queued for processing (mock)' });
});

// GET /api/documents/:id/requirements — requirements linked to a document
router.get('/:documentId/requirements', (req, res) => {
  const doc = documentService.getById(req.params.documentId);
  if (!doc) {
    sendError(res, 'NOT_FOUND', 'Document not found', 404);
    return;
  }
  const reqs = requirementsService.getAll();
  const linked = reqs.filter((r) => r.sourceDocumentId === req.params.documentId);
  sendSuccess(res, linked.length ? linked : reqs.slice(0, 5));
});

export default router;
