import { getStore } from '../db/FileStore';
import { Employee } from '../db/schema';

export interface Dependent {
  dependentId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dob: string;
  ssn: string;
  relationship: string;
  status: string;
}

export const employeeService = {
  getAll(employerId?: string): Employee[] {
    const all = getStore().readArray<Employee>('employees/employees');
    if (employerId) return all.filter((e) => e.employerId === employerId);
    return all;
  },

  getById(employeeId: string): Employee | undefined {
    return getStore().findOne<Employee & Record<string, unknown>>(
      'employees/employees',
      'employeeId',
      employeeId,
    ) as Employee | undefined;
  },

  getDependents(employeeId: string): Dependent[] {
    const all = getStore().readArray<Dependent>('employees/dependents');
    return all.filter((d) => d.employeeId === employeeId);
  },

  search(query: string, employerId?: string): Employee[] {
    const list = this.getAll(employerId);
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        (e.department ?? '').toLowerCase().includes(q),
    );
  },
};
