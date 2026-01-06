'use client';

import { useState } from 'react';
import { Send, Mail, MessageSquare, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface SendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'quote' | 'invoice';
  documentNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
}

type SendMethod = 'email' | 'whatsapp';

export function SendDialog({
  open,
  onOpenChange,
  type,
  documentNumber,
  clientName,
  clientEmail,
  clientPhone,
}: SendDialogProps) {
  const { t } = useLanguage();
  const [sendMethod, setSendMethod] = useState<SendMethod>('email');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState(
    type === 'quote'
      ? `Devis ${documentNumber}`
      : `Facture ${documentNumber}`
  );
  const [message, setMessage] = useState(
    type === 'quote'
      ? `Bonjour,\n\nVeuillez trouver ci-joint le devis ${documentNumber}.\n\nCordialement`
      : `Bonjour,\n\nVeuillez trouver ci-joint la facture ${documentNumber}.\n\nCordialement`
  );
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || '');
  const [recipientPhone, setRecipientPhone] = useState(clientPhone || '');

  const handleSend = async () => {
    setSending(true);

    // Simulate sending (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Sending via', sendMethod, {
      type,
      documentNumber,
      recipient: sendMethod === 'email' ? recipientEmail : recipientPhone,
      subject: sendMethod === 'email' ? subject : undefined,
      message,
    });

    setSending(false);
    setSent(true);

    // Reset and close after showing success
    setTimeout(() => {
      setSent(false);
      onOpenChange(false);
    }, 2000);
  };

  const handleCancel = () => {
    setSending(false);
    setSent(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Envoyer {type === 'quote' ? 'le devis' : 'la facture'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {documentNumber} - {clientName}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {!sent ? (
            <>
              {/* Send Method Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Méthode d'envoi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSendMethod('email')}
                    disabled={!clientEmail}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      sendMethod === 'email'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${!clientEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Mail className="h-5 w-5 mb-2 mx-auto text-primary" />
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {clientEmail || 'Pas d\'email'}
                    </p>
                  </button>
                  <button
                    onClick={() => setSendMethod('whatsapp')}
                    disabled={!clientPhone}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      sendMethod === 'whatsapp'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${!clientPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <MessageSquare className="h-5 w-5 mb-2 mx-auto text-primary" />
                    <p className="text-sm font-medium text-foreground">WhatsApp</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {clientPhone || 'Pas de téléphone'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Email Form */}
              {sendMethod === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Destinataire
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                      placeholder="email@exemple.fr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Objet
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      Le PDF du {type === 'quote' ? 'devis' : 'de la facture'} sera automatiquement joint à l'email
                    </p>
                  </div>
                </div>
              )}

              {/* WhatsApp Form */}
              {sendMethod === 'whatsapp' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      Le message sera envoyé via WhatsApp avec le lien de téléchargement du PDF
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!sending && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSend}
                    className="flex-1"
                    disabled={
                      (sendMethod === 'email' && !recipientEmail) ||
                      (sendMethod === 'whatsapp' && !recipientPhone)
                    }
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </div>
              )}

              {/* Sending State */}
              {sending && (
                <div className="py-8 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                  <div>
                    <p className="font-medium text-foreground">
                      Envoi en cours...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sendMethod === 'email'
                        ? 'Envoi de l\'email'
                        : 'Envoi du message WhatsApp'}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-lg">
                  Envoyé avec succès !
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {sendMethod === 'email'
                    ? `Email envoyé à ${recipientEmail}`
                    : `Message WhatsApp envoyé à ${recipientPhone}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
