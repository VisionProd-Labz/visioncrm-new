from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class TraitementRGPD(models.Model):
    """Modèle pour le registre des traitements"""
    
    BASES_LEGALES = [
        ('consentement', 'Consentement'),
        ('contrat', 'Exécution du contrat'),
        ('obligation_legale', 'Obligation légale'),
        ('interet_vital', 'Intérêt vital'),
        ('mission_publique', 'Mission d\'intérêt public'),
        ('interet_legitime', 'Intérêt légitime'),
    ]
    
    nom = models.CharField(max_length=200)
    description = models.TextField()
    finalites = models.TextField()
    base_legale = models.CharField(max_length=50, choices=BASES_LEGALES)
    categories_personnes = models.TextField()
    categories_donnees = models.TextField()
    destinataires = models.TextField()
    transferts_hors_ue = models.TextField(blank=True)
    duree_conservation = models.TextField()
    mesures_securite = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Traitement RGPD"
        verbose_name_plural = "Traitements RGPD"

class DemandeExerciceDroit(models.Model):
    """Modèle pour les demandes d'exercice des droits"""
    
    TYPES_DROITS = [
        ('acces', 'Droit d\'accès'),
        ('rectification', 'Droit de rectification'),
        ('effacement', 'Droit à l\'effacement'),
        ('limitation', 'Droit à la limitation'),
        ('portabilite', 'Droit à la portabilité'),
        ('opposition', 'Droit d\'opposition'),
    ]
    
    STATUTS = [
        ('recu', 'Reçu'),
        ('en_cours', 'En cours de traitement'),
        ('traite', 'Traité'),
        ('refuse', 'Refusé'),
    ]
    
    numero = models.CharField(max_length=20, unique=True)
    type_droit = models.CharField(max_length=20, choices=TYPES_DROITS)
    statut = models.CharField(max_length=20, choices=STATUTS, default='recu')
    
    # Informations du demandeur
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20, blank=True)
    
    # Détails de la demande
    description = models.TextField()
    date_demande = models.DateTimeField(auto_now_add=True)
    date_traitement = models.DateTimeField(null=True, blank=True)
    
    # Traitement
    traite_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reponse = models.TextField(blank=True)
    
    # Fichiers
    piece_identite = models.FileField(upload_to='rgpd/pieces/', blank=True)
    reponse_fichier = models.FileField(upload_to='rgpd/reponses/', blank=True)
    
    def save(self, *args, **kwargs):
        if not self.numero:
            self.numero = f"RGPD-{timezone.now().strftime('%Y%m%d')}-{self.pk or 'NEW'}"
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Demande d'exercice de droit"
        verbose_name_plural = "Demandes d'exercice de droits"
        ordering = ['-date_demande']

class ConsentementMarketing(models.Model):
    """Modèle pour gérer les consentements marketing"""
    
    email = models.EmailField(unique=True)
    consentement_actif = models.BooleanField(default=False)
    date_consentement = models.DateTimeField(null=True, blank=True)
    date_retrait = models.DateTimeField(null=True, blank=True)
    
    # Traçabilité
    source_consentement = models.CharField(max_length=100, blank=True)
    ip_consentement = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Consentement Marketing"
        verbose_name_plural = "Consentements Marketing"

class ViolationDonnees(models.Model):
    """Modèle pour les violations de données"""
    
    TYPES_VIOLATION = [
        ('confidentialite', 'Violation de confidentialité'),
        ('integrite', 'Violation d\'intégrité'),
        ('disponibilite', 'Violation de disponibilité'),
    ]
    
    NIVEAUX_RISQUE = [
        ('faible', 'Risque faible'),
        ('moyen', 'Risque moyen'),
        ('eleve', 'Risque élevé'),
    ]
    
    numero_incident = models.CharField(max_length=50, unique=True)
    type_violation = models.CharField(max_length=20, choices=TYPES_VIOLATION)
    niveau_risque = models.CharField(max_length=10, choices=NIVEAUX_RISQUE)
    
    # Description
    description = models.TextField()
    donnees_concernees = models.TextField()
    nombre_personnes = models.IntegerField(default=0)
    
    # Dates
    date_detection = models.DateTimeField()
    date_violation = models.DateTimeField()
    date_notification_cnil = models.DateTimeField(null=True, blank=True)
    
    # Actions
    mesures_prises = models.TextField()
    notification_personnes = models.BooleanField(default=False)
    
    # Suivi
    detecte_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    resolu = models.BooleanField(default=False)
    date_resolution = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Violation de données"
        verbose_name_plural = "Violations de données"
        ordering = ['-date_detection']
