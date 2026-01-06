'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Star,
  Archive,
  Trash2,
  Search,
  Plus,
  Paperclip,
  Reply,
  Forward,
  MoreVertical,
  RefreshCw,
  Settings,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import { AddEmailAccountDialog } from '@/components/email/add-email-account-dialog';

type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'starred' | 'archive' | 'trash';
type EmailProvider = 'gmail' | 'outlook' | 'icloud' | null;

interface EmailAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'icloud';
  email: string;
  name: string;
  connected: boolean;
}

interface Email {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  folder: EmailFolder;
  attachments?: Array<{
    name: string;
    size: string;
  }>;
}

export default function EmailPage() {
  const { t } = useLanguage();
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmailAccounts();
  }, []);

  useEffect(() => {
    if (emailAccounts.length > 0) {
      fetchEmails();
    }
  }, [selectedFolder, searchQuery, emailAccounts]);

  const fetchEmailAccounts = async () => {
    try {
      const response = await fetch('/api/email/accounts');

      if (!response.ok) {
        throw new Error('Failed to fetch email accounts');
      }

      const data = await response.json();

      // Transform API accounts to component format
      const transformedAccounts: EmailAccount[] = data.accounts.map((acc: any) => ({
        id: acc.id,
        provider: acc.provider.toLowerCase() as 'gmail' | 'outlook' | 'icloud',
        email: acc.email,
        name: acc.name,
        connected: acc.connected,
      }));

      setEmailAccounts(transformedAccounts);
    } catch (error) {
      console.error('Error fetching email accounts:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      params.append('folder', selectedFolder.toUpperCase());
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/email/messages?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();

      // Transform API emails to component format
      const transformedEmails: Email[] = data.emails.map((email: any) => ({
        id: email.id,
        from: {
          name: email.from_name,
          email: email.from_email,
        },
        to: email.to_emails,
        subject: email.subject,
        body: email.body,
        date: email.created_at,
        read: email.read,
        starred: email.starred,
        hasAttachment: email.attachments && Object.keys(email.attachments).length > 0,
        folder: email.folder.toLowerCase() as EmailFolder,
        attachments: email.attachments || [],
      }));

      setEmails(transformedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.read).length;

  const formatDate = (date: string) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return emailDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return t('email.yesterday');
    } else {
      return emailDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }
  };

  const selectedEmailData = selectedEmail ? emails.find(e => e.id === selectedEmail) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('email.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('email.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAccountSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            {t('email.accounts')}
          </Button>
          <Button onClick={() => setComposing(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('email.new_message')}
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">{t('email.connected_accounts')}:</span>
        {emailAccounts.map(account => (
          <Badge key={account.id} variant="outline" className="gap-2">
            <div className={`w-2 h-2 rounded-full ${account.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
            {account.email}
          </Badge>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Sidebar */}
        <div className="col-span-3 bg-card border border-border rounded-lg p-4 space-y-2">
          <Button
            variant={selectedFolder === 'inbox' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder('inbox')}
          >
            <Inbox className="mr-2 h-4 w-4" />
            {t('email.folder.inbox')}
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={selectedFolder === 'starred' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder('starred')}
          >
            <Star className="mr-2 h-4 w-4" />
            {t('email.folder.starred')}
          </Button>
          <Button
            variant={selectedFolder === 'sent' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder('sent')}
          >
            <Send className="mr-2 h-4 w-4" />
            {t('email.folder.sent')}
          </Button>
          <Button
            variant={selectedFolder === 'drafts' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder('drafts')}
          >
            <Mail className="mr-2 h-4 w-4" />
            {t('email.folder.drafts')}
          </Button>
          <Button
            variant={selectedFolder === 'archive' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder('archive')}
          >
            <Archive className="mr-2 h-4 w-4" />
            {t('email.folder.archive')}
          </Button>
          <Button
            variant={selectedFolder === 'trash' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder('trash')}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('email.folder.trash')}
          </Button>
        </div>

        {/* Email List */}
        <div className="col-span-4 bg-card border border-border rounded-lg flex flex-col">
          {/* Search & Actions */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('email.search_placeholder')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Emails */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email.id)}
                  className={`w-full p-4 border-b border-border hover:bg-muted/50 transition-colors text-left ${
                    selectedEmail === email.id ? 'bg-muted' : ''
                  } ${!email.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium text-foreground truncate ${!email.read ? 'font-bold' : ''}`}>
                          {email.from.name}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className={`text-sm truncate mb-1 ${!email.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {email.body.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {email.starred && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                        {email.hasAttachment && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {t('email.no_emails')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail */}
        <div className="col-span-5 bg-card border border-border rounded-lg flex flex-col">
          {selectedEmailData ? (
            <>
              {/* Email Header */}
              <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-foreground pr-4">
                    {selectedEmailData.subject}
                  </h2>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Star className={selectedEmailData.starred ? 'text-yellow-500 fill-yellow-500' : ''} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {selectedEmailData.from.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {selectedEmailData.from.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmailData.from.email}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedEmailData.date).toLocaleString('fr-FR')}
                  </span>
                </div>

                {selectedEmailData.attachments && selectedEmailData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {t('email.attachments')} ({selectedEmailData.attachments.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmailData.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-foreground">
                    {selectedEmailData.body}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-border flex gap-2">
                <Button variant="outline">
                  <Reply className="mr-2 h-4 w-4" />
                  {t('email.reply')}
                </Button>
                <Button variant="outline">
                  <Forward className="mr-2 h-4 w-4" />
                  {t('email.forward')}
                </Button>
                <Button variant="outline">
                  <Archive className="mr-2 h-4 w-4" />
                  {t('email.archive')}
                </Button>
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('email.delete')}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('email.select_email')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('email.select_email_desc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-3xl w-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{t('email.new_message')}</h3>
              <Button variant="ghost" size="icon" onClick={() => setComposing(false)}>
                <span>×</span>
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('email.compose.to')}
                </label>
                <Input placeholder={t('email.compose.to_placeholder')} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('email.compose.subject')}
                </label>
                <Input placeholder={t('email.compose.subject_placeholder')} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('email.compose.message')}
                </label>
                <textarea
                  rows={10}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
                  placeholder={t('email.compose.message_placeholder')}
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="outline">
                  <Paperclip className="mr-2 h-4 w-4" />
                  {t('email.compose.attach')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setComposing(false)}>
                    {t('email.compose.cancel')}
                  </Button>
                  <Button onClick={() => setComposing(false)}>
                    <Send className="mr-2 h-4 w-4" />
                    {t('email.compose.send')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Email Account Dialog */}
      <AddEmailAccountDialog
        open={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
        onSuccess={() => {
          fetchEmailAccounts();
        }}
      />

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('email.settings.title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('email.settings.subtitle')}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAccountSettings(false)}>
                <span>×</span>
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {emailAccounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      account.provider === 'gmail' ? 'bg-red-100 dark:bg-red-900/20' :
                      account.provider === 'outlook' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Mail className={`h-6 w-6 ${
                        account.provider === 'gmail' ? 'text-red-600' :
                        account.provider === 'outlook' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${account.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs text-muted-foreground">
                          {account.connected ? t('email.settings.connected') : t('email.settings.disconnected')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('email.settings.configure')}
                  </Button>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowAccountSettings(false);
                    setShowAddAccountDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('email.settings.add_account')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
