const request = require('supertest');
const app = require('../../app');

const VALID_PET_ID = 'PET-7721';   // Waffles — all vaccines GREEN
const AMBER_PET_ID = 'PET-3341';   // Rocky — Bordetella EXPIRING_SOON
const INVALID_PET_ID = 'PET-XXXX';

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// ─── Health Pass ──────────────────────────────────────────────────────────────

describe('GET /api/hotel/health-pass', () => {
  test('400 when petId missing', async () => {
    const res = await request(app).get('/api/hotel/health-pass');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/petId/i);
  });

  test('404 for unknown petId', async () => {
    const res = await request(app).get(`/api/hotel/health-pass?petId=${INVALID_PET_ID}`);
    expect(res.status).toBe(404);
  });

  test('200 returns health pass with required fields', async () => {
    const res = await request(app).get(`/api/hotel/health-pass?petId=${VALID_PET_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.petId).toBe(VALID_PET_ID);
    expect(res.body.overallStatus).toBeDefined();
    expect(res.body.vaccinations).toBeDefined();
    expect(res.body.vaccinations.rabies).toBeDefined();
    expect(res.body.vaccinations.bordetella).toBeDefined();
    expect(res.body.vaccinations.dhpp).toBeDefined();
  });

  test('Waffles (PET-7721) has GREEN overall status', async () => {
    const res = await request(app).get(`/api/hotel/health-pass?petId=${VALID_PET_ID}`);
    expect(res.body.overallStatus).toBe('GREEN');
  });

  test('Rocky (PET-3341) has AMBER overall status due to expiring Bordetella', async () => {
    const res = await request(app).get(`/api/hotel/health-pass?petId=${AMBER_PET_ID}`);
    expect(res.body.overallStatus).toBe('AMBER');
  });

  test('response includes policyNumber and policyStatus', async () => {
    const res = await request(app).get(`/api/hotel/health-pass?petId=${VALID_PET_ID}`);
    expect(res.body.policyNumber).toBeTruthy();
    expect(res.body.policyStatus).toBe('ACTIVE');
  });
});

// ─── Stay Protection Quote ────────────────────────────────────────────────────

describe('GET /api/hotel/stay-protection/quote', () => {
  test('400 when dates missing', async () => {
    const res = await request(app).get('/api/hotel/stay-protection/quote');
    expect(res.status).toBe(400);
  });

  test('400 when endDate is before startDate', async () => {
    const res = await request(app).get(
      `/api/hotel/stay-protection/quote?startDate=${futureDate(5)}&endDate=${futureDate(1)}`
    );
    expect(res.status).toBe(400);
  });

  test('400 when startDate is in the past', async () => {
    const res = await request(app).get(
      `/api/hotel/stay-protection/quote?startDate=2020-01-01&endDate=2020-01-05`
    );
    expect(res.status).toBe(400);
  });

  test('200 returns quote with totalPremium', async () => {
    const res = await request(app).get(
      `/api/hotel/stay-protection/quote?startDate=${futureDate(1)}&endDate=${futureDate(5)}&petId=${VALID_PET_ID}`
    );
    expect(res.status).toBe(200);
    expect(res.body.totalPremium).toBe(14.00);   // 4 days × $3.50
    expect(res.body.totalDays).toBe(4);
    expect(res.body.dailyPremium).toBe(3.50);
  });

  test('premium scales linearly with stay duration', async () => {
    const res = await request(app).get(
      `/api/hotel/stay-protection/quote?startDate=${futureDate(1)}&endDate=${futureDate(8)}`
    );
    expect(res.status).toBe(200);
    expect(res.body.totalDays).toBe(7);
    expect(res.body.totalPremium).toBeCloseTo(24.50, 2);
  });
});

// ─── Stay Protection Bind ─────────────────────────────────────────────────────

describe('POST /api/hotel/stay-protection/bind', () => {
  const VALID_BIND = {
    facilityId: 'HOTEL-PALACE-OHIO-02',
    checkInDate: futureDate(2),
    checkOutDate: futureDate(6),
    owner: { email: 'test@example.com', phone: '+15551234567' },
    pet: { name: 'Waffles', microchipId: '981020003445121' },
    linkedPetId: VALID_PET_ID,
  };

  test('400 when facilityId missing', async () => {
    const { facilityId, ...rest } = VALID_BIND;
    const res = await request(app).post('/api/hotel/stay-protection/bind').send(rest);
    expect(res.status).toBe(400);
  });

  test('400 when owner email missing', async () => {
    const res = await request(app).post('/api/hotel/stay-protection/bind').send({
      ...VALID_BIND,
      owner: { phone: '+15551234567' },
    });
    expect(res.status).toBe(400);
  });

  test('400 when pet name missing', async () => {
    const res = await request(app).post('/api/hotel/stay-protection/bind').send({
      ...VALID_BIND,
      pet: {},
    });
    expect(res.status).toBe(400);
  });

  test('201 returns policyNumber and binder on success', async () => {
    const res = await request(app).post('/api/hotel/stay-protection/bind').send(VALID_BIND);
    expect(res.status).toBe(201);
    expect(res.body.policyNumber).toMatch(/^MICRO-STAY-/);
    expect(res.body.binder).toBeDefined();
    expect(res.body.binder.status).toBe('ACTIVE');
    expect(res.body.notification.emailStatus).toBe('DISPATCHED');
  });
});

// ─── Incident Report ──────────────────────────────────────────────────────────

describe('POST /api/hotel/incident/report', () => {
  const VALID_INCIDENT = {
    petId: VALID_PET_ID,
    incidentType: 'ILLNESS',
    symptomsDescription: 'Vomiting and lethargy for 2 hours',
  };

  test('400 when petId missing', async () => {
    const { petId, ...rest } = VALID_INCIDENT;
    const res = await request(app).post('/api/hotel/incident/report').send(rest);
    expect(res.status).toBe(400);
  });

  test('400 when symptomsDescription too short (< 10 chars)', async () => {
    const res = await request(app).post('/api/hotel/incident/report').send({
      ...VALID_INCIDENT,
      symptomsDescription: 'Vomiting',
    });
    expect(res.status).toBe(400);
  });

  test('400 for invalid incidentType', async () => {
    const res = await request(app).post('/api/hotel/incident/report').send({
      ...VALID_INCIDENT,
      incidentType: 'UNKNOWN',
    });
    expect(res.status).toBe(400);
  });

  test('404 for unknown petId', async () => {
    const res = await request(app).post('/api/hotel/incident/report').send({
      ...VALID_INCIDENT,
      petId: INVALID_PET_ID,
    });
    expect(res.status).toBe(404);
  });

  test.each(['ILLNESS', 'INJURY', 'EMERGENCY'])('201 created for incidentType %s', async (incidentType) => {
    const res = await request(app).post('/api/hotel/incident/report').send({ ...VALID_INCIDENT, incidentType });
    expect(res.status).toBe(201);
    expect(res.body.incidentRef).toMatch(/^INC-HTL-/);
    expect(res.body.coverageStatus).toBeDefined();
  });

  test('active policy produces FULL_POLICY coverageStatus', async () => {
    const res = await request(app).post('/api/hotel/incident/report').send(VALID_INCIDENT);
    expect(res.body.coverageStatus).toBe('FULL_POLICY');
    expect(res.body.preAuth).toBeDefined();
    expect(res.body.preAuth.preAuthRef).toMatch(/^AUTH-HTL-/);
  });
});

// ─── Loyalty ──────────────────────────────────────────────────────────────────

describe('POST /api/hotel/loyalty/apply-event', () => {
  test('400 when petId missing', async () => {
    const res = await request(app).post('/api/hotel/loyalty/apply-event').send({ eventType: 'CHECKOUT_DEDUCTIBLE_CREDIT' });
    expect(res.status).toBe(400);
  });

  test('400 for invalid eventType', async () => {
    const res = await request(app).post('/api/hotel/loyalty/apply-event').send({ petId: VALID_PET_ID, eventType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  test('404 for unknown petId', async () => {
    const res = await request(app).post('/api/hotel/loyalty/apply-event').send({
      petId: INVALID_PET_ID,
      eventType: 'CHECKOUT_DEDUCTIBLE_CREDIT',
    });
    expect(res.status).toBe(404);
  });

  test('200 for CHECKOUT_DEDUCTIBLE_CREDIT with valid triggerContext', async () => {
    const res = await request(app).post('/api/hotel/loyalty/apply-event').send({
      petId: VALID_PET_ID,
      eventType: 'CHECKOUT_DEDUCTIBLE_CREDIT',
      triggerContext: { stayDays: 7 },
    });
    expect(res.status).toBe(200);
    expect(res.body.eventType).toBe('CHECKOUT_DEDUCTIBLE_CREDIT');
    expect(res.body.rewardValue).toBe('$15.00');
  });

  test('422 for CHECKOUT_DEDUCTIBLE_CREDIT when stayDays < 5', async () => {
    const res = await request(app).post('/api/hotel/loyalty/apply-event').send({
      petId: VALID_PET_ID,
      eventType: 'CHECKOUT_DEDUCTIBLE_CREDIT',
      triggerContext: { stayDays: 3 },
    });
    expect(res.status).toBe(422);
  });

  test.each(['VET_VISIT_DISCOUNT', 'BOARDING_INCIDENT_WRITEOFF'])('200 for eventType %s', async (eventType) => {
    const res = await request(app).post('/api/hotel/loyalty/apply-event').send({ petId: VALID_PET_ID, eventType });
    expect(res.status).toBe(200);
    expect(res.body.eventType).toBe(eventType);
    expect(res.body.petId).toBe(VALID_PET_ID);
  });
});

describe('GET /api/hotel/loyalty/profile/:petId', () => {
  test('200 returns loyalty profile', async () => {
    const res = await request(app).get(`/api/hotel/loyalty/profile/${VALID_PET_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.petId).toBe(VALID_PET_ID);
  });
});

describe('GET /api/hotel/loyalty/log', () => {
  test('200 returns log array and total count', async () => {
    const res = await request(app).get('/api/hotel/loyalty/log');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.log)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.total).toBe(res.body.log.length);
  });
});
