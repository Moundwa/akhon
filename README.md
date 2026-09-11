# Akhon Transit

Site vitrine d’**Akhon Transit**, commissionnaire agréé en douane CEMAC — Pointe-Noire et Brazzaville.

## En ligne

- GitHub Pages : https://moundwa.github.io/akhon/

## Structure

```
index.html
pages/
  apropos.html
  services.html
  atouts.html
  actualites.html
  contact.html
  merci.html
css/style.css
assets/
```

Site statique HTML/CSS/JS. Pas de build.

## Formulaire de devis

Le formulaire de `pages/contact.html` envoie via [FormSubmit](https://formsubmit.co/) vers `contact@groupe-akhon.com`.

Au premier envoi, FormSubmit envoie un e-mail de confirmation à cette adresse : il faut cliquer le lien une fois, sinon les demandes n’arrivent pas.

Un honeypot anti-bot et un captcha FormSubmit sont activés. Après envoi, le visiteur arrive sur `pages/merci.html`.

## Déploiement

GitHub Pages est déjà actif sur la branche `main`.

Pour Vercel : importer le dépôt `Moundwa/akhon`, framework « Other », pas de commande de build. Puis brancher un nom de domaine (ex. `www.akhon-transit.com`) dans Project → Settings → Domains.
