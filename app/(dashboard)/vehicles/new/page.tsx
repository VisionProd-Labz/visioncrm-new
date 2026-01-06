'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

export default function NewVehiclePage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    owner_id: '',
    vin: '',
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOCRLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/vehicles/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur OCR');
      }

      const { data } = await response.json();

      // Auto-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        vin: data.vin || prev.vin,
        license_plate: data.license_plate || prev.license_plate,
        make: data.make || prev.make,
        model: data.model || prev.model,
        year: data.year || prev.year,
      }));

      alert('Données extraites avec succès ! Vérifiez et complétez les informations.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsOCRLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year.toString()),
          mileage: formData.mileage ? parseInt(formData.mileage.toString()) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const vehicle = await response.json();
      router.push(`/vehicles/${vehicle.id}`);
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vehicles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouveau véhicule</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau véhicule au parc automobile
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* OCR Upload */}
        <Card className="mb-6 border-dashed border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Scanner la carte grise (optionnel)
            </CardTitle>
            <CardDescription>
              Téléchargez la carte grise pour remplir automatiquement les informations du véhicule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleOCRUpload}
                disabled={isOCRLoading}
                className="cursor-pointer"
              />
              {isOCRLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Formats supportés : JPG, PNG, PDF (max 10MB)
            </p>
          </CardContent>
        </Card>

        {/* Owner Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Propriétaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="owner_id">Contact propriétaire *</Label>
              <select
                id="owner_id"
                required
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sélectionnez un contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations du véhicule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN (17 caractères) *</Label>
              <Input
                id="vin"
                required
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                disabled={isLoading}
                maxLength={17}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">Plaque d'immatriculation *</Label>
              <Input
                id="license_plate"
                required
                value={formData.license_plate}
                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                disabled={isLoading}
                placeholder="AB-123-CD"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="make">Marque *</Label>
                <Input
                  id="make"
                  required
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  disabled={isLoading}
                  placeholder="Renault, Peugeot..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modèle *</Label>
                <Input
                  id="model"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  disabled={isLoading}
                  placeholder="Clio, 308..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Année *</Label>
                <Input
                  id="year"
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  disabled={isLoading}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  disabled={isLoading}
                  placeholder="Bleu, Noir..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Kilométrage actuel</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                disabled={isLoading}
                min={0}
                placeholder="45000"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer le véhicule'}
          </Button>
          <Link href="/vehicles">
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
