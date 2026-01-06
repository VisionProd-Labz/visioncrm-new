'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Save,
  History,
  Download,
  Trash2,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  agentId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const agentInfo: Record<string, { name: string; desc: string; color: string }> = {
  master_agent: {
    name: 'Master Agent',
    desc: 'Coordonne tous les agents et vous aide à trouver le bon assistant',
    color: 'text-yellow-500',
  },
  client_manager: {
    name: 'Gestionnaire Clients',
    desc: 'Gestion des relations clients et suivi',
    color: 'text-blue-500',
  },
  quote_expert: {
    name: 'Expert Devis',
    desc: 'Création et optimisation des devis',
    color: 'text-blue-500',
  },
  legal_advisor: {
    name: 'Conseiller Juridique',
    desc: 'Conformité et assistance légale',
    color: 'text-purple-500',
  },
  brand_strategist: {
    name: 'Stratège Branding',
    desc: 'Stratégie de marque et communication',
    color: 'text-pink-500',
  },
  sales_optimizer: {
    name: 'Optimiseur Commercial',
    desc: 'Analyse et optimisation des ventes',
    color: 'text-green-500',
  },
  catalog_manager: {
    name: 'Gestionnaire Catalogue',
    desc: 'Gestion et analyse du catalogue produits',
    color: 'text-orange-500',
  },
};

