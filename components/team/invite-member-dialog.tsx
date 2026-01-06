'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRoleLabel, getRoleDescription } from '@/lib/permissions';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent: () => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInviteSent,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'USER' | 'MANAGER' | 'ACCOUNTANT' | 'OWNER'>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !role) {
      setError('Tous les champs sont requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'invitation');
      }

      // Reset form
      setEmail('');
      setRole('USER');
      onInviteSent();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      setError(error.message || 'Erreur lors de l\'invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
          <DialogDescription>
            Invitez un nouveau membre à rejoindre votre équipe. Une invitation
            sera envoyée par email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={role}
                onValueChange={(value: any) => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">
                    <div className="space-y-1">
                      <div className="font-medium">{getRoleLabel('USER')}</div>
                      <div className="text-xs text-muted-foreground">
                        {getRoleDescription('USER')}
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACCOUNTANT">
                    <div className="space-y-1">
                      <div className="font-medium">{getRoleLabel('ACCOUNTANT')}</div>
                      <div className="text-xs text-muted-foreground">
                        {getRoleDescription('ACCOUNTANT')}
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="MANAGER">
                    <div className="space-y-1">
                      <div className="font-medium">{getRoleLabel('MANAGER')}</div>
                      <div className="text-xs text-muted-foreground">
                        {getRoleDescription('MANAGER')}
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="OWNER">
                    <div className="space-y-1">
                      <div className="font-medium">{getRoleLabel('OWNER')}</div>
                      <div className="text-xs text-muted-foreground">
                        {getRoleDescription('OWNER')}
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 L'invitation sera valide pendant 7 jours. Le membre recevra un
                email avec un lien pour créer son compte.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <UserPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
