'use strict';

const URL_PROJETS = 'https://webcraft-api.vercel.app/data/projects.json';
const URL_FORMATIONS = 'https://webcraft-api.vercel.app/data/courses.json';

const $ = (selecteur) => document.querySelector(selecteur);
const texteSimple = (texte) => String(texte || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const libelle = (valeur) => (typeof valeur === 'object' ? (valeur.name || valeur.title || '') : valeur);

const echapper = (texte) => String(texte || '').replace(/[&<>"']/g, (caractere) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[caractere]));

const charger = async (url) => {
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);
  return reponse.json();
};

const valeurParId = (liste, id) => libelle(liste.find((element) => element.id === id) || id);

const remplirSelect = (selecteur, valeurs) => {
  const select = $(selecteur);
  valeurs.forEach((valeur) => {
    const option = document.createElement('option');
    option.value = valeur;
    option.textContent = valeur;
    select.appendChild(option);
  });
};

const afficherBadges = (valeurs) => valeurs.map((valeur) => `<span class="badge">${echapper(valeur)}</span>`).join('');

let projets = [];
let formations = [];

const ouvrirModal = (contenu) => {
  $('#modal-contenu').innerHTML = contenu;
  $('#modal').hidden = false;
};

const fermerModal = () => { $('#modal').hidden = true; };

const initialiserModal = () => {
  $('#modal-fermer').addEventListener('click', fermerModal);
  $('#modal').addEventListener('click', (evenement) => {
    if (evenement.target === $('#modal')) fermerModal();
  });
  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape') fermerModal();
  });
};

const carteProjet = (projet) => `
  <article class="carte">
    <img src="${echapper(projet.image)}" alt="Aperçu du projet ${echapper(projet.title)}">
    <div class="carte__corps">
      <h3>${echapper(projet.title)}</h3>
      <p>Client : ${echapper(projet.client)}</p>
      <p><span class="badge">${echapper(projet.categorie)}</span></p>
      <div>${afficherBadges(projet.techs)}</div>
      <div class="carte__boutons">
        <button class="btn" type="button" data-projet="${projet.id}">Voir les détails</button>
      </div>
    </div>
  </article>`;

const detailsProjet = (projet) => `
  <img src="${echapper(projet.image)}" alt="Aperçu du projet ${echapper(projet.title)}">
  <h2>${echapper(projet.title)}</h2>
  <p>Client : ${echapper(projet.client)}</p>
  <p>${echapper(projet.description)}</p>
  <h3>Fonctionnalités</h3>
  <ul>${(projet.features || []).map((fonction) => `<li>${echapper(libelle(fonction))}</li>`).join('')}</ul>
  <h3>Technologies</h3>
  <div>${afficherBadges(projet.techs)}</div>
  <p><a class="btn" href="${echapper(projet.url)}" target="_blank" rel="noopener noreferrer">Voir le projet</a></p>`;

const afficherProjets = () => {
  const recherche = texteSimple($('#p-recherche').value);
  const technologie = $('#p-tech').value;
  const categorie = $('#p-cat').value;
  const resultats = projets.filter((projet) => (
    texteSimple(`${projet.title} ${projet.client} ${projet.description} ${projet.categorie} ${projet.techs.join(' ')}`).includes(recherche)
    && (!technologie || projet.techs.includes(technologie))
    && (!categorie || projet.categorie === categorie)
  ));
  $('#p-grille').innerHTML = resultats.length ? resultats.map(carteProjet).join('') : '<p>Aucun projet trouvé.</p>';
};

const chargerProjets = async () => {
  try {
    const donnees = await charger(URL_PROJETS);
    projets = donnees.projects.map((projet) => ({
      ...projet,
      techs: (projet.technologies || []).map((id) => valeurParId(donnees.technologies, id)),
      categorie: valeurParId(donnees.categories, projet.category)
    }));
    remplirSelect('#p-tech', donnees.technologies.map(libelle));
    remplirSelect('#p-cat', donnees.categories.map(libelle));
    ['#p-recherche', '#p-tech', '#p-cat'].forEach((selecteur) => {
      $(selecteur).addEventListener(selecteur === '#p-recherche' ? 'input' : 'change', afficherProjets);
    });
    $('#p-grille').addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('[data-projet]');
      if (bouton) ouvrirModal(detailsProjet(projets.find((projet) => String(projet.id) === bouton.dataset.projet)));
    });
    afficherProjets();
    $('#p-contenu').hidden = false;
  } catch (erreur) {
    console.error(erreur);
    $('#p-erreur').hidden = false;
  } finally {
    $('#p-loader').hidden = true;
  }
};

const disponibilite = (formation) => formation.available === false
  ? '<span class="badge badge--complet">Complet</span>'
  : '<span class="badge badge--ok">Disponible</span>';

const boutonInscription = (formation) => formation.available === false
  ? '<button class="btn btn--accent" type="button" disabled>Complet</button>'
  : '<a class="btn btn--accent" href="inscription.html">S’inscrire</a>';

const carteFormation = (formation) => `
  <article class="carte">
    <img src="${echapper(formation.image)}" alt="Illustration de ${echapper(formation.title)}">
    <div class="carte__corps">
      <h3>${echapper(formation.title)}</h3>
      <p>${echapper(formation.categorie)} - <span class="badge">${echapper(formation.niveau)}</span></p>
      <p>${echapper(formation.duration)} - <strong>${echapper(formation.price)} €</strong></p>
      <p>★ ${echapper(formation.rating)} (${echapper(formation.students)} étudiants)</p>
      <div>${afficherBadges(formation.techs)}</div>
      <p>${disponibilite(formation)}</p>
      <div class="carte__boutons">
        <button class="btn" type="button" data-formation="${formation.id}">Voir les détails</button>
        ${boutonInscription(formation)}
      </div>
    </div>
  </article>`;

