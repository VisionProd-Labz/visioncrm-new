'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Building, MapPin, Car, FileText, Receipt, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: any;
  tags: string[];
  is_vip: boolean;
  created_at: string;
  vehicles: any[];
  quotes: any[];
  invoices: any[];
  activities: any[];
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchContact();
    }
  }, [params.id]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/contacts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
      } else {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      router.push('/contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Contact non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.is_vip && (
                <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                  VIP
                </span>
              )}
            </div>
            {contact.company && (
              <p className="text-muted-foreground">{contact.company}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.company}</span>
              </div>
            )}
            {contact.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {contact.address.street && <p>{contact.address.street}</p>}
                  {(contact.address.postalCode || contact.address.city) && (
                    <p>
                      {contact.address.postalCode} {contact.address.city}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Véhicules</span>
              </div>
              <span className="font-semibold">{contact.vehicles.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Devis</span>
              </div>
              <span className="font-semibold">{contact.quotes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Factures</span>
              </div>
              <span className="font-semibold">{contact.invoices.length}</span>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Client depuis {formatDate(contact.created_at)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Envoyer un email
            </Button>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Créer un devis
            </Button>
            <Button className="w-full" variant="outline">
              <Car className="mr-2 h-4 w-4" />
              Ajouter un véhicule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles */}
      {contact.vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Véhicules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contact.vehicles.map((vehicle: any) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.license_plate} • {vehicle.vin}
                    </p>
                  </div>
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique d'activité</CardTitle>
        </CardHeader>
        <CardContent>
          {contact.activities.length > 0 ? (
            <div className="space-y-4">
              {contact.activities.map((activity: any) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune activité enregistrée</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
