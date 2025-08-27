'use client'

import { InvestmentDashboard } from '@/components/dashboard/InvestmentDashboard'
import { Header } from '@/components/layout/Header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function EarningsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <InvestmentDashboard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}