document.addEventListener("DOMContentLoaded", async () => {

```
// =========================================================
// RÉCUPÉRATION DES PARAMÈTRES URL
// =========================================================

const params = new URLSearchParams(window.location.search);

const type = params.get("type");
const id = params.get("id");


console.log("=================================");
console.log("ITEM.JS");
console.log("Type :", type);
console.log("ID :", id);
console.log("=================================");


// =========================================================
// ÉLÉMENTS HTML
// =========================================================

const title = document.getElementById("itemTitle");
const eyebrow = document.getElementById("itemEyebrow");
const description = document.getElementById("itemDescription");

const breadcrumbName =
    document.getElementById("breadcrumbName");

const image =
    document.getElementById("itemImage");

const noImage =
    document.getElementById("noImage");

const error =
    document.getElementById("itemError");


// =========================================================
// VÉRIFICATION DES PARAMÈTRES
// =========================================================

if (!type || !id) {

    showError(
        "Paramètres manquants dans l'URL."
    );

    return;
}


// =========================================================
// BASES DE DONNÉES DISPONIBLES
// =========================================================

const databases = {

    weapons: {
        file: "weapons",
        eyebrow: "WEAPON DATABASE"
    },

    armors: {
        file: "armors",
        eyebrow: "ARMOR DATABASE"
    },

    artifacts: {
        file: "artifacts",
        eyebrow: "ARTIFACT DATABASE"
    }

};


const databaseInfo =
    databases[type];


if (!databaseInfo) {

    showError(
        "Type d'élément inconnu."
    );

    return;
}


// =========================================================
// CHARGEMENT DU JSON
// =========================================================

const jsonPath =
    `data/${databaseInfo.file}.json`;


console.log("JSON :", jsonPath);


try {

    const response =
        await fetch(jsonPath);


    console.log(
        "HTTP status :",
        response.status
    );


    if (!response.ok) {

        throw new Error(
            `Impossible de charger ${jsonPath}`
        );
    }


    const database =
        await response.json();


    // =====================================================
    // VÉRIFICATION DU FORMAT
    // =====================================================

    if (!Array.isArray(database)) {

        throw new Error(
            "Le JSON doit contenir un tableau."
        );
    }


    // =====================================================
    // RECHERCHE DE L'ÉLÉMENT
    // =====================================================

    const item =
        database.find(
            entry => entry.id === id
        );


    if (!item) {

        showError(
            `L'élément "${id}" est introuvable.`
        );

        return;
    }


    console.log(
        "Élément trouvé :",
        item
    );


    // =====================================================
    // AFFICHAGE
    // =====================================================

    displayItem(
        item,
        type,
        databaseInfo
    );


} catch (err) {

    console.error(
        "ERREUR ITEM.JS :",
        err
    );

    showError(
        "Impossible de charger la base de données."
    );

}


// =========================================================
// FONCTION D'AFFICHAGE
// =========================================================

function displayItem(item, type, databaseInfo) {

    // -----------------------------------------------------
    // TITRE
    // -----------------------------------------------------

    document.title =
        `ANOPOLY — ${item.name || "Database"}`;


    title.textContent =
        item.name || "Objet sans nom";


    breadcrumbName.textContent =
        item.name || "Objet";


    eyebrow.textContent =
        databaseInfo.eyebrow;


    // -----------------------------------------------------
    // DESCRIPTION
    // -----------------------------------------------------

    if (item.description) {

        description.textContent =
            item.description;

    } else {

        description.textContent = "";
    }


    // -----------------------------------------------------
    // IMAGE
    // -----------------------------------------------------

    if (item.image) {

        image.src =
            item.image;

        image.alt =
            item.name || "Objet";


        image.onload = () => {

            image.style.display =
                "block";

            noImage.style.display =
                "none";
        };


        image.onerror = () => {

            image.style.display =
                "none";

            noImage.style.display =
                "flex";
        };

    } else {

        image.style.display =
            "none";

        noImage.style.display =
            "flex";
    }


    // -----------------------------------------------------
    // ARMES
    // -----------------------------------------------------

    if (type === "weapons") {

        displayWeapon(item);

    }


    // -----------------------------------------------------
    // DESCRIPTION COMPLÈTE
    // -----------------------------------------------------

    if (item.description) {

        const fullDescription =
            document.getElementById(
                "fullDescription"
            );

        const descriptionSection =
            document.getElementById(
                "descriptionSection"
            );


        fullDescription.textContent =
            item.description;


        descriptionSection.style.display =
            "block";
    }

}


// =========================================================
// AFFICHAGE D'UNE ARME
// =========================================================

function displayWeapon(weapon) {

    setStat(
        "statCaliber",
        weapon.caliber,
        ""
    );


    setStat(
        "statWeight",
        weapon.weight,
        weapon.weight !== undefined
            ? " kg"
            : ""
    );


    setStat(
        "statMagazine",
        weapon.magazine,
        weapon.magazine !== undefined
            ? " rounds"
            : ""
    );


    setStat(
        "statRange",
        weapon.range,
        weapon.range !== undefined
            ? " m"
            : ""
    );


    setStat(
        "statDamage",
        weapon.damage,
        ""
    );


    setStat(
        "statRPM",
        weapon.rpm,
        weapon.rpm !== undefined
            ? " RPM"
            : ""
    );


    setStat(
        "statHeadshot",
        weapon.headshotMultiplier,
        weapon.headshotMultiplier !== undefined
            ? "x"
            : ""
    );

}


// =========================================================
// AFFICHAGE D'UNE STATISTIQUE
// =========================================================

function setStat(elementId, value, suffix) {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        element.textContent =
            "—";

        return;
    }


    element.textContent =
        `${value}${suffix}`;
}


// =========================================================
// AFFICHAGE D'UNE ERREUR
// =========================================================

function showError(message) {

    if (error) {

        error.textContent =
            message;

        error.style.display =
            "block";
    }

}
```

});
