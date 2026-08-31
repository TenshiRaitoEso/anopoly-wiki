document.addEventListener("DOMContentLoaded", async () => {

    // Récupère l'id dans l'URL
    // Exemple : item.html?id=ak-104
    const params = new URLSearchParams(window.location.search);
    const weaponId = params.get("id");

    if (!weaponId) {
        showError();
        return;
    }

    try {

        // Charge le fichier JSON
        const response = await fetch("data/weapons.json");

        if (!response.ok) {
            throw new Error("Impossible de charger weapons.json");
        }

        const weapons = await response.json();

        // Recherche l'arme
        const weapon = weapons.find(
            item => item.id === weaponId
        );

        if (!weapon) {
            showError();
            return;
        }

        // Affiche l'arme
        displayWeapon(weapon);

    } catch (error) {

        console.error(error);
        showError();

    }

});


function displayWeapon(weapon) {

    /*
     * =========================
     * INFORMATIONS PRINCIPALES
     * =========================
     */

    document.getElementById("weapon-name").textContent =
        weapon.name;

    document.getElementById("weapon-category").textContent =
        formatCategory(weapon.category);

    document.getElementById("weapon-id").textContent =
        weapon.id;

    document.getElementById("weapon-category-info").textContent =
        formatCategory(weapon.category);


    /*
     * =========================
     * CALIBRE
     * =========================
     */

    const caliber =
        weapon.caliber || "Non renseigné";

    document.getElementById("weapon-caliber").textContent =
        caliber;

    document.getElementById("weapon-caliber-info").textContent =
        caliber;


    /*
     * =========================
     * STATISTIQUES
     * =========================
     */

    document.getElementById("damage").textContent =
        weapon.damage ?? "-";

    document.getElementById("fire-rate").textContent =
        weapon.fireRate ?? "-";

    document.getElementById("magazine").textContent =
        weapon.magazine ?? "-";

    document.getElementById("reload-time").textContent =
        weapon.reloadTime ?? "-";

    document.getElementById("range").textContent =
        weapon.range ?? "-";

    document.getElementById("spread").textContent =
        weapon.spread ?? "-";

    document.getElementById("ergonomics").textContent =
        weapon.ergonomics ?? "-";

    document.getElementById("weight").textContent =
        weapon.weight ?? "-";


    /*
     * =========================
     * MULTIPLICATEURS
     * =========================
     *
     * Pour le moment ils ne sont
     * pas encore dans weapons.json.
     */

    document.getElementById("body-multiplier").textContent =
        formatMultiplier(weapon.bodyMultiplier, "1.00");

    document.getElementById("head-multiplier").textContent =
        formatMultiplier(weapon.headMultiplier);

    document.getElementById("arm-multiplier").textContent =
        formatMultiplier(weapon.armMultiplier);

    document.getElementById("leg-multiplier").textContent =
        formatMultiplier(weapon.legMultiplier);


    /*
     * =========================
     * IMAGE
     * =========================
     *
     * On pourra utiliser :
     *
     * images/weapons/ak-104.webp
     *
     * grâce à l'id de l'arme.
     */

    const image = document.getElementById("weapon-image");

    image.src = `images/weapons/${weapon.id}.webp`;

    image.alt = weapon.name;

    image.onerror = () => {
        image.style.display = "none";
    };


    /*
     * =========================
     * TITRE DE LA PAGE
     * =========================
     */

    document.title =
        `${weapon.name} - Anopoly Wiki`;
}


/*
 * Transforme :
 *
 * assault-rifle
 * → Assault Rifle
 *
 * machine-gun
 * → Machine Gun
 */

function formatCategory(category) {

    if (!category) {
        return "Non renseigné";
    }

    return category
        .split("-")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}


/*
 * Affichage des multiplicateurs
 */

function formatMultiplier(value, fallback = "-") {

    if (value === undefined || value === null) {
        return fallback;
    }

    return `${Number(value).toFixed(2)}×`;
}


/*
 * Erreur
 */

function showError() {

    document.querySelector(".item-page").innerHTML = `
        <a href="weapons.html" class="back-button">
            ← Retour aux armes
        </a>

        <div class="error-message">
            <h1>Arme introuvable</h1>
            <p>
                L'arme demandée n'existe pas ou
                n'a pas pu être chargée.
            </p>
        </div>
    `;

}
