'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, BarChart3, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent: 'assistant' | 'analyst' | 'writer';
  timestamp: Date;
}

const agentIcons = {
  assistant: Bot,
  analyst: BarChart3,
  writer: FileText,
};

export default function AssistantPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<'assistant' | 'analyst' | 'writer'>('assistant');
  const [quota, setQuota] = useState({ used: 0, limit: 50, remaining: 50 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentLabels = {
    assistant: t('assistant.agent.general'),
    analyst: t('assistant.agent.analyst'),
    writer: t('assistant.agent.writer'),
  };

  const agentDescriptions = {
    assistant: t('assistant.agent.general.desc'),
    analyst: t('assistant.agent.analyst.desc'),
    writer: t('assistant.agent.writer.desc'),
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchQuota = async () => {
    try {
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        setQuota(data.quota);
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      agent: selectedAgent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          agent: selectedAgent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération de la réponse');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        agent: selectedAgent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update quota
      if (data.remaining !== undefined) {
        setQuota((prev) => ({
          ...prev,
          used: prev.limit - data.remaining,
          remaining: data.remaining,
        }));
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${error.message}`,
        agent: selectedAgent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const AgentIcon = agentIcons[selectedAgent];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-none pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('assistant.title')}</h1>
            <p className="text-muted-foreground">
              {t('assistant.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {quota.remaining}/{quota.limit} {t('assistant.messages_remaining')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Agent Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{t('assistant.choose_agent')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.keys(agentLabels) as Array<keyof typeof agentLabels>).map((agent) => {
                const Icon = agentIcons[agent];
                const isSelected = selectedAgent === agent;

                return (
                  <button
                    key={agent}
                    onClick={() => setSelectedAgent(agent)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {agentLabels[agent]}
                      </span>
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {agentDescriptions[agent]}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-none border-b">
              <div className="flex items-center gap-2">
                <AgentIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  {agentLabels[selectedAgent]}
                </CardTitle>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <AgentIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {agentDescriptions[selectedAgent]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('assistant.start_conversation')}
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const MessageIcon = agentIcons[message.agent];

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary' : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-primary-foreground text-sm font-medium">
                          U
                        </span>
                      ) : (
                        <MessageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-none w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <AgentIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="flex-none border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('assistant.placeholder')}
                  disabled={isLoading || quota.remaining === 0}
                  className="resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading || quota.remaining === 0}
                  className="flex-none"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {quota.remaining === 0 && (
                <p className="text-xs text-destructive mt-2">
                  {t('assistant.quota_reached')}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {t('assistant.input_help')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
