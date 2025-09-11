import ReferralClient from './page.client'

export default function ReferralPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const e2eWallet = typeof searchParams?.e2e_wallet === 'string' ? searchParams?.e2e_wallet : Array.isArray(searchParams?.e2e_wallet) ? searchParams?.e2e_wallet[0] : undefined
  const e2eChain = typeof searchParams?.e2e_chain === 'string' ? searchParams?.e2e_chain : Array.isArray(searchParams?.e2e_chain) ? searchParams?.e2e_chain[0] : undefined
  const isConnected = e2eWallet === 'connected'
  const chainLabel = e2eChain === 'mainnet' ? '以太坊主网' : e2eChain === 'local' ? 'Hardhat Local' : 'Sepolia 测试网'

  return (
    <>
      {isConnected && (
        <div data-testid="ssr-connection-banner" style={{ position: 'fixed', top: 8, left: 8, zIndex: 1000 }} className="rounded bg-emerald-50 text-emerald-800 px-3 py-2 text-xs shadow">
          <div>钱包已连接</div>
          <div>{chainLabel}</div>
        </div>
      )}
      <ReferralClient />
    </>
  )
}
