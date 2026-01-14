<?php

namespace App\Services;

class PasswordValidationService
{
    private $config;
    
    public function __construct()
    {
        $this->config = config('security.password');
    }
    
    /**
     * Valider un mot de passe selon les règles de sécurité
     */
    public function validate($password)
    {
        $errors = [];
        
        // Longueur minimale
        if (strlen($password) < $this->config['min_length']) {
            $errors[] = "Password must be at least {$this->config['min_length']} characters long";
        }
        
        // Majuscules requises
        if ($this->config['require_uppercase'] && !preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        // Minuscules requises
        if ($this->config['require_lowercase'] && !preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        // Chiffres requis
        if ($this->config['require_numbers'] && !preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        // Symboles requis
        if ($this->config['require_symbols'] && !preg_match('/[^a-zA-Z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        // Vérifier les mots de passe communs
        if ($this->isCommonPassword($password)) {
            $errors[] = 'Password is too common, please choose a more secure password';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Vérifier si le mot de passe est dans la liste des mots de passe communs
     */
    private function isCommonPassword($password)
    {
        $commonPasswords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', '123123'
        ];
        
        return in_array(strtolower($password), $commonPasswords);
    }
    
    /**
     * Calculer la force d'un mot de passe
     */
    public function calculateStrength($password)
    {
        $score = 0;
        $length = strlen($password);
        
        // Points pour la longueur
        if ($length >= 8) $score += 1;
        if ($length >= 12) $score += 1;
        if ($length >= 16) $score += 1;
        
        // Points pour la complexité
        if (preg_match('/[a-z]/', $password)) $score += 1;
        if (preg_match('/[A-Z]/', $password)) $score += 1;
        if (preg_match('/[0-9]/', $password)) $score += 1;
        if (preg_match('/[^a-zA-Z0-9]/', $password)) $score += 1;
        
        // Points pour la variété
        if (preg_match('/[a-z].*[A-Z]|[A-Z].*[a-z]/', $password)) $score += 1;
        if (preg_match('/[a-zA-Z].*[0-9]|[0-9].*[a-zA-Z]/', $password)) $score += 1;
        
        $strength = 'weak';
        if ($score >= 6) $strength = 'medium';
        if ($score >= 8) $strength = 'strong';
        if ($score >= 10) $strength = 'very_strong';
        
        return [
            'score' => $score,
            'strength' => $strength,
            'percentage' => min(100, ($score / 10) * 100)
        ];
    }
}
