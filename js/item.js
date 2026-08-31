document.addEventListener("DOMContentLoaded", async () => {

    /*
     * =====================================================
     * INITIALISATION
     * =====================================================
     */

    const params = new URLSearchParams(window.location.search);
    const weaponId = params.get("id");

    if (!weaponId) {
        showError();
        return;
    }


    try {

        /*
         * =================================================
         * CHARGEMENT DU JSON
         * =================================================
         */

        const response = await fetch("data/weapons.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Impossible de charger weapons.json (${response.status})`
            );
        }


        const weapons = await response.json();


        /*
         * Vérification du format
         */

        if (!Array.isArray(weapons)) {

            throw new Error(
                "weapons.json doit contenir un tableau d'armes."
            );

        }


        /*
         * =================================================
         * RECHERCHE DE L'ARME
         * =================================================
         */

        const weaponIndex = weapons.findIndex(
            weapon =>
                String(weapon.id) === String(weaponId)
        );


        if (weaponIndex === -1) {

            showError();
            return;

        }


        const weapon = weapons[weaponIndex];


        /*
         * =================================================
         * AFFICHAGE
         * =================================================
         */

        displayWeapon(weapon);


        /*
         * =================================================
         * NAVIGATION PRÉCÉDENT / SUIVANT
         * =================================================
         */

        setupNavigation(
            weapons,
            weaponIndex
        );


        /*
         * =================================================
         * TITRE
         * =================================================
         */

        document.title =
            `${weapon.name || "Arme"} - ANOPOLY`;


    } catch (error) {

        console.error(
            "Erreur lors du chargement de l'arme :",
            error
        );

        showError();

    }

});


/*
 * =========================================================
 * AFFICHAGE DE L'ARME
 * =========================================================
 */

function displayWeapon(weapon) {

    /*
     * -----------------------------------------------------
     * NOM
     * -----------------------------------------------------
     */

    setText(
        "weapon-name",
        weapon.name
    );


    /*
     * -----------------------------------------------------
     * CATÉGORIE
     * -----------------------------------------------------
     */

    const category =
        formatCategory(weapon.category);

    setText(
        "weapon-category",
        category
    );

    setText(
        "weapon-category-info",
        category
    );


    /*
     * -----------------------------------------------------
     * ID
     * -----------------------------------------------------
     */

    setText(
        "weapon-id",
        weapon.id
    );


    /*
     * -----------------------------------------------------
     * CALIBRE
     * -----------------------------------------------------
     */

    const caliber =
        weapon.caliber ?? "Non renseigné";

    setText(
        "weapon-caliber",
        caliber
    );

    setText(
        "weapon-caliber-info",
        caliber
    );


    /*
     * =====================================================
     * STATISTIQUES
     * =====================================================
     */

    setText(
        "damage",
        getValue(
            weapon.damage
        )
    );


    setText(
        "fire-rate",
        getValue(
            weapon.fireRate
        )
    );


    setText(
        "magazine",
        getValue(
            weapon.magazine
        )
    );


    setText(
        "reload-time",
        getValue(
            weapon.reloadTime
        )
    );


    setText(
        "range",
        getValue(
            weapon.range
        )
    );


    setText(
        "spread",
        getValue(
            weapon.spread
        )
    );


    setText(
        "ergonomics",
        getValue(
            weapon.ergonomics
        )
    );


    setText(
        "weight",
        getValue(
            weapon.weight
        )
    );


    /*
     * =====================================================
     * MULTIPLICATEURS
     * =====================================================
     */

    setText(
        "body-multiplier",
        formatMultiplier(
            weapon.bodyMultiplier,
            "1.00"
        )
    );


    setText(
        "head-multiplier",
        formatMultiplier(
            weapon.headMultiplier
        )
    );


    setText(
        "arm-multiplier",
        formatMultiplier(
            weapon.armMultiplier
        )
    );


    setText(
        "leg-multiplier",
        formatMultiplier(
            weapon.legMultiplier
        )
    );


    /*
     * =====================================================
     * IMAGE
     * =====================================================
     */

    const image =
        document.getElementById("weapon-image");

    if (image) {

        image.style.display = "block";

        image.src =
            `images/weapons/${weapon.id}.webp`;

        image.alt =
            weapon.name || "Arme";

        image.onerror = () => {

            image.style.display = "none";

        };

    }

}


/*
 * =========================================================
 * NAVIGATION ENTRE LES ARMES
 * =========================================================
 */

