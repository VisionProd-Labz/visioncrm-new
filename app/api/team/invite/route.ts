import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantId } from '@/lib/tenant';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmailViaAccount, hasEmailConfigured } from '@/lib/send-email-via-account';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['USER', 'MANAGER', 'ACCOUNTANT', 'OWNER']),
});

// POST /api/team/invite - Invite a new team member
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 });
    }

    // Check if email account is configured
    const emailConfigured = await hasEmailConfigured(tenantId);
    if (!emailConfigured) {
      return NextResponse.json(
        {
          error: 'Configuration email requise',
          message: 'Veuillez d\'abord configurer un compte email dans Paramètres → Email',
          code: 'EMAIL_NOT_CONFIGURED'
        },
        { status: 428 } // 428 Precondition Required
      );
    }

    // Check if user has permission to invite (OWNER or MANAGER)
    const currentUser = await prisma.user.findFirst({
      where: {
        email: session.user.email!,
        tenantId: tenantId,
      },
    });

    if (!currentUser || !['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'inviter des membres' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = inviteSchema.parse(body);

    // Check if user already exists in tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId: tenantId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet utilisateur fait déjà partie de l\'équipe' },
        { status: 400 }
      );
    }

    // Check if there's a pending invitation
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        email: data.email,
        tenant_id: tenantId,
        accepted_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Une invitation est déjà en attente pour cet email' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const invitation = await prisma.teamInvitation.create({
      data: {
        tenant_id: tenantId,
        email: data.email,
        role: data.role,
        token,
        invited_by: currentUser.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Get tenant info for email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, company_name: true },
    });

    // Send invitation email via configured account
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`;

    try {
      await sendEmailViaAccount({
        tenantId,
        to: data.email,
        subject: `Invitation à rejoindre ${tenant?.company_name || tenant?.name || 'VisionCRM'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Vous êtes invité(e) !</h2>
            <p><strong>${currentUser.name}</strong> vous invite à rejoindre <strong>${tenant?.company_name || tenant?.name || 'VisionCRM'}</strong>.</p>
            <p>Vous serez ajouté(e) avec le rôle : <strong>${data.role}</strong></p>
            <div style="margin: 30px 0;">
              <a href="${invitationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accepter l'invitation
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Ce lien expire dans 7 jours.</p>
            <p style="color: #666; font-size: 12px;">Si le bouton ne fonctionne pas, copiez ce lien : ${invitationUrl}</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Delete invitation if email fails
      await prisma.teamInvitation.delete({
        where: { id: invitation.id },
      });
      throw new Error('Impossible d\'envoyer l\'email d\'invitation. Vérifiez votre configuration email.');
    }

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expires_at: invitation.expires_at,
        },
        message: 'Invitation envoyée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'invitation' },
      { status: 500 }
    );
  }
}
