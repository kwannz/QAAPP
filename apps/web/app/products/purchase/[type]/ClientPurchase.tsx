'use client';

import dynamic from 'next/dynamic';
import type { ProductType } from '@/lib/contracts/addresses';

const ProductPurchaseClient = dynamic(
  () => import('@/components/products/ProductPurchase').then(m => m.ProductPurchase),
  { ssr: false, loading: () => <div className="text-sm text-muted-foreground">加载购买组件...</div> },
);

export function ClientPurchase({ productType }: { productType: ProductType }) {
  return <ProductPurchaseClient productType={productType} />;
}
