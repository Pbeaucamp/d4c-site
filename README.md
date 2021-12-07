# d4c-site

---

Ceci est la partir HTML, JS, CSS de la plateforme Data4Citizen.

---

## Récupération du repository Git

Pour que les fichiers soient accessibles, il convient de respecter ce chemin Drupal absolu : **/sites/default/files/api/portail_d4c/**.

Ce chemin est indiqué à de nombreuses reprises dans le code, une modification du chemin est possible mais nécessite une modification des fichiers js, css et html.

Pour respecter ce path:

- placez- vous dans le répertoire /files/

- supprimez le dossier api/ si il existe

- effectuez la commande GIT : `git clone http://gitlab.bpm-conseil.com/data4citizen/d4c-site.git api`

---

## Configuration

Il y a peu de configuration du côté client du Drupal.

Le fichier i18n.js contient les traductions français/anglais mais aussi quelques configurations interessantes comme celle des **fonds de cartes**, qui se trouvent dans la variable **basemaps**.
Cette est variable est un tableau et peut donc contenir plusieus fonds de cartes.

Gestion du cache des fichiers js et img - Configuration NGINX

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    	try_files $uri @rewrite;
        expires 1d;
        add_header Cache-Control "public, no-transform";
        log_not_found off;
    }
