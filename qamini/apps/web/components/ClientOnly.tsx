'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProperties {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback }: ClientOnlyProperties) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback || null;
  }

  return <>{children}</>;
}
