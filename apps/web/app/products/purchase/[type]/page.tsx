import { notFound } from 'next/navigation';
import { ClientPurchase } from './ClientPurchase';
import { Header } from '@/components/layout/Header';
import { ProductType } from '@/lib/contracts/addresses';
import { logger } from '@/lib/verbose-logger';

function mapSlugToProductType(slug: string): ProductType | null {
  switch (slug.toLowerCase()) {
    case 'silver':
      return ProductType.SILVER;
    case 'gold':
      return ProductType.GOLD;
    case 'diamond':
      return ProductType.DIAMOND;
    case 'platinum':
      return ProductType.PLATINUM;
    default:
      return null;
  }
}

export default async function PurchasePage({ params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params;
    const productType = mapSlugToProductType(type);
    if (productType === null) return notFound();

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-3xl mx-auto rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b">
                <h2 className="text-xl font-semibold">产品购买</h2>
              </div>
              <div className="p-6">
                <ClientPurchase productType={productType} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    logger.error('PurchasePage', 'render error', error as any);
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-3xl mx-auto rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b">
                <h2 className="text-xl font-semibold">产品购买</h2>
              </div>
              <div className="p-6">
                <div className="p-4 rounded border border-red-200 bg-red-50 text-sm">页面加载失败，请刷新重试。</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