function setupNavigation(
    weapons,
    currentIndex
) {

    /*
     * Pas de navigation si une seule arme existe.
     */

    if (weapons.length <= 1) {
        return;
    }


    /*
     * =====================================================
     * INDEX PRÉCÉDENT
     * =====================================================
     *
     * Si on est sur la première arme,
     * on revient à la dernière.
     */

    const previousIndex =
        currentIndex === 0
            ? weapons.length - 1
            : currentIndex - 1;


    /*
     * =====================================================
     * INDEX SUIVANT
     * =====================================================
     *
     * Si on est sur la dernière arme,
     * on revient à la première.
     */

    const nextIndex =
        currentIndex === weapons.length - 1
            ? 0
            : currentIndex + 1;


    const previousWeapon =
        weapons[previousIndex];

    const nextWeapon =
        weapons[nextIndex];


    /*
     * =====================================================
     * CARTE PRÉCÉDENTE
     * =====================================================
     */

    setupNavigationCard(
        "previous-weapon",
        "previous-image",
        "previous-category",
        "previous-name",
        "previous-caliber",
        previousWeapon
    );


    /*
     * =====================================================
     * CARTE SUIVANTE
     * =====================================================
     */

    setupNavigationCard(
        "next-weapon",
        "next-image",
        "next-category",
        "next-name",
        "next-caliber",
        nextWeapon
    );


    /*
     * Affiche la navigation.
     */

    const navigation =
        document.getElementById("item-navigation");

    if (navigation) {

        navigation.hidden = false;

    }

}


/*
 * =========================================================
 * CARTE DE NAVIGATION
 * =========================================================
 */

function setupNavigationCard(
    linkId,
    imageId,
    categoryId,
    nameId,
    caliberId,
    weapon
) {

    if (!weapon) {
        return;
    }


    /*
     * -----------------------------------------------------
     * LIEN
     * -----------------------------------------------------
     */

    const link =
        document.getElementById(linkId);

    if (link) {

        link.href =
            `item.html?id=${encodeURIComponent(weapon.id)}`;

    }


    /*
     * -----------------------------------------------------
     * IMAGE
     * -----------------------------------------------------
     */

    const image =
        document.getElementById(imageId);

    if (image) {

        image.src =
            `images/weapons/${weapon.id}.webp`;

        image.alt =
            weapon.name || "Arme";

        image.onerror = () => {

            image.style.display = "none";

        };

    }


    /*
     * -----------------------------------------------------
     * CATÉGORIE
     * -----------------------------------------------------
     */

    setText(
        categoryId,
        formatCategory(
            weapon.category
        )
    );


    /*
     * -----------------------------------------------------
     * NOM
     * -----------------------------------------------------
 */

    setText(
        nameId,
        weapon.name ?? "Arme inconnue"
    );


    /*
     * -----------------------------------------------------
     * CALIBRE
     * -----------------------------------------------------
     */

    setText(
        caliberId,
        weapon.caliber ?? "Calibre inconnu"
    );

}


/*
 * =========================================================
 * FORMATAGE DES CATÉGORIES
 * =========================================================
 */

function formatCategory(category) {

    if (
        category === undefined ||
        category === null ||
        category === ""
    ) {

        return "Non renseigné";

    }


    return String(category)
        .replace(/[-_]/g, " ")
        .split(" ")
        .filter(word => word.length > 0)
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ");

}


/*
 * =========================================================
 * FORMATAGE DES MULTIPLICATEURS
 * =========================================================
 */

function formatMultiplier(
    value,
    fallback = "—"
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return fallback;

    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return fallback;

    }


    return `${number.toFixed(2)}×`;

}


/*
 * =========================================================
 * VALEURS DES STATS
 * =========================================================
 */

function getValue(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "—";

    }


    return value;

}


/*
 * =========================================================
 * MODIFICATION DE TEXTE SÉCURISÉE
 * =========================================================
 */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }


    element.textContent =
        value === undefined ||
        value === null ||
        value === ""
            ? "—"
            : value;

}


/*
 * =========================================================
 * ERREUR
 * =========================================================
 */

function showError() {

    const error =
        document.getElementById("error-message");

    if (error) {

        error.hidden = false;

    }


    /*
     * Cache les éléments de la page
     * lorsque l'arme n'existe pas.
     */

    const sections =
        document.querySelectorAll(
            ".item-header, .item-section, .item-back, .item-navigation"
        );


    sections.forEach(
        section => {
            section.style.display = "none";
        }
    );

}
