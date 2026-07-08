const modelTier = 'vision';

function buildPrompt() {
  return `You are a veterinary invoice parser. Extract all structured data from this invoice.
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "clinic_name": "string",
  "clinic_address": "string",
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "visit_date": "YYYY-MM-DD",
  "patient_name": "string",
  "species": "canine or feline",
  "breed": "string",
  "owner_name": "string",
  "line_items": [
    {
      "description": "string",
      "procedure_code": "string or null",
      "diagnosis_code": "string or null",
      "category": "CONSULTATION|DIAGNOSTIC|MEDICATION|SURGERY|DENTAL|WELLNESS|OTHER",
      "amount": 0.00,
      "date_of_service": "YYYY-MM-DD"
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "discount": 0.00,
  "total_due": 0.00,
  "currency": "USD"
}`;
}

module.exports = { modelTier, buildPrompt };
