'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface ApproveExpenseButtonProps {
  expenseId: string;
}

export function ApproveExpenseButton({ expenseId }: ApproveExpenseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette dépense ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/accounting/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Une erreur est survenue');
      }

      router.refresh();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleApprove} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="mr-2 h-4 w-4" />
      )}
      Approuver
    </Button>
  );
}
