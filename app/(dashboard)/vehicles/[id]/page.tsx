'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Car, Edit, Trash2, Plus, Calendar, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Vehicle {
  id: string;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  mileage: number | null;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  service_records: Array<{
    id: string;
    date: string;
    description: string;
    mileage: number | null;
    cost: number | null;
    status: string;
  }>;
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data);
      } else if (response.status === 404) {
        router.push('/vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/vehicles');
      } else {
        alert('Erreur lors de la suppression');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Erreur lors de la suppression');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Véhicule non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vehicles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">
              {vehicle.year} • {vehicle.license_plate}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/vehicles/${vehicle.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Vehicle Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informations du véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-mono text-sm font-medium">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Immatriculation</p>
                  <p className="font-medium">{vehicle.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marque</p>
                  <p className="font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modèle</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Année</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Couleur</p>
                  <p className="font-medium">{vehicle.color || 'N/A'}</p>
                </div>
                {vehicle.mileage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kilométrage</p>
                    <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Historique d'entretien
                </CardTitle>
                <Link href={`/service-records/new?vehicle_id=${vehicle.id}`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle intervention
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {vehicle.service_records.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Aucune intervention enregistrée
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicle.service_records.map((record) => (
                    <Link
                      key={record.id}
                      href={`/service-records/${record.id}`}
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">
                              {new Date(record.date).toLocaleDateString('fr-FR')}
                            </p>
                            <Badge
                              variant={
                                record.status === 'completed'
                                  ? 'default'
                                  : record.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {record.status === 'completed'
                                ? 'Terminé'
                                : record.status === 'in_progress'
                                ? 'En cours'
                                : 'Planifié'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {record.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {record.mileage && (
                              <span>{record.mileage.toLocaleString()} km</span>
                            )}
                            {record.cost && (
                              <span>{Number(record.cost).toFixed(2)} €</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Owner Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Propriétaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <Link
                  href={`/contacts/${vehicle.owner.id}`}
                  className="font-medium hover:underline"
                >
                  {vehicle.owner.first_name} {vehicle.owner.last_name}
                </Link>
              </div>
              {vehicle.owner.company && (
                <div>
                  <p className="text-sm text-muted-foreground">Société</p>
                  <p className="font-medium">{vehicle.owner.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${vehicle.owner.email}`}
                  className="text-sm font-medium hover:underline"
                >
                  {vehicle.owner.email}
                </a>
              </div>
              {vehicle.owner.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a
                    href={`tel:${vehicle.owner.phone}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {vehicle.owner.phone}
                  </a>
                </div>
              )}
              <div className="pt-4">
                <Link href={`/contacts/${vehicle.owner.id}`}>
                  <Button variant="outline" className="w-full">
                    Voir le contact
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div>
                <p>Créé le</p>
                <p className="font-medium text-foreground">
                  {new Date(vehicle.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p>Modifié le</p>
                <p className="font-medium text-foreground">
                  {new Date(vehicle.updated_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
