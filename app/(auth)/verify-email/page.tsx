'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Handle GET redirect responses
    if (successParam) {
      if (successParam === 'verified') {
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');
      } else if (successParam === 'already_verified') {
        setStatus('success');
        setMessage('Votre email est déjà vérifié.');
      }
      return;
    }

    if (errorParam) {
      setStatus('error');
      switch (errorParam) {
        case 'missing_token':
          setMessage('Token de vérification manquant');
          break;
        case 'invalid_token':
          setMessage('Token de vérification invalide ou expiré');
          break;
        case 'expired_token':
          setMessage('Ce lien de vérification a expiré. Veuillez demander un nouveau lien.');
          break;
        case 'used_token':
          setMessage('Ce lien de vérification a déjà été utilisé');
          break;
        case 'server_error':
          setMessage('Une erreur est survenue lors de la vérification');
          break;
        default:
          setMessage('Une erreur est survenue');
      }
      return;
    }

    // If we have a token, verify it via POST
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Token de vérification manquant');
    }
  }, [token, successParam, errorParam]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur est survenue lors de la vérification');
      console.error('Verification error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white">VisionCRM</h1>
            <p className="mt-2 text-purple-100">Vérification de votre email</p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {status === 'loading' && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Vérification en cours...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Succès !</h2>
                <p className="mt-2 text-gray-600">{message}</p>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/login"
                    className="block w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Se connecter
                  </Link>
                  <p className="text-sm text-gray-500">
                    Vous serez redirigé automatiquement dans 3 secondes...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg
                    className="h-10 w-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Erreur</h2>
                <p className="mt-2 text-gray-600">{message}</p>

                <div className="mt-6 space-y-3">
                  {(message.includes('expiré') || message.includes('invalide')) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                      <p className="text-sm text-yellow-800">
                        <strong>Besoin d'un nouveau lien ?</strong>
                        <br />
                        Contactez-nous ou créez un nouveau compte si nécessaire.
                      </p>
                    </div>
                  )}

                  <Link
                    href="/login"
                    className="block w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Aller à la connexion
                  </Link>

                  <Link
                    href="/register"
                    className="block w-full py-3 px-4 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 font-medium transition-all duration-200"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              © {new Date().getFullYear()} VisionCRM. Tous droits réservés.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Besoin d'aide ?{' '}
            <a
              href="mailto:support@visioncrm.app"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
