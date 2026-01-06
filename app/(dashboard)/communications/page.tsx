'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, User, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

type Platform = 'whatsapp' | 'telegram' | 'all';

interface Message {
  id: string;
  platform: 'whatsapp' | 'telegram';
  contact: {
    name: string;
    phone: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'delivered' | 'read' | 'sent';
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'me' | 'them';
  status?: 'delivered' | 'read' | 'sent';
}

export default function CommunicationsPage() {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [selectedPlatform, searchQuery]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (selectedPlatform !== 'all') {
        params.append('platform', selectedPlatform.toUpperCase());
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/communications/conversations?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();

      // Transform API conversations to component format
      const transformedConversations: Message[] = data.conversations.map((conv: any) => ({
        id: conv.id,
        platform: conv.platform.toLowerCase() as 'whatsapp' | 'telegram',
        contact: {
          name: conv.contact_name,
          phone: conv.contact_phone,
        },
        lastMessage: conv.last_message || '',
        timestamp: conv.last_message_at || conv.created_at,
        unread: conv.unread_count,
        status: conv.unread_count > 0 ? 'delivered' : 'read',
      }));

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/communications/conversations/${conversationId}/messages`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      // Transform API messages to component format
      const transformedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.created_at,
        sender: msg.sender.toLowerCase() as 'me' | 'them',
        status: msg.status?.toLowerCase() as 'delivered' | 'read' | 'sent',
      }));

      setChatMessages(prev => ({
        ...prev,
        [conversationId]: transformedMessages,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesPlatform = selectedPlatform === 'all' || conv.platform === selectedPlatform;
    const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.contact.phone.includes(searchQuery);
    return matchesPlatform && matchesSearch;
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/communications/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageInput,
          sender: 'ME',
          status: 'SENT',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Refresh messages
      await fetchMessages(selectedConversation);

      // Reset input
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('communications.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('communications.subtitle')}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('communications.new_conversation')}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="col-span-4 bg-card border border-border rounded-lg flex flex-col">
          {/* Platform Filter */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('communications.search_placeholder')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('all')}
                className="flex-1"
              >
                {t('communications.platform.all')}
              </Button>
              <Button
                variant={selectedPlatform === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('whatsapp')}
                className="flex-1"
              >
                {t('communications.platform.whatsapp')}
              </Button>
              <Button
                variant={selectedPlatform === 'telegram' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('telegram')}
                className="flex-1"
              >
                {t('communications.platform.telegram')}
              </Button>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-border hover:bg-muted/50 transition-colors text-left ${
                  selectedConversation === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {conv.platform === 'whatsapp' ? (
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    ) : (
                      <Send className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground truncate">
                        {conv.contact.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {conv.contact.phone}
                      </span>
                      {conv.unread > 0 && (
                        <Badge variant="default" className="h-5 px-2">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-8 bg-card border border-border rounded-lg flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {conversations.find(c => c.id === selectedConversation)?.contact.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversations.find(c => c.id === selectedConversation)?.contact.phone}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {t('communications.call')}
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages[selectedConversation]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.sender === 'me' && msg.status && (
                          <span className="text-xs opacity-70">
                            {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓' : '•'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('communications.message_placeholder')}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('communications.select_conversation')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('communications.select_conversation_desc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
