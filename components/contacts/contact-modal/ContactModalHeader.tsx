/**
 * Contact Modal Header Component
 * Displays contact info and actions in modal header
 */

import { X, Building2, Star } from 'lucide-react';
import { KryptonButton } from '@/components/ui/krypton';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  is_vip: boolean;
}

interface ContactModalHeaderProps {
  mode: 'create' | 'view' | 'edit';
  contact?: Contact | null;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
}

export function ContactModalHeader({
  mode,
  contact,
  isEditing,
  onEdit,
  onClose,
}: ContactModalHeaderProps) {
  return (
    <div className="relative px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {mode === 'create' ? (
            <h2 className="text-2xl font-bold text-foreground">Nouveau Contact</h2>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="text-lg font-bold text-primary">
                  {contact?.first_name?.[0]}{contact?.last_name?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {contact?.first_name} {contact?.last_name}
                </h2>
                {contact?.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {contact.company}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mode === 'view' && !isEditing && (
            <KryptonButton
              variant="secondary"
              size="sm"
              onClick={onEdit}
            >
              Modifier
            </KryptonButton>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* VIP Badge */}
      {contact?.is_vip && mode !== 'create' && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full text-sm font-medium border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-current" />
            Contact VIP
          </span>
        </div>
      )}
    </div>
  );
}