export default function AgentChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Mock saved conversations from localStorage
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Load conversations from localStorage
    const saved = localStorage.getItem(`conversations_${agentId}`);
    if (saved) {
      setSavedConversations(JSON.parse(saved));
    }

    // Start new conversation by default
    startNewConversation();
  }, [agentId]);

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      agentId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentConversation(newConversation);
  };

  const saveConversation = () => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      return;
    }

    const updated = [...savedConversations];
    const existingIndex = updated.findIndex(c => c.id === currentConversation.id);

    // Generate title from first message if still "Nouvelle conversation"
    if (currentConversation.title === 'Nouvelle conversation' && currentConversation.messages.length > 0) {
      currentConversation.title = currentConversation.messages[0].content.substring(0, 50) + '...';
    }

    currentConversation.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      updated[existingIndex] = currentConversation;
    } else {
      updated.unshift(currentConversation);
    }

    setSavedConversations(updated);
    localStorage.setItem(`conversations_${agentId}`, JSON.stringify(updated));
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setShowHistory(false);
  };

  const deleteConversation = (conversationId: string) => {
    const updated = savedConversations.filter(c => c.id !== conversationId);
    setSavedConversations(updated);
    localStorage.setItem(`conversations_${agentId}`, JSON.stringify(updated));

    if (currentConversation?.id === conversationId) {
      startNewConversation();
    }
  };

  const exportConversation = () => {
    if (!currentConversation) return;

    const data = JSON.stringify(currentConversation, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${currentConversation.id}.json`;
    a.click();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    setCurrentConversation({
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
    });
    setMessageInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let aiContent = '';

      // Master Agent has special routing logic
      if (agentId === 'master_agent') {
        const lowerContent = userMessage.content.toLowerCase();

        if (lowerContent.includes('devis') || lowerContent.includes('quote')) {
          aiContent = `D'après votre question sur les devis, je vous recommande de parler avec l'**Expert Devis**. \n\nCependant, je peux vous aider directement:\n\n${userMessage.content}\n\nPour créer un devis, vous pouvez:\n1. Aller dans l'onglet Devis\n2. Cliquer sur "Nouveau devis"\n3. Ou discuter avec l'Expert Devis pour des conseils personnalisés\n\nSouhaitez-vous que je vous redirige vers l'Expert Devis?`;
        } else if (lowerContent.includes('client') || lowerContent.includes('contact')) {
          aiContent = `Je détecte que votre question concerne la gestion des clients. Le **Gestionnaire Clients** est spécialisé dans ce domaine.\n\nJe peux quand même vous aider:\n\n${userMessage.content}\n\nVoulez-vous que je vous connecte au Gestionnaire Clients pour une assistance plus spécialisée?`;
        } else if (lowerContent.includes('juridique') || lowerContent.includes('legal') || lowerContent.includes('contrat')) {
          aiContent = `Cette question semble relever du domaine juridique. Le **Conseiller Juridique** pourra vous fournir une assistance détaillée.\n\nEn attendant, voici une réponse générale:\n\n${userMessage.content}\n\nSouhaitez-vous consulter le Conseiller Juridique?`;
        } else if (lowerContent.includes('vente') || lowerContent.includes('commercial') || lowerContent.includes('chiffre')) {
          aiContent = `Votre question concerne l'aspect commercial. L'**Optimiseur Commercial** est l'expert pour ce type de questions.\n\nVoici ce que je peux vous dire:\n\n${userMessage.content}\n\nVoulez-vous que je vous mette en relation avec l'Optimiseur Commercial?`;
        } else if (lowerContent.includes('catalogue') || lowerContent.includes('produit') || lowerContent.includes('stock')) {
          aiContent = `Je vois que vous avez une question sur le catalogue ou les produits. Le **Gestionnaire Catalogue** est parfait pour ça!\n\n${userMessage.content}\n\nSouhaitez-vous parler avec le Gestionnaire Catalogue?`;
        } else if (lowerContent.includes('marque') || lowerContent.includes('marketing') || lowerContent.includes('communication')) {
          aiContent = `Cette question relève du branding et du marketing. Le **Stratège Branding** sera ravi de vous aider!\n\n${userMessage.content}\n\nVoulez-vous que je vous connecte au Stratège Branding?`;
        } else {
          aiContent = `Bonjour! Je suis le Master Agent, votre coordinateur IA. \n\nVous avez dit: "${userMessage.content}"\n\nJe coordonne 6 agents spécialisés:\n\n🔵 **Gestionnaire Clients** - Relations clients et suivi\n🔵 **Expert Devis** - Création et optimisation de devis\n🟣 **Conseiller Juridique** - Conformité et assistance légale\n🟠 **Gestionnaire Catalogue** - Gestion du catalogue produits\n🟢 **Optimiseur Commercial** - Analyse et optimisation des ventes\n🌸 **Stratège Branding** - Stratégie de marque\n\nComment puis-je vous aider? Voulez-vous que je vous dirige vers un agent spécifique?`;
        }
      } else {
        aiContent = `Je suis ${agentInfo[agentId]?.name || 'votre assistant'}. Voici ma réponse à votre question: "${userMessage.content}". \n\nJe peux vous aider avec ${agentInfo[agentId]?.desc || 'diverses tâches'}. N'hésitez pas à me poser d'autres questions!`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      };

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage],
      } : null);
      setLoading(false);
    }, 1500);
  };

  const agent = agentInfo[agentId];

  if (!agent) {
    return (
      <div className="p-6">
        <p>Agent non trouvé</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/ai-assistant')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className={`h-5 w-5 ${agent.color}`} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{agent.name}</h2>
              <p className="text-xs text-muted-foreground">{agent.desc}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            En ligne
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4 mr-2" />
            Historique
          </Button>
          <Button variant="outline" size="sm" onClick={saveConversation}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button variant="outline" size="sm" onClick={exportConversation}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={startNewConversation}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 border-r border-border bg-card overflow-y-auto">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Conversations sauvegardées</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {savedConversations.length} conversation(s)
              </p>
            </div>
            <div className="p-2">
              {savedConversations.length > 0 ? (
                savedConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                      currentConversation?.id === conv.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => loadConversation(conv)}
                      >
                        <p className="font-medium text-sm text-foreground truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conv.messages.length} message(s)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune conversation sauvegardée
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
            {currentConversation && currentConversation.messages.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className={`h-16 w-16 mx-auto mb-4 ${agent.color}`} />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Bonjour! Je suis {agent.name}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {agent.desc}. Comment puis-je vous aider aujourd'hui?
                </p>
              </div>
            )}

            {currentConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className={`h-4 w-4 ${agent.color}`} />
                      <span className="text-xs font-semibold">{agent.name}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 ${agent.color} animate-pulse`} />
                    <span className="text-sm text-muted-foreground">
                      {agent.name} réfléchit...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input
                placeholder="Posez votre question..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                disabled={loading}
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim() || loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Appuyez sur Entrée pour envoyer • Les conversations sont sauvegardées automatiquement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
