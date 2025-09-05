# CoIT

Ce projet utilise Firebase pour l'authentification, le stockage et la base de données Firestore.

## Journalisation Firestore

Les logs détaillés (`debug`) de Firestore sont activés uniquement en mode développement afin de faciliter le diagnostic.
En production, le niveau de log est réduit à `error` pour limiter le bruit.
