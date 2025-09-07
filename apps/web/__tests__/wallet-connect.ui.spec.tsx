/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WalletConnect } from '../../../packages/ui/src/components/business/WalletConnect';

describe('WalletConnect UI (disconnected)', () => {
  it('renders connect wallet button text', () => {
    render(
      <WalletConnect
        isConnected={false}
        loading={false}
        onConnect={() => {}}
      />
    );

    // Button labeled 连接钱包 is present
    expect(screen.getAllByText('连接钱包').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument();
  });
});
