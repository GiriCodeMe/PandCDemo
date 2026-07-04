const mockCustomers = {
  'CUST-001': {
    id: 'CUST-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '202-555-0143',
    address: '123 Main St, Orlando, FL 32801',
    dateOfBirth: '1985-04-22',
    memberSince: '2020-01-15',
    segment: 'Gold',
    lifetimeValue: 12400,
    preferredChannel: 'Email',
    npsScore: 8,
    sentimentScore: 0.72,
    policyNumbers: ['2024-001'],
    interactionHistory: [
      { id: 'int-1', type: 'call', direction: 'inbound', date: '2026-03-15', duration: '8m 32s', agent: 'Jane Doe', summary: 'Reported water damage claim. Calm and cooperative. Provided all requested information.' },
      { id: 'int-2', type: 'email', direction: 'outbound', date: '2026-03-15', agent: 'Jane Doe', summary: 'Sent claim acknowledgement and documentation checklist.' },
      { id: 'int-3', type: 'call', direction: 'inbound', date: '2025-06-10', duration: '4m 15s', agent: 'Mike Torres', summary: 'Premium renewal inquiry. Updated payment method.' }
    ]
  },
  'CUST-002': {
    id: 'CUST-002',
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@example.com',
    phone: '305-555-0198',
    address: '456 Oak Avenue, Miami, FL 33109',
    dateOfBirth: '1972-09-14',
    memberSince: '2018-07-01',
    segment: 'Silver',
    lifetimeValue: 22800,
    preferredChannel: 'Phone',
    npsScore: 5,
    sentimentScore: 0.41,
    policyNumbers: ['2024-002'],
    interactionHistory: [
      { id: 'int-4', type: 'call', direction: 'inbound', date: '2026-03-10', duration: '14m 02s', agent: 'Jane Doe', summary: 'Reported fire damage. Distressed. ALE benefits explained. Temporary hotel arranged.' },
      { id: 'int-5', type: 'call', direction: 'inbound', date: '2025-01-20', duration: '9m 45s', agent: 'Sarah Lee', summary: 'Prior water damage claim. Documents collected.' }
    ]
  },
  'CUST-003': {
    id: 'CUST-003',
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'robert.davis@example.com',
    phone: '713-555-0267',
    address: '789 Pine Circle, Houston, TX 77001',
    dateOfBirth: '1990-11-30',
    memberSince: '2022-03-01',
    segment: 'Bronze',
    lifetimeValue: 4800,
    preferredChannel: 'SMS',
    npsScore: 9,
    sentimentScore: 0.88,
    policyNumbers: ['2024-003'],
    interactionHistory: [
      { id: 'int-6', type: 'sms', direction: 'inbound', date: '2026-03-08', agent: 'Jane Doe', summary: 'Reported roof damage via SMS. Photos submitted promptly. Very cooperative.' }
    ]
  }
};

module.exports = mockCustomers;
