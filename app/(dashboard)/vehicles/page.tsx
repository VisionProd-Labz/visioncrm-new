'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Car, User, Wrench, Gauge, Calendar, MoreVertical, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';

interface Vehicle {
  id: string;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  mileage: number | null;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
  };
  _count: {
    service_records: number;
  };
}

export default function VehiclesPage() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('vehicles.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('vehicles.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('vehicles.subtitle')}
          </p>
        </div>
        <Link href="/vehicles/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            {t('vehicles.new_vehicle')}
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('vehicles.search_placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t('vehicles.filters')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              {t('vehicles.search_button')}
            </Button>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      {vehicles.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.vehicle')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.license_plate')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.vin')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.owner')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.mileage')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.interventions')}</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('vehicles.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <Link href={`/vehicles/${vehicle.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.year}
                            {vehicle.color && ` • ${vehicle.color}`}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground px-2.5 py-1 bg-muted rounded-md">
                        {vehicle.license_plate}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="text-xs font-mono text-muted-foreground">
                        {vehicle.vin}
                      </code>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/contacts/${vehicle.owner.id}`}
                        className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        {vehicle.owner.first_name} {vehicle.owner.last_name}
                      </Link>
                    </td>
                    <td className="p-4">
                      {vehicle.mileage ? (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                          {vehicle.mileage.toLocaleString()} km
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{vehicle._count.service_records}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('vehicles.empty_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('vehicles.empty_description')}
              </p>
            </div>
            <Link href="/vehicles/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                {t('vehicles.add_button')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
