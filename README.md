# WebCraft Solutions

## Présentation

Ce projet est un portail pour WebCraft Solutions. Il contient :

- une page d'accueil avec les projets clients ;
- un catalogue de formations ;
- une page d'inscription à une formation.

## APIs utilisées

Les données sont chargées depuis deux fichiers JSON :

- `https://webcraft-api.vercel.app/data/projects.json`
- `https://webcraft-api.vercel.app/data/courses.json`

Les deux appels sont faits avec `fetch()`. Un message de chargement est affiché
pendant la requête et un message d'erreur apparaît si l'API ne répond pas

## Aide ponctuelle de l'IA

L'IA a été utilisée ponctuellement pour m'aider à comprendre la structure des
données renvoyées par les APIs et à débloquer l'affichage des catégories et
des technologies dans les filtres

## Fonctionnalités principales

- recherche en temps réel sur les projets et les formations ;
- filtres par catégorie, niveau et technologie ;
- affichage des détails dans une modale ;
- fermeture de la modale avec le bouton, un clic extérieur ou la touche Échap ;
- formulaire d'inscription avec validation en temps réel ;
- motivation de 50 caractères minimum ;
- design responsive et animation CSS
