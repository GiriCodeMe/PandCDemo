import { getStore } from '../db/FileStore';
import { Product } from '../db/schema';

export interface Plan {
  planId: string;
  productId: string;
  carrierId: string;
  name: string;
  planCode: string;
  network?: string;
  deductible?: number;
  outOfPocketMax?: number;
  copay?: number;
  coinsurance?: number;
  status?: string;
}

export interface PlanVersion {
  versionId: string;
  planId: string;
  versionNumber: string;
  effectiveDate: string;
  expiryDate: string | null;
  planSnapshot: Record<string, unknown>;
}

export interface RateTier {
  tierId: string;
  planId: string;
  planCode: string;
  versionId: string;
  tierType: string;
  monthlyPremium: number;
  employerContribution: number;
  employeeContribution: number;
}

export interface Carrier {
  carrierId: string;
  name: string;
  type: string;
  status?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
}

export const productService = {
  getAll(employerId?: string): Product[] {
    const all = getStore().readArray<Product>('products/products');
    if (employerId) return all.filter((p) => p.employerId === employerId);
    return all;
  },

  getById(productId: string): Product | undefined {
    return getStore().findOne<Product & Record<string, unknown>>(
      'products/products',
      'productId',
      productId,
    ) as Product | undefined;
  },

  getPlans(productId?: string): Plan[] {
    const all = getStore().readArray<Plan>('products/plans');
    if (productId) return all.filter((p) => p.productId === productId);
    return all;
  },

  getPlanVersions(planId?: string): PlanVersion[] {
    const all = getStore().readArray<PlanVersion>('products/planVersions');
    if (planId) return all.filter((v) => v.planId === planId);
    return all;
  },

  getRates(planId?: string): RateTier[] {
    const all = getStore().readArray<RateTier>('products/rates');
    if (planId) return all.filter((r) => r.planId === planId);
    return all;
  },
};

export const carrierService = {
  getAll(): Carrier[] {
    return getStore().readArray<Carrier>('integrations/carriers');
  },

  getById(carrierId: string): Carrier | undefined {
    return getStore().findOne<Carrier & Record<string, unknown>>(
      'integrations/carriers',
      'carrierId',
      carrierId,
    ) as Carrier | undefined;
  },
};
