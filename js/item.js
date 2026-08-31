document.addEventListener("DOMContentLoaded", async () => {


/*
 * =========================================================
 * RÉCUPÉRATION DE L'ID
 * =========================================================
 */

const params = new URLSearchParams(window.location.search);
const weaponId = params.get("id");

if (!weaponId) {
    showError();
    return;
}


/*
 * =========================================================
 * CHARGEMENT DU JSON
 * =========================================================
 */

try {

    const response = await fetch("data/weapons.json");

    if (!response.ok) {
        throw new Error(
            "Impossible de charger weapons.json"
        );
    }

    const weapons = await response.json();


    /*
     * Vérification du format
     */

    if (!Array.isArray(weapons)) {
        throw new Error(
            "Le fichier weapons.json ne contient pas un tableau."
        );
    }


    /*
     * =====================================================
     * RECHERCHE DE L'ARME
     * =====================================================
     */

    const weapon = weapons.find(
        item => String(item.id) === String(weaponId)
    );


    if (!weapon) {
        showError();
        return;
    }


    /*
     * =====================================================
     * AFFICHAGE
     * =====================================================
     */

    displayWeapon(weapon);


    /*
     * =====================================================
     * NAVIGATION
     *
     * IMPORTANT :
     *
     * On ne garde QUE les armes ayant la même catégorie
     * que l'arme actuelle.
     *
     * Exemple :
     *
     * AK-104       assault-rifle
     * M4           assault-rifle
     * SCAR         assault-rifle
     *
     * La navigation sera :
     *
     * AK-104 → M4 → SCAR
     *
     * Elle ne pourra jamais aller vers une SMG ou un Sniper.
     * =====================================================
     */

    setupNavigation(weapon, weapons);


    /*
     * =====================================================
     * LIEN RETOUR
     * =====================================================
     */

    setupBackLink(weapon);


} catch (error) {

    console.error(
        "Erreur lors du chargement de l'arme :",
        error
    );

    showError();

}


});

/*

* =============================================================
* AFFICHAGE DE L'ARME
* =============================================================
  */

function displayWeapon(weapon) {


/*
 * ---------------------------------------------------------
 * NOM
 * ---------------------------------------------------------
 */

document.getElementById("weapon-name").textContent =
    weapon.name ?? "Arme inconnue";


/*
 * ---------------------------------------------------------
 * CATÉGORIE
 * ---------------------------------------------------------
 */

const category =
    weapon.category ?? "";

document.getElementById("weapon-category").textContent =
    formatCategory(category);

document.getElementById("weapon-category-info").textContent =
    formatCategory(category);


/*
 * ---------------------------------------------------------
 * ID
 * ---------------------------------------------------------
 */

document.getElementById("weapon-id").textContent =
    weapon.id ?? "-";


/*
 * ---------------------------------------------------------
 * CALIBRE
 * ---------------------------------------------------------
 */

const caliber =
    weapon.caliber ??
    weapon.Caliber ??
    "Non renseigné";

document.getElementById("weapon-caliber").textContent =
    caliber;

document.getElementById("weapon-caliber-info").textContent =
    caliber;


/*
 * ---------------------------------------------------------
 * STATISTIQUES
 * ---------------------------------------------------------
 *
 * On accepte également les noms avec une majuscule
 * au cas où le JSON utilise un autre format.
 */

document.getElementById("damage").textContent =
    getValue(
        weapon,
        ["damage", "Damage"]
    );

document.getElementById("fire-rate").textContent =
    getValue(
        weapon,
        ["fireRate", "FireRate", "rpm", "RPM"]
    );

document.getElementById("magazine").textContent =
    getValue(
        weapon,
        ["magazine", "Magazine", "magazineSize", "MagazineSize"]
    );

document.getElementById("reload-time").textContent =
    getValue(
        weapon,
        ["reloadTime", "ReloadTime"]
    );

document.getElementById("range").textContent =
    getValue(
        weapon,
        ["range", "Range"]
    );

document.getElementById("spread").textContent =
    getValue(
        weapon,
        ["spread", "Spread"]
    );

document.getElementById("ergonomics").textContent =
    getValue(
        weapon,
        ["ergonomics", "Ergonomics"]
    );

document.getElementById("weight").textContent =
    getValue(
        weapon,
        ["weight", "Weight"]
    );


/*
 * ---------------------------------------------------------
 * MULTIPLICATEURS
 * ---------------------------------------------------------
 */

document.getElementById("body-multiplier").textContent =
    formatMultiplier(
        getRawValue(
            weapon,
            [
                "bodyMultiplier",
                "BodyMultiplier"
            ]
        )
    );


document.getElementById("head-multiplier").textContent =
    formatMultiplier(
        getRawValue(
            weapon,
            [
                "headMultiplier",
                "HeadMultiplier"
            ]
        )
    );


document.getElementById("arm-multiplier").textContent =
    formatMultiplier(
        getRawValue(
            weapon,
            [
                "armMultiplier",
                "ArmMultiplier"
            ]
        )
    );


document.getElementById("leg-multiplier").textContent =
    formatMultiplier(
        getRawValue(
            weapon,
            [
                "legMultiplier",
                "LegMultiplier"
            ]
        )
    );


/*
 * ---------------------------------------------------------
 * IMAGE
 * ---------------------------------------------------------
 */

setupImage(weapon);


/*
 * ---------------------------------------------------------
 * TITRE DE LA PAGE
 * ---------------------------------------------------------
 */

document.title =
    `${weapon.name ?? "Arme"} - Anopoly Wiki`;


}

/*

* =============================================================
* NAVIGATION PRÉCÉDENT / SUIVANT
* =============================================================
  */

