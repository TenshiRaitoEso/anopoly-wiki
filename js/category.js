document.addEventListener("DOMContentLoaded", async () => {

    initializeNavigation();

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (!type) {
        showCategoryError();
        return;
    }

    try {

        const data = await loadDatabase();

        const items = getItemsForCategory(data, type);

        if (!items.length) {
            showCategoryError();
            return;
        }

        setupCategoryHeader(type, items.length);

        renderItems(items, type);

    } catch (error) {

        console.error(
            "Erreur lors du chargement de la catégorie :",
            error
        );

        showCategoryError();

    }

});


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const menuButton =
        document.getElementById("menuBtn");

    const sidebar =
        document.getElementById("sidebar");


    if (menuButton && sidebar) {

        menuButton.addEventListener("click", () => {

            sidebar.classList.toggle("mobile-open");

        });

    }


    document
        .querySelectorAll(".nav-parent")
        .forEach(button => {

            button.addEventListener("click", () => {

                const children =
                    button.nextElementSibling;

                const expanded =
                    button.getAttribute("aria-expanded")
                    === "true";

                button.setAttribute(
                    "aria-expanded",
                    String(!expanded)
                );

                if (children) {

                    children.classList.toggle(
                        "open",
                        !expanded
                    );

                }

            });

        });

}


/* =========================================================
   CHARGEMENT DES DATABASES
========================================================= */

async function loadDatabase() {

    const [
        weaponsResponse,
        armorsResponse,
        mapsResponse,
        enemiesResponse,
        artifactsResponse
    ] = await Promise.all([

        fetch("data/weapons.json"),

        fetch("data/armors.json"),

        fetch("data/maps.json"),

        fetch("data/enemies.json"),

        fetch("data/artifacts.json")

    ]);


    if (!weaponsResponse.ok) {

        throw new Error(
            "Impossible de charger weapons.json"
        );

    }


    if (!armorsResponse.ok) {

        throw new Error(
            "Impossible de charger armors.json"
        );

    }


    if (!mapsResponse.ok) {

        throw new Error(
            "Impossible de charger maps.json"
        );

    }


    if (!enemiesResponse.ok) {

        throw new Error(
            "Impossible de charger enemies.json"
        );

    }


    if (!artifactsResponse.ok) {

        throw new Error(
            "Impossible de charger artifacts.json"
        );

    }


    const [
        weaponsData,
        armorsData,
        mapsData,
        enemiesData,
        artifactsData
    ] = await Promise.all([

        weaponsResponse.json(),

        armorsResponse.json(),

        mapsResponse.json(),

        enemiesResponse.json(),

        artifactsResponse.json()

    ]);


    return {

        weapons: extractArray(
            weaponsData,
            "weapons"
        ),

        armors: extractArray(
            armorsData,
            "armors"
        ),

        maps: extractArray(
            mapsData,
            "maps"
        ),

        enemies: extractArray(
            enemiesData,
            "enemies"
        ),

        artifacts: extractArray(
            artifactsData,
            "artifacts"
        )

    };

}


/* =========================================================
   EXTRACTION TABLEAU JSON
========================================================= */

function extractArray(data, propertyName) {

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(data[propertyName])
    ) {

        return data[propertyName];

    }


    return [];

}


/* =========================================================
   FILTRAGE
========================================================= */

