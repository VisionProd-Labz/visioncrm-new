<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Exception;

class FileSecurityService
{
    private $allowedTypes;
    private $maxSize;
    
    public function __construct()
    {
        $this->allowedTypes = config('security.file_upload.allowed_types');
        $this->maxSize = config('security.file_upload.max_size');
    }
    
    /**
     * Valider un fichier uploadé
     */
    public function validateFile(UploadedFile $file)
    {
        // Vérifier la taille
        if ($file->getSize() > $this->maxSize) {
            throw new Exception('File size exceeds maximum allowed size');
        }
        
        // Vérifier l'extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $this->allowedTypes)) {
            throw new Exception('File type not allowed');
        }
        
        // Vérifier le MIME type
        if (!$this->isValidMimeType($file)) {
            throw new Exception('Invalid file MIME type');
        }
        
        // Scanner pour les malwares (si activé)
        if (config('security.file_upload.scan_for_malware')) {
            $this->scanForMalware($file);
        }
        
        return true;
    }
    
    /**
     * Vérifier le MIME type
     */
    private function isValidMimeType(UploadedFile $file)
    {
        $allowedMimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        
        $extension = strtolower($file->getClientOriginalExtension());
        $expectedMime = $allowedMimes[$extension] ?? null;
        
        return $expectedMime && $file->getMimeType() === $expectedMime;
    }
    
    /**
     * Scanner pour les malwares (exemple basique)
     */
    private function scanForMalware(UploadedFile $file)
    {
        $content = file_get_contents($file->getPathname());
        
        // Patterns de détection basiques
        $malwarePatterns = [
            '/<script[^>]*>.*?<\/script>/is',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
        ];
        
        foreach ($malwarePatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                throw new Exception('Malicious content detected in file');
            }
        }
    }
    
    /**
     * Générer un nom de fichier sécurisé
     */
    public function generateSecureFileName(UploadedFile $file)
    {
        $extension = $file->getClientOriginalExtension();
        $hash = hash('sha256', $file->getPathname() . time());
        
        return substr($hash, 0, 32) . '.' . $extension;
    }
}