function setupNavigation(currentWeapon, weapons) {


const previousContainer =
    document.getElementById(
        "previous-container"
    );

const nextContainer =
    document.getElementById(
        "next-container"
    );


/*
 * Nettoyage
 */

previousContainer.innerHTML = "";
nextContainer.innerHTML = "";


/*
 * =========================================================
 * FILTRE DE CATÉGORIE
 * =========================================================
 *
 * C'est ici que l'on empêche la navigation de changer
 * de catégorie.
 */

const category =
    currentWeapon.category;


const sameCategoryWeapons =
    weapons.filter(
        weapon =>
            weapon.category === category
    );


/*
 * Si l'arme n'a pas de catégorie, on désactive
 * complètement la navigation.
 */

if (!category || sameCategoryWeapons.length === 0) {
    return;
}


/*
 * =========================================================
 * POSITION DANS LA CATÉGORIE
 * =========================================================
 */

const currentIndex =
    sameCategoryWeapons.findIndex(
        weapon =>
            String(weapon.id) ===
            String(currentWeapon.id)
    );


if (currentIndex === -1) {
    return;
}


/*
 * =========================================================
 * ARME PRÉCÉDENTE
 * =========================================================
 */

if (currentIndex > 0) {

    const previousWeapon =
        sameCategoryWeapons[currentIndex - 1];

    previousContainer.innerHTML =
        createNavigationCard(
            previousWeapon,
            "previous"
        );
}


/*
 * =========================================================
 * ARME SUIVANTE
 * =========================================================
 */

if (
    currentIndex <
    sameCategoryWeapons.length - 1
) {

    const nextWeapon =
        sameCategoryWeapons[currentIndex + 1];

    nextContainer.innerHTML =
        createNavigationCard(
            nextWeapon,
            "next"
        );
}


}

/*

* =============================================================
* CRÉATION D'UNE CARTE DE NAVIGATION
* =============================================================
  */

function createNavigationCard(weapon, direction) {


const arrow =
    direction === "previous"
        ? "←"
        : "→";


const label =
    direction === "previous"
        ? "PRÉCÉDENT"
        : "SUIVANT";


const imagePath =
    `images/weapons/${weapon.id}.webp`;


return `
    <a
        class="item-nav-card ${direction}"
        href="item.html?id=${encodeURIComponent(weapon.id)}">

        <div class="item-nav-direction">
            ${
                direction === "previous"
                    ? `${arrow} ${label}`
                    : `${label} ${arrow}`
            }
        </div>

        <div class="item-nav-content">

            <div class="item-nav-image">

                <img
                    src="${imagePath}"
                    alt="${escapeHtml(weapon.name ?? "")}"
                    onerror="this.style.display='none';">

            </div>

            <div class="item-nav-info">

                <span class="item-nav-category">
                    ${escapeHtml(
                        formatCategory(weapon.category)
                    )}
                </span>

                <strong>
                    ${escapeHtml(
                        weapon.name ?? "Arme inconnue"
                    )}
                </strong>

            </div>

        </div>

    </a>
`;


}

/*

* =============================================================
* LIEN RETOUR
* =============================================================
  */

function setupBackLink(weapon) {


const backLink =
    document.getElementById("back-link");

if (!backLink) {
    return;
}


const category =
    weapon.category;


if (category) {

    backLink.href =
        `category.html?type=${encodeURIComponent(category)}`;

    backLink.textContent =
        `← Retour aux ${formatCategory(category)}`;

} else {

    backLink.href =
        "index.html";

    backLink.textContent =
        "← Retour à la database";

}


}

/*

* =============================================================
* IMAGE
* =============================================================
  */

function setupImage(weapon) {


const image =
    document.getElementById(
        "weapon-image"
    );

const placeholder =
    document.getElementById(
        "weapon-image-placeholder"
    );


if (!image) {
    return;
}


const imagePath =
    `images/weapons/${weapon.id}.webp`;


image.src = imagePath;
image.alt = weapon.name ?? "";


image.style.display = "block";

if (placeholder) {
    placeholder.style.display = "none";
}


image.onerror = () => {

    image.style.display = "none";

    if (placeholder) {
        placeholder.style.display = "flex";
    }

};


}

/*

* =============================================================
* RÉCUPÉRATION D'UNE VALEUR
* =============================================================
  */

function getRawValue(object, keys) {


for (const key of keys) {

    if (
        object[key] !== undefined &&
        object[key] !== null
    ) {
        return object[key];
    }

}

return null;


}

function getValue(object, keys) {


const value =
    getRawValue(object, keys);


if (
    value === null ||
    value === undefined ||
    value === ""
) {
    return "-";
}


return value;


}

/*

* =============================================================
* MULTIPLICATEUR
* =============================================================
  */

function formatMultiplier(value) {


if (
    value === null ||
    value === undefined ||
    value === ""
) {
    return "-";
}


const number =
    Number(value);


if (Number.isNaN(number)) {
    return `${value}×`;
}


return `${number.toFixed(2)}×`;


}

/*

* =============================================================
* CATÉGORIE
* =============================================================
  */

function formatCategory(category) {


if (!category) {
    return "Non renseigné";
}


return String(category)
    .split("-")
    .map(
        word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
    )
    .join(" ");


}

/*

* =============================================================
* PROTECTION HTML
* =============================================================
  */

function escapeHtml(value) {


return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");


}

/*

* =============================================================
* ERREUR
* =============================================================
  */

function showError() {


const page =
    document.querySelector(".item-page");


if (!page) {
    return;
}


page.innerHTML = `

    <div class="error-message">

        <h1>
            Arme introuvable
        </h1>

        <p>
            L'arme demandée n'existe pas ou
            n'a pas pu être chargée.
        </p>

        <a
            href="index.html"
            class="back-button">

            ← Retour à la database

        </a>

    </div>

`;


}
