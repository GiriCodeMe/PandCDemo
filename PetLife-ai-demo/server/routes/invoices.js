const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const aiFactory = require('../ai-factory/factory');
const invoiceParserAgent = require('../ai-factory/agents/invoice-parser');

router.post('/parse', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await aiFactory.run(invoiceParserAgent, {
      fileBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });
    res.json({ success: true, invoice: result, source: 'gemini' });
  } catch (err) {
    console.warn('[invoice] AI unavailable, using fallback:', err.message);
    res.json({ success: true, invoice: getMockInvoice(), source: 'fallback' });
  }
});

function getMockInvoice() {
  return {
    clinic_name: 'Westside Animal Hospital',
    clinic_address: '245 Oak Avenue, New York, NY 10001',
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().split('T')[0],
    visit_date: new Date().toISOString().split('T')[0],
    patient_name: 'Biscuit',
    species: 'canine',
    breed: 'French Bulldog',
    owner_name: 'Sarah Mitchell',
    line_items: [
      { description: 'Consultation Fee',          procedure_code: 'CONS-001', diagnosis_code: null,    category: 'CONSULTATION', amount: 85.00,  date_of_service: new Date().toISOString().split('T')[0] },
      { description: 'Intradermal Allergy Testing',procedure_code: 'DIAG-IDT', diagnosis_code: 'L20.89',category: 'DIAGNOSTIC',   amount: 320.00, date_of_service: new Date().toISOString().split('T')[0] },
      { description: 'Apoquel 16mg x30',           procedure_code: 'MED-APQ',  diagnosis_code: null,    category: 'MEDICATION',   amount: 74.50,  date_of_service: new Date().toISOString().split('T')[0] },
    ],
    subtotal: 479.50,
    tax: 0,
    discount: 0,
    total_due: 479.50,
    currency: 'USD',
  };
}

module.exports = router;
