const express = require('express');
const router = express.Router();
const mockCustomers = require('../data/mockCustomers');

let customers = { ...mockCustomers };

/* GET /api/crm/customers/:id */
router.get('/customers/:id', (req, res) => {
  const c = customers[req.params.id];
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  res.json(c);
});

/* GET /api/crm/customers/:id/history */
router.get('/customers/:id/history', (req, res) => {
  const c = customers[req.params.id];
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  res.json({ customerId: req.params.id, interactions: c.interactionHistory });
});

/* POST /api/crm/customers/:id/interaction — log new interaction */
router.post('/customers/:id/interaction', (req, res) => {
  const c = customers[req.params.id];
  if (!c) return res.status(404).json({ error: 'Customer not found' });

  const interaction = {
    id: `int-${Date.now()}`,
    type: req.body.type || 'note',
    direction: req.body.direction || 'outbound',
    date: new Date().toISOString().split('T')[0],
    agent: req.body.agent || 'Jane Doe',
    summary: req.body.summary || ''
  };

  c.interactionHistory = [interaction, ...c.interactionHistory];
  res.status(201).json(interaction);
});

/* GET /api/crm/customers — list all */
router.get('/customers', (req, res) => {
  res.json(Object.values(customers));
});

module.exports = router;
