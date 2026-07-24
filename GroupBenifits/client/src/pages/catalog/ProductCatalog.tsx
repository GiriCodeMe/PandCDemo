import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Shield, Eye, Briefcase, DollarSign, Activity } from 'lucide-react';
import { productsApi, carriersApi } from '../../api/products';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import type { Product } from '../../types';

const PRODUCT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Medical: Heart,
  Dental: Shield,
  Vision: Eye,
  Life: Briefcase,
  STD: Activity,
  LTD: Activity,
  HSA: DollarSign,
  FSA: DollarSign,
};

const PRODUCT_COLORS: Record<string, string> = {
  Medical: 'bg-red-50 text-red-600',
  Dental: 'bg-blue-50 text-blue-600',
  Vision: 'bg-purple-50 text-purple-600',
  Life: 'bg-amber-50 text-amber-600',
  STD: 'bg-teal-50 text-teal-600',
  LTD: 'bg-teal-50 text-teal-600',
  HSA: 'bg-green-50 text-green-600',
  FSA: 'bg-green-50 text-green-600',
};

function ProductIcon({ type }: { type: string }) {
  const Icon = PRODUCT_ICONS[type] ?? Briefcase;
  const colorClass = PRODUCT_COLORS[type] ?? 'bg-gray-100 text-gray-600';
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

function statusVariant(status: string): 'success' | 'error' | 'default' {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'inactive': case 'terminated': return 'error';
    default: return 'default';
  }
}

const PRODUCT_TYPES = ['All', 'Medical', 'Dental', 'Vision', 'Life', 'STD', 'LTD', 'HSA', 'FSA'];

export default function ProductCatalog() {
  const [filter, setFilter] = useState('All');

  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list('ACM-001'),
    staleTime: 60_000,
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: carriersApi.list,
    staleTime: 60_000,
  });

  const carrierMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    carriers?.forEach((c) => { map[c.carrierId] = c.name; });
    return map;
  }, [carriers]);

  const filtered = filter === 'All' ? products : products?.filter((p) => p.type === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-500 text-sm mt-1">Benefit products offered to Acme Corporation employees</p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRODUCT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === t ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-48">
          <p className="text-red-600 text-sm">{(error as Error)?.message ?? 'Failed to load products'}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered?.map((product) => (
            <Card key={product.productId} className="hover:border-brand-300 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <ProductIcon type={product.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h2>
                      <Badge variant={statusVariant(product.status)}>{product.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{product.productId}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Carrier</dt>
                    <dd className="text-gray-700 font-medium">{carrierMap[product.carrierId] ?? product.carrierId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="text-gray-700">{product.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Effective</dt>
                    <dd className="text-gray-700">{product.effectiveDate}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered?.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          No products match the selected filter
        </div>
      )}
    </div>
  );
}