function getItemsForCategory(data, type) {

    const normalizedType =
        normalizeType(type);


    /*
     * -------------------------------------------------------
     * ARMES
     * -------------------------------------------------------
     *
     * Les catégories SMG, Shotgun, etc. appartiennent
     * exclusivement à weapons.json.
     */

    const weaponCategories = [

        "smg",

        "shotgun",

        "machine-gun",

        "assault-rifle",

        "sniper",

        "dmr"

    ];


    if (
        weaponCategories.includes(
            normalizedType
        )
    ) {

        return data.weapons.filter(
            weapon =>
                normalizeType(
                    weapon.category
                ) === normalizedType
        );

    }


    /*
     * -------------------------------------------------------
     * ARMURES
     * -------------------------------------------------------
     */

    if (
        normalizedType === "armor-combat"
        ||
        normalizedType === "armor-research"
        ||
        normalizedType === "armor-intermediate"
    ) {

        const armorCategory =
            normalizedType.replace(
                "armor-",
                ""
            );


        return data.armors.filter(
            armor => {

                const category =
                    normalizeType(
                        armor.category
                    );

                const typeValue =
                    normalizeType(
                        armor.type
                    );

                const subCategory =
                    normalizeType(
                        armor.subCategory
                    );

                return (

                    category === normalizedType

                    ||

                    category === armorCategory

                    ||

                    typeValue === normalizedType

                    ||

                    typeValue === armorCategory

                    ||

                    subCategory === normalizedType

                    ||

                    subCategory === armorCategory

                );

            }
        );

    }


    /*
     * -------------------------------------------------------
     * MAPS
     * -------------------------------------------------------
     */

    if (
        normalizedType === "fort-bastion"
        ||
        normalizedType === "dune-ensanglantee"
        ||
        normalizedType === "map-03"
        ||
        normalizedType === "map-04"
        ||
        normalizedType === "map-05"
        ||
        normalizedType === "map-06"
        ||
        normalizedType === "map-07"
    ) {

        return data.maps.filter(
            map => {

                const values = [

                    map.category,

                    map.type,

                    map.subCategory,

                    map.id,
                    
                    map.slug

                ];

                return values.some(
                    value =>
                        normalizeType(value)
                        === normalizedType
                );

            }
        );

    }


    /*
     * -------------------------------------------------------
     * ENNEMIS
     * -------------------------------------------------------
     */

    if (
        normalizedType === "enemies"
        ||
        normalizedType === "enemy"
    ) {

        return data.enemies;

    }


    /*
     * -------------------------------------------------------
     * ARTEFACTS
     * -------------------------------------------------------
     */

    if (
        normalizedType === "artifacts"
        ||
        normalizedType === "artifact"
    ) {

        return data.artifacts;

    }


    /*
     * -------------------------------------------------------
     * TYPE INCONNU
     * -------------------------------------------------------
     */

    return [];

}


/* =========================================================
   NORMALISATION
========================================================= */

function normalizeType(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .trim()
        .toLowerCase()
        .replaceAll("_", "-")
        .replaceAll(" ", "-");

}


/* =========================================================
   TITRES DES CATEGORIES
========================================================= */

const categoryNames = {

    smg:
        "SMG",

    shotgun:
        "SHOTGUN",

    "machine-gun":
        "MACHINE GUN",

    "assault-rifle":
        "ASSAULT RIFLE",

    sniper:
        "SNIPER",

    dmr:
        "DMR",


    artifacts:
        "ARTEFACTS",


    "armor-combat":
        "ARMURES — COMBAT",

    "armor-research":
        "ARMURES — RECHERCHE",

    "armor-intermediate":
        "ARMURES — INTERMÉDIAIRE",


    "fort-bastion":
        "FORT BASTION",

    "dune-ensanglantee":
        "DUNE ENSANGLANTÉE",

    "map-03":
        "MAP 03",

    "map-04":
        "MAP 04",

    "map-05":
        "MAP 05",

    "map-06":
        "MAP 06",

    "map-07":
        "MAP 07",


    enemies:
        "ENNEMIS"

};


/* =========================================================
   DESCRIPTIONS
========================================================= */

const categoryDescriptions = {

    smg:
        "Armes compactes conçues pour le combat rapproché.",

    shotgun:
        "Armes à dispersion destinées aux affrontements à courte portée.",

    "machine-gun":
        "Armes automatiques lourdes offrant un volume de feu important.",

    "assault-rifle":
        "Armes polyvalentes destinées au combat à moyenne portée.",

    sniper:
        "Armes de précision conçues pour les engagements à longue distance.",

    dmr:
        "Fusils semi-automatiques spécialisés dans les tirs de précision.",


    artifacts:
        "Objets anormaux possédant différents bonus, malus et propriétés.",


    "armor-combat":
        "Équipements de protection conçus pour les affrontements.",

    "armor-research":
        "Équipements spécialisés dans la recherche et l'exploration.",

    "armor-intermediate":
        "Protection polyvalente offrant un compromis entre mobilité et défense.",


    enemies:
        "Créatures et menaces rencontrées dans le monde d'ANOPOLY."


};


/* =========================================================
   HEADER
========================================================= */

function setupCategoryHeader(type, count) {

    const normalizedType =
        normalizeType(type);


    const title =
        categoryNames[normalizedType]
        ||
        formatCategory(normalizedType);


    const description =
        categoryDescriptions[normalizedType]
        ||
        "Données disponibles dans la database ANOPOLY.";


    document.title =
        `${title} — ANOPOLY`;


    const titleElement =
        document.getElementById(
            "category-title"
        );

    if (titleElement) {

        titleElement.textContent =
            title;

    }


    const eyebrowElement =
        document.getElementById(
            "category-eyebrow"
        );

    if (eyebrowElement) {

        eyebrowElement.textContent =
            `ANOPOLY // ${title}`;

    }


    const breadcrumbElement =
        document.getElementById(
            "breadcrumb-category"
        );

    if (breadcrumbElement) {

        breadcrumbElement.textContent =
            title;

    }


    const descriptionElement =
        document.getElementById(
            "category-description"
        );

    if (descriptionElement) {

        descriptionElement.textContent =
            description;

    }


    const countElement =
        document.getElementById(
            "category-count"
        );

    if (countElement) {

        countElement.textContent =
            `${String(count).padStart(2, "0")} ITEMS`;

    }

}


