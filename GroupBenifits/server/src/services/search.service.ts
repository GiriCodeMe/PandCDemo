import { getStore } from '../db/FileStore';
import { SearchResult, Employer, Employee, Product } from '../db/schema';

export const searchService = {
  search(query: string, limit = 20): SearchResult[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Employers
    getStore().readArray<Employer>('employers/employers').forEach(e => {
      if (e.name.toLowerCase().includes(q) || e.employerId.toLowerCase().includes(q)) {
        results.push({ id: e.employerId, type: 'employer', name: e.name, subtitle: e.industry + ' — ' + e.numberOfEmployees + ' employees', href: '/employers/' + e.employerId, metadata: { status: e.status } });
      }
    });

    // Employees (mask SSN, never expose)
    getStore().readArray<Employee>('employees/employees').forEach(e => {
      const fullName = e.firstName + ' ' + e.lastName;
      if (fullName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) {
        results.push({ id: e.employeeId, type: 'employee', name: fullName, subtitle: e.department + ' — ' + e.location, href: '/employees/' + e.employeeId, metadata: { employmentStatus: e.employmentStatus, eligibilityStatus: e.eligibilityStatus } });
      }
    });

    // Products
    getStore().readArray<Product>('products/products').forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)) {
        results.push({ id: p.productId, type: 'product', name: p.name, subtitle: p.type + ' — ' + p.status, href: '/products/' + p.productId, metadata: { type: p.type } });
      }
    });

    return results.slice(0, limit);
  },
};
