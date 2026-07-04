const express = require('express');
const router = express.Router();
const mockInvoices = require('../data/mockInvoices');
const mockVendors = require('../data/mockVendors');
const mockReserves = require('../data/mockReserves');
const mockServiceProviders = require('../data/mockServiceProviders');

function stateFromZip(zip) {
  if (!zip) return null;
  const prefix = zip.charAt(0);
  if (prefix === '3') return 'FL';
  if (prefix === '7') return 'TX';
  return null;
}

let invoices = [...mockInvoices];
let vendors = [...mockVendors];
let reserves = { ...mockReserves };

/* GET /api/erp/invoices/:claimId */
router.get('/invoices/:claimId', (req, res) => {
  const result = invoices.filter(i => i.claimId === req.params.claimId);
  res.json(result);
});

/* GET /api/erp/vendors */
router.get('/vendors', (req, res) => {
  const { type } = req.query;
  const result = type ? vendors.filter(v => v.type.toLowerCase().includes(type.toLowerCase())) : vendors;
  res.json(result);
});

/* GET /api/erp/reserves/:claimId */
router.get('/reserves/:claimId', (req, res) => {
  const r = reserves[req.params.claimId];
  if (!r) return res.status(404).json({ error: 'Reserve not found' });
  res.json(r);
});

/* GET /api/erp/service-providers */
router.get('/service-providers', (req, res) => {
  const { type, zip } = req.query;
  let result = [...mockServiceProviders];
  if (type) result = result.filter(sp => sp.type === type);
  if (zip) {
    const byZip = result.filter(sp => sp.zip === zip);
    result = byZip.length > 0 ? byZip : result.filter(sp => sp.state === stateFromZip(zip));
  }
  res.json(result.sort((a, b) => a.distance - b.distance));
});

/* POST /api/erp/payments — log payment */
router.post('/payments', (req, res) => {
  const { claimId, amount, category, payee, description } = req.body;
  if (!claimId || !amount) return res.status(400).json({ error: 'claimId and amount are required' });

  const reserve = reserves[claimId];
  if (!reserve) return res.status(404).json({ error: 'Reserve not found for claim' });

  const payment = {
    id: `PAY-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    amount: Number(amount),
    category: category || 'General',
    payee: payee || '',
    description: description || '',
    status: 'Issued'
  };

  reserve.payments = reserve.payments || [];
  reserve.payments.push(payment);

  const line = reserve.breakdown.find(b => b.category === category);
  if (line) line.paid += Number(amount);

  res.status(201).json(payment);
});

module.exports = router;
