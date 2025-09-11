'use client';

import type { ProductType } from '@/lib/contracts/addresses';
import { ProductPurchase } from '@/components/products/ProductPurchase';

export function ClientPurchase({ productType }: { productType: ProductType }) {
  return <ProductPurchase productType={productType} />;
}
