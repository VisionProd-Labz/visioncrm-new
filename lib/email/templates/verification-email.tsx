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

interface VerificationEmailProps {
  verificationUrl: string;
  userName: string;
}

export function VerificationEmail({
  verificationUrl,
  userName,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email - VisionCRM</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bienvenue sur VisionCRM, {userName}! 👋</Heading>

          <Text style={text}>
            Merci de vous être inscrit sur <strong>VisionCRM</strong>, la solution complète
            pour la gestion de votre garage automobile.
          </Text>

          <Text style={text}>
            Pour activer votre compte et commencer à utiliser toutes les fonctionnalités,
            veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Vérifier mon email
            </Button>
          </Section>

          <Text style={text}>
            Ou copiez et collez ce lien dans votre navigateur :
          </Text>

          <Text style={link}>
            <Link href={verificationUrl} style={linkStyle}>
              {verificationUrl}
            </Link>
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              ⏰ <strong>Important :</strong> Ce lien expire dans 24 heures pour des raisons de sécurité.
            </Text>
          </Section>

          <Text style={text}>
            Si vous n'avez pas créé de compte VisionCRM, vous pouvez ignorer cet email en toute sécurité.
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

export default VerificationEmail;

// Styles inline (nécessaires pour compatibilité email clients)
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

const infoBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeeba',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 40px',
};

const infoText = {
  color: '#856404',
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