const detailsFormation = (formation) => `
  <img src="${echapper(formation.image)}" alt="Illustration de ${echapper(formation.title)}">
  <h2>${echapper(formation.title)}</h2>
  <p>${echapper(formation.categorie)} - ${echapper(formation.niveau)} ${disponibilite(formation)}</p>
  <p>${echapper(formation.description)}</p>
  <p><strong>Formateur :</strong> ${echapper(libelle(formation.instructor))}</p>
  <p><strong>Durée :</strong> ${echapper(formation.duration)} - <strong>Prix :</strong> ${echapper(formation.price)} €</p>
  <h3>Modules</h3>
  <ul>${(formation.modules || []).map((module) => `<li>${echapper(libelle(module))}</li>`).join('')}</ul>
  <p>${boutonInscription(formation)}</p>`;

const afficherFormations = () => {
  const recherche = texteSimple($('#f-recherche').value);
  const categorie = $('#f-cat').value;
  const niveau = $('#f-niveau').value;
  const technologie = $('#f-tech').value;
  const resultats = formations.filter((formation) => (
    texteSimple(`${formation.title} ${formation.description} ${formation.categorie} ${formation.techs.join(' ')}`).includes(recherche)
    && (!categorie || formation.categorie === categorie)
    && (!niveau || formation.niveau === niveau)
    && (!technologie || formation.techs.includes(technologie))
  ));
  $('#f-grille').innerHTML = resultats.length ? resultats.map(carteFormation).join('') : '<p>Aucune formation trouvée.</p>';
};

const chargerFormations = async () => {
  try {
    const donnees = await charger(URL_FORMATIONS);
    formations = donnees.courses.map((formation) => ({
      ...formation,
      techs: (formation.technologies || []).map((id) => valeurParId(donnees.technologies, id)),
      categorie: valeurParId(donnees.categories, formation.category),
      niveau: valeurParId(donnees.levels, formation.level)
    }));
    remplirSelect('#f-cat', donnees.categories.map(libelle));
    remplirSelect('#f-niveau', donnees.levels.map(libelle));
    remplirSelect('#f-tech', donnees.technologies.map(libelle));
    ['#f-recherche', '#f-cat', '#f-niveau', '#f-tech'].forEach((selecteur) => {
      $(selecteur).addEventListener(selecteur === '#f-recherche' ? 'input' : 'change', afficherFormations);
    });
    $('#f-grille').addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('[data-formation]');
      if (bouton) ouvrirModal(detailsFormation(formations.find((formation) => String(formation.id) === bouton.dataset.formation)));
    });
    afficherFormations();
    $('#f-contenu').hidden = false;
  } catch (erreur) {
    console.error(erreur);
    $('#f-erreur').hidden = false;
  } finally {
    $('#f-loader').hidden = true;
  }
};

const afficherErreur = (champ, message) => {
  const zone = $(`#${champ}-erreur`);
  const input = $(`#${champ}`);
  zone.textContent = message;
  input.classList.toggle('invalide', Boolean(message));
  input.classList.toggle('valide', !message && Boolean(input.value));
  return !message;
};

const verifierChamp = (champ) => {
  const valeur = $(`#${champ}`).value.trim();
  let message = '';
  if (['prenom', 'nom'].includes(champ) && valeur.length < 2) message = 'Deux caractères minimum.';
  if (champ === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur)) message = 'Adresse email invalide.';
  if (champ === 'telephone' && !/^\+[0-9][0-9 .-]{7,}$/.test(valeur)) message = 'Utilisez un numéro international.';
  if (['formation', 'niveau'].includes(champ) && !valeur) message = 'Ce champ est obligatoire.';
  if (champ === 'motivation' && valeur.length < 50) message = '50 caractères minimum.';
  return afficherErreur(champ, message);
};

const initialiserFormulaire = async () => {
  try {
    const donnees = await charger(URL_FORMATIONS);
    donnees.courses.forEach((formation) => {
      const option = document.createElement('option');
      option.value = formation.id;
      option.textContent = formation.title;
      $('#formation').appendChild(option);
    });
    $('#formulaire').hidden = false;
    ['prenom', 'nom', 'email', 'telephone', 'formation', 'niveau', 'motivation'].forEach((champ) => {
      $(`#${champ}`).addEventListener('input', () => verifierChamp(champ));
      $(`#${champ}`).addEventListener('change', () => verifierChamp(champ));
    });
    $('#formulaire').addEventListener('submit', (evenement) => {
      evenement.preventDefault();
      const champsValides = ['prenom', 'nom', 'email', 'telephone', 'formation', 'niveau', 'motivation'].map(verifierChamp).every(Boolean);
      if (!champsValides) return;
      alert('Votre inscription a bien été envoyée.');
      $('#formulaire').reset();
      ['prenom', 'nom', 'email', 'telephone', 'formation', 'niveau', 'motivation'].forEach((champ) => afficherErreur(champ, ''));
    });
  } catch (erreur) {
    console.error(erreur);
    $('#i-erreur').hidden = false;
  } finally {
    $('#i-loader').hidden = true;
  }
};

if (document.body.dataset.page === 'accueil') {
  initialiserModal();
  chargerProjets();
  chargerFormations();
} else {
  initialiserFormulaire();
}
