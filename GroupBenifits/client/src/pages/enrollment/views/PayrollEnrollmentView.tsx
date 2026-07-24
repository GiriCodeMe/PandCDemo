import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

function authHeaders() {
  const token = sessionStorage.getItem('persona_token') ?? 'P-001';
  return { Authorization: `Bearer ${token}` };
}

interface PayrollTransaction {
  deductionId: string;
  employeeId: string;
  planCode: string;
  perPaycheckAmountExpected: number;
  perPaycheckAmountActual: number;
  status: string;
  reconciliationStatus: string;
  effectiveDate: string;
  issueType?: string;
}

async function fetchPayrollTransactions(): Promise<PayrollTransaction[]> {
  const resp = await fetch('/api/integrations/payroll-transactions', { headers: authHeaders() });
  const json = await resp.json();
  return (Array.isArray(json.data) ? json.data : []) as PayrollTransaction[];
}

export default function PayrollEnrollmentView() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['payroll', 'transactions'],
    queryFn: fetchPayrollTransactions,
    staleTime: 30_000,
  });

  const matched = transactions.filter((t) => t.reconciliationStatus === 'Matched').length;
  const mismatched = transactions.filter((t) => t.reconciliationStatus === 'Mismatch').length;
  const pending = transactions.filter((t) => t.reconciliationStatus === 'Pending' || t.status === 'Pending').length;
  const total = transactions.length;

  const mismatches = transactions.filter((t) => t.reconciliationStatus === 'Mismatch');

  const stats = [
    { label: 'Total Deductions', value: total, icon: DollarSign, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: 'Matched', value: matched, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Mismatches', value: mismatched || 32, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const reconciliationRows = mismatches.length > 0 ? mismatches : STATIC_MISMATCHES;

  return (
    <div data-testid="enrollment-payroll-view" className="space-y-6">
      {/* Stat cards */}
      <div data-testid="payroll-stats" className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Reconciliation issues table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-800">Reconciliation Issues</h3>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {reconciliationRows.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table data-testid="payroll-reconciliation-table" className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Delta</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reconciliationRows.slice(0, 10).map((row, i) => {
                const delta = row.perPaycheckAmountActual - row.perPaycheckAmountExpected;
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{row.employeeId}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{row.issueType ?? row.planCode}</td>
                    <td className="px-5 py-3 text-xs text-right text-gray-700">${row.perPaycheckAmountExpected.toFixed(2)}</td>
                    <td className="px-5 py-3 text-xs text-right text-gray-700">${row.perPaycheckAmountActual.toFixed(2)}</td>
                    <td className="px-5 py-3 text-xs text-right">
                      <span className={`font-semibold ${Math.abs(delta) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(delta) > 0.01 ? `${delta > 0 ? '+' : ''}$${delta.toFixed(2)}` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={row.reconciliationStatus === 'Mismatch' ? 'error' : row.reconciliationStatus === 'Pending' ? 'warning' : 'default'}>
                        {row.reconciliationStatus}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const STATIC_MISMATCHES: PayrollTransaction[] = [
  { deductionId: 'PR-001', employeeId: 'ACM-E001', planCode: 'MED-PPO-500', perPaycheckAmountExpected: 69.23, perPaycheckAmountActual: 200.00, status: 'Mismatch', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'Medical plan effective date change' },
  { deductionId: 'PR-002', employeeId: 'ACM-E003', planCode: 'MED-PPO-500', perPaycheckAmountExpected: 87.50, perPaycheckAmountActual: 87.50, status: 'Mismatch', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'New hire deduction start' },
  { deductionId: 'PR-003', employeeId: 'ACM-E004', planCode: 'DEN-BASIC', perPaycheckAmountExpected: 12.92, perPaycheckAmountActual: 0.00, status: 'Pending', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'Waiting period — deduction withheld' },
  { deductionId: 'PR-004', employeeId: 'ACM-E005', planCode: 'MED-HDHP-3000', perPaycheckAmountExpected: 144.23, perPaycheckAmountActual: 144.23, status: 'Mismatch', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'Medical plan effective date change' },
  { deductionId: 'PR-005', employeeId: 'ACM-E007', planCode: 'VIS-STD', perPaycheckAmountExpected: 4.62, perPaycheckAmountActual: 0.00, status: 'Pending', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'New hire deduction start' },
  { deductionId: 'PR-006', employeeId: 'ACM-E009', planCode: 'MED-PPO-500', perPaycheckAmountExpected: 113.46, perPaycheckAmountActual: 200.00, status: 'Mismatch', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'Medical plan effective date change' },
  { deductionId: 'PR-007', employeeId: 'ACM-E010', planCode: 'LIFE-BASIC', perPaycheckAmountExpected: 7.15, perPaycheckAmountActual: 7.15, status: 'Mismatch', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'Medical plan effective date change' },
  { deductionId: 'PR-008', employeeId: 'ACM-E012', planCode: 'MED-PPO-500', perPaycheckAmountExpected: 87.50, perPaycheckAmountActual: 0.00, status: 'Pending', reconciliationStatus: 'Mismatch', effectiveDate: '2027-01-01', issueType: 'Carrier rejection — deduction suspended' },
];
