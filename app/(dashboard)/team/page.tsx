'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import { InviteMemberDialog } from '@/components/team/invite-member-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getRoleLabel } from '@/lib/permissions';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'USER';
  avatar_url?: string;
  created_at: string;
  mfa_enabled: boolean;
  stats: {
    tasks: number;
    activities: number;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export default function TeamPage() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

  useEffect(() => {
    fetchMembers();
    fetchInvitations();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/team');

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/team/invitations');

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      setInvitations(data.invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erreur lors de la suppression du membre');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invitations?id=${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invitation');
      }

      await fetchInvitations();
    } catch (error) {
      console.error('Error canceling invitation:', error);
      alert('Erreur lors de l\'annulation de l\'invitation');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500 text-white';
      case 'OWNER':
        return 'bg-blue-500 text-white';
      case 'MANAGER':
        return 'bg-green-500 text-white';
      case 'ACCOUNTANT':
        return 'bg-orange-500 text-white';
      case 'USER':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInviteSent={() => {
          fetchInvitations();
          setInviteDialogOpen(false);
        }}
      />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('team.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('team.subtitle')}
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('team.invite_member')}
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('team.tab.members')}
                <Badge variant="secondary">{members.length}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'invitations'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('team.tab.invitations')}
                {invitations.length > 0 && (
                  <Badge variant="default">{invitations.length}</Badge>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {getRoleLabel(member.role as any)}
                        </Badge>
                        {member.mfa_enabled && (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="w-3 h-3" />
                            MFA
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {member.email}
                      </p>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4" />
                          <span>{member.stats.tasks} tâches</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            Depuis{' '}
                            {new Date(member.created_at).toLocaleDateString('fr-FR', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier le rôle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Retirer de l'équipe
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {members.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun membre dans l'équipe
                </p>
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-500" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {invitation.email}
                        </h3>
                        <Badge className={getRoleBadgeColor(invitation.role)}>
                          {getRoleLabel(invitation.role as any)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Envoyée le{' '}
                          {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div>
                          Expire le{' '}
                          {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              </div>
            ))}

            {invitations.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucune invitation en attente
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
