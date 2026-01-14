<?php

namespace App\Middleware;

use App\Services\AuditLogger;
use PDO;

class AuditMiddleware
{
    private $auditLogger;
    private $excludeRoutes = [
        '/health-check',
        '/static/',
        '/favicon.ico'
    ];

    public function __construct(PDO $db)
    {
        $this->auditLogger = new AuditLogger($db);
    }

    /**
     * Middleware pour auditer automatiquement les requêtes
     */
    public function handle($request, $next)
    {
        $startTime = microtime(true);
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];
        
        // Ignorer certaines routes
        if ($this->shouldExclude($uri)) {
            return $next($request);
        }

        // Détecter les opérations sur données personnelles
        if ($this->isPersonalDataOperation($uri, $method)) {
            $this->logPersonalDataAccess($method, $uri);
        }

        // Exécuter la requête
        $response = $next($request);
        
        // Log de performance si nécessaire
        $executionTime = microtime(true) - $startTime;
        if ($executionTime > 2.0) { // Plus de 2 secondes
            $this->auditLogger->logSecurityEvent(
                'SLOW_QUERY',
                "Requête lente détectée: {$method} {$uri}",
                'MEDIUM',
                ['execution_time' => $executionTime]
            );
        }

        return $response;
    }

    /**
     * Vérifier si l'URI doit être exclue de l'audit
     */
    private function shouldExclude(string $uri): bool
    {
        foreach ($this->excludeRoutes as $route) {
            if (strpos($uri, $route) === 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Détecter si c'est une opération sur des données personnelles
     */
    private function isPersonalDataOperation(string $uri, string $method): bool
    {
        $personalDataRoutes = [
            '/clients/',
            '/contacts/',
            '/leads/',
            '/users/',
            '/api/clients/',
            '/api/contacts/',
            '/api/leads/'
        ];

        foreach ($personalDataRoutes as $route) {
            if (strpos($uri, $route) !== false) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Logger l'accès aux données personnelles
     */
    private function logPersonalDataAccess(string $method, string $uri)
    {
        $action = $this->mapMethodToAction($method);
        $resource = $this->extractResourceFromUri($uri);
        $resourceId = $this->extractResourceIdFromUri($uri);
        
        $this->auditLogger->logDataAccess(
            $action,
            $resource,
            $resourceId,
            ['uri' => $uri, 'method' => $method]
        );
    }

    /**
     * Mapper la méthode HTTP à une action
     */
    private function mapMethodToAction(string $method): string
    {
        $mapping = [
            'GET' => 'READ',
            'POST' => 'CREATE',
            'PUT' => 'UPDATE',
            'PATCH' => 'UPDATE',
            'DELETE' => 'DELETE'
        ];
        
        return $mapping[$method] ?? 'UNKNOWN';
    }

    /**
     * Extraire le type de ressource de l'URI
     */
    private function extractResourceFromUri(string $uri): string
    {
        if (preg_match('/\/(clients|contacts|leads|users)\//', $uri, $matches)) {
            return strtoupper($matches[1]);
        }
        
        return 'UNKNOWN';
    }

    /**
     * Extraire l'ID de ressource de l'URI
     */
    private function extractResourceIdFromUri(string $uri): int
    {
        if (preg_match('/\/(\d+)/', $uri, $matches)) {
            return (int)$matches[1];
        }
        
        return 0;
    }
}
