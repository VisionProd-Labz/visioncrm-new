import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  resetUrl: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
}

export function PasswordResetEmail({
  resetUrl,
  userName,
  ipAddress,
  userAgent,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe VisionCRM</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Réinitialisation de mot de passe</Heading>

          <Text style={text}>Bonjour {userName},</Text>

          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte VisionCRM.
          </Text>

          <Text style={text}>
            Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          <Text style={text}>
            Ou copiez et collez ce lien dans votre navigateur :
          </Text>

          <Text style={link}>
            <Link href={resetUrl} style={linkStyle}>
              {resetUrl}
            </Link>
          </Text>

          <Section style={warningBox}>
            <Text style={warningText}>
              🔒 <strong>Sécurité :</strong> Ce lien expire dans 60 minutes.
            </Text>
            {ipAddress && (
              <Text style={warningText}>
                📍 Demande reçue depuis : {ipAddress}
              </Text>
            )}
            {userAgent && (
              <Text style={warningText}>
                💻 Navigateur : {userAgent}
              </Text>
            )}
          </Section>

          <Section style={alertBox}>
            <Text style={alertText}>
              ⚠️ <strong>Vous n'êtes pas à l'origine de cette demande ?</strong>
              <br />
              Si vous n'avez pas demandé de réinitialisation, ignorez cet email.
              Votre mot de passe actuel reste inchangé et votre compte est sécurisé.
            </Text>
          </Section>

          <Text style={text}>
            Pour toute question, contactez notre support à{' '}
            <Link href="mailto:support@visioncrm.app" style={linkStyle}>
              support@visioncrm.app
            </Link>
          </Text>

          <Section style={divider} />

          <Text style={footer}>
            © 2026 VisionCRM. Tous droits réservés.
            <br />
            <Link href="https://visioncrm.app" style={footerLink}>
              visioncrm.app
            </Link>
            {' | '}
            <Link href="https://visioncrm.app/legal/privacy-policy" style={footerLink}>
              Politique de confidentialité
            </Link>
            {' | '}
            <Link href="mailto:support@visioncrm.app" style={footerLink}>
              Support
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordResetEmail;

// Styles inline
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.4',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const link = {
  padding: '0 40px',
  margin: '8px 0',
  fontSize: '14px',
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
  wordBreak: 'break-all' as const,
};

const warningBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeeba',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 40px',
};

const warningText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const alertBox = {
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c2c7',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 40px',
};

const alertText = {
  color: '#842029',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const divider = {
  borderTop: '1px solid #e5e7eb',
  margin: '32px 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
  padding: '0 40px',
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'none',
};