/* =========================================================
   RENDU DES CARTES
========================================================= */

function renderItems(items, database) {

    const grid =
        document.getElementById(
            "database-grid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = "";


    items.forEach(item => {

        const card =
            createItemCard(
                item,
                database
            );

        grid.appendChild(card);

    });

}


/* =========================================================
   CARTE
========================================================= */

function createItemCard(item, database) {

    const card =
        document.createElement("a");


    card.className =
        "database-card";


    /*
     * IMPORTANT
     *
     * Le type de database est maintenant TOUJOURS
     * transmis à item.html.
     *
     * Exemple :
     *
     * item.html?type=weapons&id=AK74
     *
     * Cela évite qu'un même ID présent dans plusieurs
     * bases soit interprété comme le mauvais objet.
     */

    card.href =
        `item.html?type=${encodeURIComponent(database)}&id=${encodeURIComponent(item.id)}`;


    /* =====================================================
       IMAGE
    ===================================================== */

    const imageContainer =
        document.createElement("div");


    imageContainer.className =
        "database-card-image";


    const image =
        document.createElement("img");


    const imagePath =
        getItemImage(
            item,
            database
        );


    if (imagePath) {

        image.src =
            imagePath;

        image.alt =
            item.name || "Item";

        image.loading =
            "lazy";


        image.onerror = () => {

            image.style.display =
                "none";

            imageContainer.classList.add(
                "image-missing"
            );

            imageContainer.dataset.label =
                "IMAGE NON DISPONIBLE";

        };


        imageContainer.appendChild(
            image
        );

    } else {

        imageContainer.classList.add(
            "image-missing"
        );

        imageContainer.dataset.label =
            "IMAGE NON DISPONIBLE";

    }


    /* =====================================================
       INFORMATIONS
    ===================================================== */

    const info =
        document.createElement("div");


    info.className =
        "database-card-info";


    const name =
        document.createElement("h2");


    name.textContent =
        item.name || "Sans nom";


    info.appendChild(
        name
    );


    const metadata =
        document.createElement("div");


    metadata.className =
        "database-card-rarity";


    if (
        normalizeType(database)
        === "artifacts"
    ) {

        metadata.textContent =
            formatRarity(
                item.rarity
            );

    } else {

        metadata.textContent =
            formatCategory(
                item.category
                ||
                item.type
                ||
                item.subCategory
            );

    }


    info.appendChild(
        metadata
    );


    card.appendChild(
        imageContainer
    );


    card.appendChild(
        info
    );


    return card;

}


/* =========================================================
   IMAGE
========================================================= */

function getItemImage(item, database) {

    /*
     * Le JSON possède déjà un chemin d'image.
     */

    if (item.image) {

        return item.image;

    }


    if (item.imagePath) {

        return item.imagePath;

    }


    if (item.icon) {

        return item.icon;

    }


    if (item.iconPath) {

        return item.iconPath;

    }


    /*
     * Fallback automatique.
     *
     * On ne force pas le nom de la database dans le chemin
     * afin de rester compatible avec l'organisation actuelle
     * des images.
     */

    if (item.id) {

        return `images/${item.id}.webp`;

    }


    return null;

}


/* =========================================================
   FORMATAGE CATEGORIE
========================================================= */

function formatCategory(category) {

    if (!category) {

        return "NON RENSEIGNÉ";

    }


    return String(category)
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .split(" ")
        .filter(Boolean)
        .map(
            word =>
                word.charAt(0).toUpperCase()
                +
                word.slice(1)
        )
        .join(" ");

}


/* =========================================================
   FORMATAGE RARETE
========================================================= */

function formatRarity(rarity) {

    if (!rarity) {

        return "QUALITÉ NON RENSEIGNÉE";

    }


    const names = {

        Common:
            "COMMON",

        Uncommon:
            "UNCOMMON",

        Rare:
            "RARE",

        Epic:
            "EPIC",

        Legendary:
            "LEGENDARY",

        Quest:
            "QUEST"

    };


    return names[rarity]
        ||
        String(rarity).toUpperCase();

}


/* =========================================================
   ERREUR
========================================================= */

function showCategoryError() {

    const grid =
        document.getElementById(
            "database-grid"
        );


    if (grid) {

        grid.innerHTML = "";

    }


    const error =
        document.getElementById(
            "category-error"
        );


    if (error) {

        error.hidden = false;

    }

}
