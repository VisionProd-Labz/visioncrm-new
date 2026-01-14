.PHONY: help build test deploy clean

# Variables
DOCKER_IMAGE = visioncrm
DOCKER_TAG = latest
ENVIRONMENT = staging

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Installe les dépendances
	pip install -r requirements.txt
	npm install

build: ## Build l'application Docker
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

test: ## Lance tous les tests
	python -m pytest
	npm test

lint: ## Lance les linters
	flake8 .
	npm run lint

security: ## Lance les tests de sécurité
	bandit -r .
	npm audit

dev: ## Lance l'environnement de développement
	docker-compose up -d

deploy-staging: ## Déploie en staging
	@./scripts/deploy.sh staging $(DOCKER_TAG)

deploy-prod: ## Déploie en production
	@./scripts/deploy.sh production $(DOCKER_TAG)

logs: ## Affiche les logs de l'application
	kubectl logs -f deployment/visioncrm-web -n $(ENVIRONMENT)

clean: ## Nettoie les fichiers temporaires
	docker system prune -f
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

backup: ## Sauvegarde la base de données
	kubectl exec deployment/postgres -n $(ENVIRONMENT) -- pg_dump -U postgres visioncrm > backup_$(shell date +%Y%m%d_%H%M%S).sql

rollback: ## Rollback vers la version précédente
	kubectl rollout undo deployment/visioncrm-web -n $(ENVIRONMENT)

status: ## Affiche le statut du déploiement
	kubectl get pods -n $(ENVIRONMENT)
	kubectl get services -n $(ENVIRONMENT)
