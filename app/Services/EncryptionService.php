<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class EncryptionService
{
    private $cipher;
    private $key;
    
    public function __construct()
    {
        $this->cipher = config('security.encryption.cipher');
        $this->key = config('security.encryption.key');
    }
    
    /**
     * Chiffrer des données sensibles
     */
    public function encrypt($data)
    {
        try {
            $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($this->cipher));
            $encrypted = openssl_encrypt($data, $this->cipher, $this->key, 0, $iv);
            
            if ($encrypted === false) {
                throw new Exception('Encryption failed');
            }
            
            return base64_encode($encrypted . '::' . $iv);
        } catch (Exception $e) {
            Log::error('Encryption error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Déchiffrer des données
     */
    public function decrypt($encryptedData)
    {
        try {
            $data = base64_decode($encryptedData);
            list($encrypted, $iv) = explode('::', $data, 2);
            
            $decrypted = openssl_decrypt($encrypted, $this->cipher, $this->key, 0, $iv);
            
            if ($decrypted === false) {
                throw new Exception('Decryption failed');
            }
            
            return $decrypted;
        } catch (Exception $e) {
            Log::error('Decryption error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Hacher un mot de passe
     */
    public function hashPassword($password)
    {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536, // 64 MB
            'time_cost' => 4,       // 4 iterations
            'threads' => 3,         // 3 threads
        ]);
    }
    
    /**
     * Vérifier un mot de passe
     */
    public function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }
    
    /**
     * Générer un token sécurisé
     */
    public function generateSecureToken($length = 32)
    {
        return bin2hex(random_bytes($length));
    }
}
