'use client';

import { useState } from 'react';
import { Sparkles, Users, FileText, Scale, TrendingUp, Package, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface AIAgent {
  id: string;
  nameKey: string;
  descKey: string;
  icon: React.ElementType;
  category: string;
  color: string;
}

export default function AIAssistantPage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'client_sales', key: 'ai.category.client_sales', color: 'bg-blue-500' },
    { id: 'legal', key: 'ai.category.legal', color: 'bg-purple-500' },
    { id: 'branding', key: 'ai.category.branding', color: 'bg-pink-500' },
    { id: 'commercial', key: 'ai.category.commercial', color: 'bg-green-500' },
    { id: 'products', key: 'ai.category.products', color: 'bg-orange-500' },
  ];

  const agents: AIAgent[] = [
    {
      id: 'master_agent',
      nameKey: 'ai.agent.master_agent',
      descKey: 'ai.agent.master_agent.desc',
      icon: Zap,
      category: 'all',
      color: 'text-yellow-500',
    },
    {
      id: 'client_manager',
      nameKey: 'ai.agent.client_manager',
      descKey: 'ai.agent.client_manager.desc',
      icon: Users,
      category: 'client_sales',
      color: 'text-blue-500',
    },
    {
      id: 'quote_expert',
      nameKey: 'ai.agent.quote_expert',
      descKey: 'ai.agent.quote_expert.desc',
      icon: FileText,
      category: 'client_sales',
      color: 'text-blue-500',
    },
    {
      id: 'legal_advisor',
      nameKey: 'ai.agent.legal_advisor',
      descKey: 'ai.agent.legal_advisor.desc',
      icon: Scale,
      category: 'legal',
      color: 'text-purple-500',
    },
    {
      id: 'brand_strategist',
      nameKey: 'ai.agent.brand_strategist',
      descKey: 'ai.agent.brand_strategist.desc',
      icon: Sparkles,
      category: 'branding',
      color: 'text-pink-500',
    },
    {
      id: 'sales_optimizer',
      nameKey: 'ai.agent.sales_optimizer',
      descKey: 'ai.agent.sales_optimizer.desc',
      icon: TrendingUp,
      category: 'commercial',
      color: 'text-green-500',
    },
    {
      id: 'catalog_manager',
      nameKey: 'ai.agent.catalog_manager',
      descKey: 'ai.agent.catalog_manager.desc',
      icon: Package,
      category: 'products',
      color: 'text-orange-500',
    },
  ];

  const filteredAgents = selectedCategory
    ? agents.filter(agent => agent.category === selectedCategory || agent.category === 'all')
    : agents;

  const handleAgentClick = (agentId: string) => {
    window.location.href = `/ai-assistant/${agentId}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{t('ai.agents.title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('ai.agents.subtitle')}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          {t('ai.all_agents')}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            size="sm"
            className="gap-2"
          >
            <div className={cn('w-2 h-2 rounded-full', category.color)} />
            {t(category.key)}
          </Button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => {
          const Icon = agent.icon;
          const category = categories.find(c => c.id === agent.category);

          return (
            <Card
              key={agent.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleAgentClick(agent.id)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={cn('p-3 rounded-lg bg-muted group-hover:scale-110 transition-transform', agent.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {category && (
                    <div className={cn('w-3 h-3 rounded-full', category.color)} />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {t(agent.nameKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(agent.descKey)}
                  </p>
                </div>

                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {t('ai.chat_with_agent')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('ai.no_agents')}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
        <div className="flex items-start gap-4">
          <MessageSquare className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t('ai.help.title')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('ai.help.description')}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('ai.help.feature1')}</li>
              <li>{t('ai.help.feature2')}</li>
              <li>{t('ai.help.feature3')}</li>
              <li>{t('ai.help.feature4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
