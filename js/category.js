document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") || "smg";

    const title = document.getElementById("title");
    const eyebrow = document.getElementById("eyebrow");
    const description = document.getElementById("description");
    const grid = document.getElementById("databaseGrid");
    const emptyMessage = document.getElementById("emptyMessage");

    const categories = {
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

        artifacts: {
            title: "ARTEFACTS",
            eyebrow: "ARTIFACT DATABASE",
            description: "Les artefacts seront ajoutés progressivement.",
            database: "artifacts",
            filter: null
        }
    };

    const category = categories[type];

    if (!category) {
        title.textContent = "DATABASE";
        eyebrow.textContent = "ARCHIVE";
        description.textContent = "Section inconnue.";

        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }

        return;
    }

    document.title = "ANOPOLY — " + category.title;
    title.textContent = category.title;
    eyebrow.textContent = category.eyebrow;
    description.textContent = category.description;

    try {
        const response = await fetch(`data/${category.database}.json`);

        if (!response.ok) {
            throw new Error(
                `Impossible de charger data/${category.database}.json`
            );
        }

        const database = await response.json();

        let items = database;

        if (category.filter) {
            items = database.filter(item => {
                return item.category === category.filter;
            });
        }

        if (!items.length) {
            if (emptyMessage) {
                emptyMessage.textContent =
                    "Aucun objet disponible dans cette catégorie.";

                emptyMessage.style.display = "block";
            }

            return;
        }

        if (grid) {
            grid.innerHTML = "";

            items.forEach(item => {
                const card = createCard(
                    item,
                    category.database
                );

                grid.appendChild(card);
            });
        }

        if (emptyMessage) {
            emptyMessage.style.display = "none";
        }

    } catch (error) {
        console.error("Erreur DATABASE :", error);

        if (emptyMessage) {
            emptyMessage.textContent =
                "Impossible de charger la base de données.";

            emptyMessage.style.display = "block";
        }
    }
});


function createCard(item, database) {
    const card = document.createElement("a");

    card.className = "database-card";

    card.href =
        `item.html?type=${database}&id=${encodeURIComponent(item.id)}`;

    const imageContainer =
        document.createElement("div");

    imageContainer.className =
        "database-card-image";

    if (item.image) {
        const image =
            document.createElement("img");

        image.src = item.image;
        image.alt = item.name || "Objet";
        image.loading = "lazy";

        imageContainer.appendChild(image);
    } else {
        imageContainer.textContent = "NO IMAGE";
    }

    const info =
        document.createElement("div");

    info.className =
        "database-card-info";

    const name =
        document.createElement("h2");

    name.textContent =
        item.name || "Objet sans nom";

    info.appendChild(name);

    if (database === "artifacts" && item.rarity) {
        const rarity =
            document.createElement("div");

        rarity.className =
            "database-card-rarity";

        rarity.textContent =
            item.rarity;

        info.appendChild(rarity);
    }

    card.appendChild(imageContainer);
    card.appendChild(info);

    return card;
}