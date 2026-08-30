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
            description: "Liste des artefacts.",
            database: "artifacts",
            filter: null
        }
    };

    const category = categories[type];

    if (!category) {
        title.textContent = "DATABASE";
        eyebrow.textContent = "ARCHIVE";
        description.textContent = "Section inconnue.";
        emptyMessage.style.display = "block";
        return;
    }

    document.title = "ANOPOLY — " + category.title;
    title.textContent = category.title;
    eyebrow.textContent = category.eyebrow;
    description.textContent = category.description;

    grid.innerHTML = "";
    emptyMessage.style.display = "none";

    const jsonPath = `data/${category.database}.json`;

    console.log("=================================");
    console.log("CATEGORY.JS");
    console.log("Type :", type);
    console.log("JSON :", jsonPath);
    console.log("=================================");

    try {
        const response = await fetch(jsonPath);

        console.log("HTTP status :", response.status);
        console.log("Réponse OK :", response.ok);

        if (!response.ok) {
            throw new Error(
                `Impossible de charger ${jsonPath} (HTTP ${response.status})`
            );
        }

        const database = await response.json();

        console.log("JSON chargé :", database);
        console.log("Nombre total :", database.length);

        if (!Array.isArray(database)) {
            throw new Error("Le JSON doit contenir un tableau.");
        }

        const items = category.filter
            ? database.filter(item => item.category === category.filter)
            : database;

        console.log("Filtre :", category.filter);
        console.log("Objets trouvés :", items.length);
        console.log(items);

        if (items.length === 0) {
            emptyMessage.textContent =
                "Aucun élément disponible dans cette catégorie.";
            emptyMessage.style.display = "block";
            return;
        }

        items.forEach(item => {
            const card = createCard(item, category.database);
            grid.appendChild(card);
        });

        console.log("Cartes générées :", grid.children.length);

    } catch (error) {
        console.error("ERREUR CATEGORY.JS :", error);

        emptyMessage.textContent =
            "Impossible de charger la base de données.";

        emptyMessage.style.display = "block";
    }
});


function createCard(item, database) {
    const card = document.createElement("a");

    card.className = "database-card";
    card.href =
        `item.html?type=${database}&id=${encodeURIComponent(item.id)}`;

    const imageContainer = document.createElement("div");

    imageContainer.className = "database-card-image";

    if (item.image) {
        const image = document.createElement("img");

        image.src = item.image;
        image.alt = item.name || "Objet";
        image.loading = "lazy";

        image.onerror = () => {
            image.remove();
            imageContainer.textContent = "NO IMAGE";
        };

        imageContainer.appendChild(image);
    } else {
        imageContainer.textContent = "NO IMAGE";
    }

    const info = document.createElement("div");
    info.className = "database-card-info";

    const name = document.createElement("h2");
    name.textContent = item.name || "Objet sans nom";

    info.appendChild(name);

    if (database === "artifacts" && item.rarity) {
        const rarity = document.createElement("div");

        rarity.className = "database-card-rarity";
        rarity.textContent = item.rarity;

        info.appendChild(rarity);
    }

    card.appendChild(imageContainer);
    card.appendChild(info);

    return card;
}