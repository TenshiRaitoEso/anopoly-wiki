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

                children.classList.toggle(
                    "open",
                    !expanded
                );

            });

        });

}


/* =========================================================
   CHARGEMENT DATABASE
========================================================= */

async function loadDatabase() {

    const [weaponsResponse, artifactsResponse] =
        await Promise.all([
            fetch("data/weapons.json"),
            fetch("data/artifacts.json")
        ]);


    if (!weaponsResponse.ok) {

        throw new Error(
            "Impossible de charger weapons.json"
        );

    }


    if (!artifactsResponse.ok) {

        throw new Error(
            "Impossible de charger artifacts.json"
        );

    }


    const weaponsData =
        await weaponsResponse.json();

    const artifactsData =
        await artifactsResponse.json();


    return {

        weapons:
            Array.isArray(weaponsData)
                ? weaponsData
                : weaponsData.weapons || [],

        artifacts:
            Array.isArray(artifactsData)
                ? artifactsData
                : artifactsData.artifacts || []

    };

}


/* =========================================================
   FILTRAGE
========================================================= */

function getItemsForCategory(data, type) {

    if (type === "artifacts") {

        return data.artifacts;

    }


    return data.weapons.filter(
        weapon =>
            normalizeType(weapon.category)
            === normalizeType(type)
    );

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
   TITRES CATEGORIES
========================================================= */

const categoryNames = {

    smg: "SMG",

    shotgun: "SHOTGUN",

    "machine-gun": "MACHINE GUN",

    "assault-rifle": "ASSAULT RIFLE",

    sniper: "SNIPER",

    dmr: "DMR",

    artifacts: "ARTEFACTS",

    "armor-combat": "ARMURES — COMBAT",

    "armor-research": "ARMURES — RECHERCHE",

    "armor-intermediate":
        "ARMURES — INTERMÉDIAIRE",

    "fort-bastion": "FORT BASTION",

    "dune-ensanglantee":
        "DUNE ENSANGLANTÉE",

    enemies: "ENNEMIS"

};


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
        "Protection polyvalente offrant un compromis entre mobilité et défense."

};


/* =========================================================
   HEADER
========================================================= */

function setupCategoryHeader(type, count) {

    const title =
        categoryNames[type]
        || formatCategory(type);

    const description =
        categoryDescriptions[type]
        || "Données disponibles dans la database ANOPOLY.";


    document.title =
        `${title} — ANOPOLY`;


    document.getElementById(
        "category-title"
    ).textContent = title;


    document.getElementById(
        "category-eyebrow"
    ).textContent =
        `ANOPOLY // ${title}`;


    document.getElementById(
        "breadcrumb-category"
    ).textContent = title;


    document.getElementById(
        "category-description"
    ).textContent = description;


    document.getElementById(
        "category-count"
    ).textContent =
        `${String(count).padStart(2, "0")} ITEMS`;

}


/* =========================================================
   RENDU DES CARTES
========================================================= */

function renderItems(items, type) {

    const grid =
        document.getElementById("database-grid");

    grid.innerHTML = "";


    items.forEach(item => {

        const card =
            createItemCard(item, type);

        grid.appendChild(card);

    });

}


/* =========================================================
   CARTE
========================================================= */

function createItemCard(item, type) {

    const card =
        document.createElement("a");


    card.className =
        "database-card";


    card.href =
        `item.html?id=${encodeURIComponent(item.id)}&type=${encodeURIComponent(type)}`;


    /* IMAGE */

    const imageContainer =
        document.createElement("div");

    imageContainer.className =
        "database-card-image";


    const image =
        document.createElement("img");


    const imagePath =
        getItemImage(item);


    if (imagePath) {

        image.src = imagePath;

        image.alt =
            item.name || "Item";

        image.loading = "lazy";

        image.onerror = () => {

            image.style.display = "none";

            imageContainer.classList.add(
                "image-missing"
            );

            imageContainer.dataset.label =
                "IMAGE NON DISPONIBLE";

        };

        imageContainer.appendChild(image);

    } else {

        imageContainer.classList.add(
            "image-missing"
        );

        imageContainer.dataset.label =
            "IMAGE NON DISPONIBLE";

    }


    /* INFORMATIONS */

    const info =
        document.createElement("div");

    info.className =
        "database-card-info";


    const name =
        document.createElement("h2");

    name.textContent =
        item.name || "Sans nom";


    info.appendChild(name);


    const metadata =
        document.createElement("div");

    metadata.className =
        "database-card-rarity";


    if (type === "artifacts") {

        metadata.textContent =
            formatRarity(
                item.rarity
            );

    } else {

        metadata.textContent =
            formatCategory(
                item.category
            );

    }


    info.appendChild(metadata);


    card.appendChild(imageContainer);

    card.appendChild(info);


    return card;

}


/* =========================================================
   IMAGE
========================================================= */

function getItemImage(item) {

    /*
     * Si le JSON possède déjà un chemin d'image,
     * on l'utilise.
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
     * Fallback automatique par ID.
     */

    if (item.id) {

        return `images/${item.id}.webp`;

    }


    return null;

}


/* =========================================================
   FORMATAGE
========================================================= */

function formatCategory(category) {

    if (!category) {

        return "NON RENSEIGNÉ";

    }

    return String(category)
        .replaceAll("-", " ")
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase()
                + word.slice(1)
        )
        .join(" ");

}


function formatRarity(rarity) {

    if (!rarity) {

        return "QUALITÉ NON RENSEIGNÉE";

    }

    const names = {

        Common: "COMMON",

        Uncommon: "UNCOMMON",

        Rare: "RARE",

        Epic: "EPIC",

        Legendary: "LEGENDARY",

        Quest: "QUEST"

    };

    return names[rarity]
        || String(rarity).toUpperCase();

}


/* =========================================================
   ERREUR
========================================================= */

function showCategoryError() {

    document.getElementById(
        "database-grid"
    ).innerHTML = "";


    document.getElementById(
        "category-error"
    ).hidden = false;

}
