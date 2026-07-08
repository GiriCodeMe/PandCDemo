const express = require('express');
const router = express.Router();
const { policies } = require('../services/mockData');

router.get('/', (req, res) => {
  const { status, species, search } = req.query;
  let result = [...policies];
  if (status) result = result.filter(p => p.status === status.toUpperCase());
  if (species) result = result.filter(p => p.pet.species === species);
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(p =>
      p.holder.name.toLowerCase().includes(s) ||
      p.pet.name.toLowerCase().includes(s) ||
      p.policy_id.toLowerCase().includes(s)
    );
  }
  res.json({ policies: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const policy = policies.find(p => p.policy_id === req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  res.json(policy);
});

module.exports = router;
