/*

* ANOPOLY DATABASE
* category.js
*
* Génère automatiquement les cartes
* à partir des fichiers JSON.
  */

document.addEventListener("DOMContentLoaded", async () => {

/*

* =========================
* RÉCUPÉRATION DU TYPE
* =========================
  */

const params =
new URLSearchParams(window.location.search);

const type =
params.get("type") || "smg";

/*

* =========================
* ÉLÉMENTS HTML
* =========================
  */

const title =
document.getElementById("title");

const eyebrow =
document.getElementById("eyebrow");

const description =
document.getElementById("description");

const grid =
document.getElementById("databaseGrid");

const emptyMessage =
document.getElementById("emptyMessage");

/*

* =========================
* INFORMATIONS CATÉGORIES
* =========================
  */

const categories = {

```
smg: {
  title: "SMG",
  eyebrow: "SUBMACHINE GUNS",
  description: "Armes automatiques compactes.",
  database: "weapons",
  filter: "smg"
},

shotgun: {
  title: "SHOTGUN",
  eyebrow: "SHOTGUNS",
  description: "Fiches des fusils à pompe.",
  database: "weapons",
  filter: "shotgun"
},

"machine-gun": {
  title: "MACHINE GUN",
  eyebrow: "MACHINE GUNS",
  description: "Fiches des mitrailleuses.",
  database: "weapons",
  filter: "machine-gun"
},

"assault-rifle": {
  title: "ASSAULT RIFLE",
  eyebrow: "ASSAULT RIFLES",
  description: "Fiches des fusils d'assaut.",
  database: "weapons",
  filter: "assault-rifle"
},

sniper: {
  title: "SNIPER",
  eyebrow: "SNIPERS",
  description: "Fiches des fusils de précision.",
  database: "weapons",
  filter: "sniper"
},

dmr: {
  title: "DMR",
  eyebrow: "DESIGNATED MARKSMAN RIFLES",
  description: "Fiches des DMR.",
  database: "weapons",
  filter: "dmr"
},


/*
 * =========================
 * ARMURES
 * =========================
 */

"armor-combat": {
  title: "ARMURES — COMBAT",
  eyebrow: "COMBAT ARMOR",
  description: "Armures conçues pour les situations de combat.",
  database: "armors",
  filter: "combat"
},

"armor-research": {
  title: "ARMURES — RECHERCHE",
  eyebrow: "RESEARCH ARMOR",
  description: "Armures spécialisées pour la recherche et l'exploration.",
  database: "armors",
  filter: "research"
},

"armor-intermediate": {
  title: "ARMURES — INTERMÉDIAIRE",
  eyebrow: "INTERMEDIATE ARMOR",
  description: "Armures offrant un équilibre entre protection et mobilité.",
  database: "armors",
  filter: "intermediate"
},


/*
 * =========================
 * ARTEFACTS
 * =========================
 */

artifacts: {
  title: "ARTEFACTS",
  eyebrow: "ARTIFACT DATABASE",
  description: "Les artefacts seront ajoutés progressivement.",
  database: "artifacts",
  filter: null
}
```

};

/*

* =========================
* CATÉGORIE INCONNUE
* =========================
  */

const category =
categories[type];

if (!category) {

```
title.textContent = "DATABASE";

eyebrow.textContent = "ARCHIVE";

description.textContent =
  "Section inconnue.";

emptyMessage.style.display = "block";

return;
```

}

/*

* =========================
* TITRE
* =========================
  */

document.title =
"ANOPOLY — " + category.title;

title.textContent =
category.title;

eyebrow.textContent =
category.eyebrow;

description.textContent =
category.description;

/*

* =========================
* CHARGEMENT JSON
* =========================
  */

try {

```
const response =
  await fetch(
    `data/${category.database}.json`
  );


if (!response.ok) {

  throw new Error(
    `Impossible de charger data/${category.database}.json`
  );

}


const database =
  await response.json();


/*
 * =========================
 * FILTRAGE
 * =========================
 */

let items =
  database;


if (category.filter) {

  items =
    database.filter(item =>
      item.category === category.filter
    );

}


/*
 * =========================
 * AUCUN OBJET
 * =========================
 */

if (!items.length) {

  emptyMessage.style.display =
    "block";

  return;

}


/*
 * =========================
 * GÉNÉRATION DES CARTES
 * =========================
 */

items.forEach(item => {

  const card =
    createCard(
      item,
      category.database
    );


  grid.appendChild(card);

});
```

} catch (error) {

```
console.error(error);

emptyMessage.textContent =
  "Impossible de charger la base de données.";

emptyMessage.style.display =
  "block";
```

}

});

/*

* =========================
* CRÉATION D'UNE CARTE
* =========================
  */

function createCard(item, database) {

/*

* Carte principale
  */

const card =
document.createElement("a");

card.className =
"database-card";

/*

* Destination
*
* Exemple :
*
* item.html?type=weapon&id=mp5
  */

card.href =
`item.html?type=${database}&id=${encodeURIComponent(item.id)}`;

/*

* =========================
* IMAGE
* =========================
  */

const imageContainer =
document.createElement("div");

imageContainer.className =
"database-card-image";

if (item.image) {

```
const image =
  document.createElement("img");

image.src =
  item.image;

image.alt =
  item.name || "Objet";

image.loading =
  "lazy";

imageContainer.appendChild(
  image
);
```

} else {

```
imageContainer.textContent =
  "NO IMAGE";
```

}

/*

* =========================
* INFORMATIONS
* =========================
  */

const info =
document.createElement("div");

info.className =
"database-card-info";

const name =
document.createElement("h2");

name.textContent =
item.name || "Objet sans nom";

info.appendChild(
name
);

/*

* =========================
* RARETÉ
*
* UNIQUEMENT POUR
* LES ARTEFACTS
* =========================
  */

if (
database === "artifacts" &&
item.rarity
) {

```
const rarity =
  document.createElement("div");

rarity.className =
  "database-card-rarity";

rarity.textContent =
  item.rarity;

info.appendChild(
  rarity
);
```

}

/*

* =========================
* ASSEMBLAGE
* =========================
  */

card.appendChild(
imageContainer
);

card.appendChild(
info
);

return card;
}
