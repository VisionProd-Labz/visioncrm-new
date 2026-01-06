'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Loader2, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const emailAccountSchema = z.object({
  provider: z.enum(['RESEND', 'GMAIL', 'OUTLOOK', 'SMTP']),
  name: z.string().min(1, 'Nom requis').max(255),
  email: z.string().email('Email invalide'),
  api_key: z.string().optional(),
  smtp_host: z.string().optional(),
  smtp_port: z.string().optional(),
  smtp_user: z.string().optional(),
  smtp_password: z.string().optional(),
});

type EmailAccountForm = z.infer<typeof emailAccountSchema>;

interface AddEmailAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEmailAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEmailAccountDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmailAccountForm>({
    resolver: zodResolver(emailAccountSchema),
    defaultValues: {
      provider: 'RESEND',
      name: '',
      email: '',
      api_key: '',
    },
  });

  const selectedProvider = form.watch('provider');

  async function handleOAuthConnect(provider: 'GMAIL' | 'OUTLOOK') {
    setIsLoading(true);
    try {
      const endpoint = provider === 'GMAIL'
        ? '/api/email/oauth/gmail/authorize'
        : '/api/email/oauth/outlook/authorize';

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur lors de la connexion ${provider}`);
      }

      // Redirect to OAuth provider
      window.location.href = data.authUrl;
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : `Impossible de se connecter avec ${provider}`,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  async function onSubmit(data: EmailAccountForm) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/email/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: data.provider,
          name: data.name,
          email: data.email,
          access_token: data.api_key || undefined,
          smtp_config: data.provider === 'SMTP' ? {
            host: data.smtp_host,
            port: parseInt(data.smtp_port || '587'),
            user: data.smtp_user,
            password: data.smtp_password,
          } : undefined,
          connected: true, // Mark as connected if API key provided
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'ajout du compte');
      }

      toast({
        title: 'Compte ajouté',
        description: 'Le compte email a été configuré avec succès',
      });

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding email account:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'ajouter le compte',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un compte email</DialogTitle>
          <DialogDescription>
            Configurez un compte email pour envoyer des invitations et notifications
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Provider Selection */}
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fournisseur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RESEND">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Resend (Recommandé)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="GMAIL">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-red-600" />
                          <span>Gmail (OAuth requis)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="OUTLOOK">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span>Outlook (OAuth requis)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SMTP">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-600" />
                          <span>SMTP Personnalisé</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resend Info Alert */}
            {selectedProvider === 'RESEND' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Resend</strong> est gratuit pour 100 emails/jour.
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center text-primary hover:underline"
                  >
                    Créer un compte
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            {/* OAuth Connect Buttons */}
            {selectedProvider === 'GMAIL' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Connectez-vous avec votre compte Gmail pour envoyer des emails.</span>
                  <Button
                    type="button"
                    onClick={() => handleOAuthConnect('GMAIL')}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter avec Gmail
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {selectedProvider === 'OUTLOOK' && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Outlook OAuth sera disponible prochainement. Utilisez Gmail, Resend ou SMTP pour l'instant.
                </AlertDescription>
              </Alert>
            )}

            {/* Common Fields - Hide for OAuth providers */}
            {selectedProvider !== 'GMAIL' && selectedProvider !== 'OUTLOOK' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du compte</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Contact Principal" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom d'affichage pour identifier ce compte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@votreentreprise.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Email qui apparaîtra comme expéditeur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Resend API Key */}
            {selectedProvider === 'RESEND' && (
              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clé API Resend</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="re_..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Trouvez votre clé API dans{' '}
                      <a
                        href="https://resend.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Resend Dashboard → API Keys
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* SMTP Config */}
            {selectedProvider === 'SMTP' && (
              <>
                <FormField
                  control={form.control}
                  name="smtp_host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hôte SMTP</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtp_port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtp_user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="smtp_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              {/* Only show submit button for non-OAuth providers */}
              {selectedProvider !== 'GMAIL' && selectedProvider !== 'OUTLOOK' && (
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter le compte
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
