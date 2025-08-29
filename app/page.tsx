'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to polls dashboard
    router.push('/polls');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center space-x-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Redirecting to polls...</span>
      </div>
    </div>
  );
}
