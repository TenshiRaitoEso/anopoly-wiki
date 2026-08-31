document.addEventListener("DOMContentLoaded", async () => {

const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");

if (!itemId) {
    showError();
    return;
}

try {

    /*
     * =====================================================
     * CHARGEMENT DES DONNÉES
     * =====================================================
     */

    const [weaponsResponse, artifactsResponse] =
        await Promise.all([
            fetch("data/weapons.json"),
            fetch("data/artifacts.json")
        ]);

    if (!weaponsResponse.ok) {
        throw new Error("Impossible de charger weapons.json");
    }

    if (!artifactsResponse.ok) {
        throw new Error("Impossible de charger artifacts.json");
    }

    const weapons = await weaponsResponse.json();
    const artifactsData = await artifactsResponse.json();

    /*
     * =====================================================
     * DÉTECTION DE L'ITEM
     * =====================================================
     */

    const weapon =
        Array.isArray(weapons)
            ? weapons.find(
                item =>
                    String(item.id) === String(itemId)
            )
            : null;

    const artifacts =
        Array.isArray(artifactsData)
            ? artifactsData
            : artifactsData.artifacts;

    const artifact =
        Array.isArray(artifacts)
            ? artifacts.find(
                item =>
                    String(item.id) === String(itemId)
            )
            : null;

    /*
     * =====================================================
     * ARME
     * =====================================================
     */

    if (weapon) {

        displayWeapon(weapon);

        setupWeaponNavigation(
            weapon,
            weapons
        );

        setupBackLink(weapon);

        return;
    }

    /*
     * =====================================================
     * ARTEFACT
     * =====================================================
     */

    if (artifact) {

        displayArtifact(
            artifact,
            artifactsData.rarityQualityScaling
        );

        setupArtifactNavigation(
            artifact,
            artifacts
        );

        setupArtifactBackLink();

        return;
    }

    showError();

} catch (error) {

    console.error(
        "Erreur lors du chargement de l'item :",
        error
    );

    showError();
}


});

/* =============================================================
ARTEFACT
============================================================= */

function displayArtifact(
artifact,
rarityConfig
) {


document.title =
    `${artifact.name ?? "Artefact"} - Anopoly Wiki`;

setText(
    "item-name",
    artifact.name ?? "Artefact inconnu"
);

setText(
    "item-category",
    "Artefact"
);

setText(
    "item-anomaly",
    formatAnomaly(artifact.anomalyType)
);

setText(
    "item-id",
    artifact.id ?? "-"
);

setText(
    "item-anomaly-info",
    formatAnomaly(artifact.anomalyType)
);

setText(
    "item-rarity",
    formatRarity(artifact.rarity)
);

setText(
    "item-weight",
    formatNumber(artifact.weight) + " kg"
);

if (artifact.gridSize) {

    setText(
        "item-size",
        `${artifact.gridSize.x} × ${artifact.gridSize.y}`
    );

} else {

    setText(
        "item-size",
        "-"
    );

}

setText(
    "item-description",
    artifact.description ?? ""
);


/*
 * =========================================================
 * QUALITÉ
 * =========================================================
 */

const select =
    document.getElementById("quality-select");

const percent =
    document.getElementById("quality-percent");


const qualityTable =
    rarityConfig?.table ?? [];


/*
 * Création dynamique des qualités depuis
 * ArtifactRarityConfigSO / artifacts.json.
 */

if (qualityTable.length > 0) {

    select.innerHTML = "";

    for (const rarity of qualityTable) {

        const option =
            document.createElement("option");

        option.value =
            rarity.qualityPercent;

        option.dataset.rarity =
            rarity.rarity;

        option.textContent =
            `${formatRarity(rarity.rarity)} — ${rarity.qualityPercent}%`;

        /*
         * La valeur sélectionnée par défaut est
         * la rareté propre de l'artefact.
         */

        if (
            rarity.rarity ===
            artifact.rarity
        ) {
            option.selected = true;
        }

        select.appendChild(option);
    }

}


function updateQuality() {

    const quality =
        Number(select.value);

    percent.textContent =
        `${quality}%`;

    displayArtifactStats(
        artifact,
        quality
    );

    displayArtifactAnomalies(
        artifact,
        quality
    );
}


select.addEventListener(
    "change",
    updateQuality
);


updateQuality();


/*
 * =========================================================
 * IMAGE
 * =========================================================
 */

setupArtifactImage(artifact);


}

/* =============================================================
STATISTIQUES ARTEFACT
============================================================= */

function displayArtifactStats(
artifact,
qualityPercent
) {


const container =
    document.getElementById(
        "artifact-stats"
    );

container.innerHTML = "";

const modifiers =
    artifact.statModifiers ?? [];

if (modifiers.length === 0) {

    container.innerHTML = `
        <div class="placeholder">
            Aucun bonus de statistique
        </div>
    `;

    return;
}


const multiplier =
    qualityPercent / 100;


for (const modifier of modifiers) {

    const baseValue =
        Number(modifier.value);

    const finalValue =
        baseValue * multiplier;


    const row =
        document.createElement("div");

    row.className =
        "stat-row";


    const label =
        document.createElement("span");

    label.className =
        "stat-label";

    label.textContent =
        formatStatType(
            modifier.statType
        );


    const value =
        document.createElement("span");

    value.className =
        "stat-value";


    value.textContent =
        formatModifierValue(
            finalValue,
            modifier.isPercentage
        );


    row.appendChild(label);
    row.appendChild(value);

    container.appendChild(row);
}


}

/* =============================================================
ANOMALIES
============================================================= */

function displayArtifactAnomalies(
artifact,
qualityPercent
) {


const container =
    document.getElementById(
        "artifact-anomalies"
    );

container.innerHTML = "";

const modifiers =
    artifact.anomalyModifiers ?? [];


if (modifiers.length === 0) {

    container.innerHTML = `
        <div class="placeholder">
            Aucune modification d'anomalie
        </div>
    `;

    return;
}


const multiplier =
    qualityPercent / 100;


for (const modifier of modifiers) {

    const finalValue =
        Number(modifier.value) *
        multiplier;


    const row =
        document.createElement("div");

    row.className =
        "damage-row";


    const label =
        document.createElement("span");

    label.className =
        "damage-label";

    label.textContent =
        formatAnomaly(
            modifier.type
        );


    const value =
        document.createElement("span");

    value.className =
        "damage-value";

    value.textContent =
        formatModifierValue(
            finalValue,
            false
        );


    row.appendChild(label);
    row.appendChild(value);

    container.appendChild(row);
}

}

/* =============================================================
NAVIGATION ARTEFACTS
============================================================= */

function setupArtifactNavigation(
currentArtifact,
artifacts
) {


const previousContainer =
    document.getElementById(
        "previous-container"
    );

const nextContainer =
    document.getElementById(
        "next-container"
    );


previousContainer.innerHTML = "";
nextContainer.innerHTML = "";


/*
 * IMPORTANT :
 *
 * Ici on ne mélange JAMAIS les armes,
 * armures, maps, etc.
 *
 * La liste est exclusivement celle
 * de artifacts.json.
 */

const currentIndex =
    artifacts.findIndex(
        artifact =>
            String(artifact.id) ===
            String(currentArtifact.id)
    );


if (currentIndex === -1) {
    return;
}


if (currentIndex > 0) {

    previousContainer.innerHTML =
        createArtifactNavigationCard(
            artifacts[currentIndex - 1],
            "previous"
        );
}


if (
    currentIndex <
    artifacts.length - 1
) {

    nextContainer.innerHTML =
        createArtifactNavigationCard(
            artifacts[currentIndex + 1],
            "next"
        );
}


}

/* =============================================================
CARTE NAVIGATION ARTEFACT
============================================================= */

function createArtifactNavigationCard(
artifact,
direction
) {

const isPrevious =
    direction === "previous";

const arrow =
    isPrevious ? "←" : "→";

const label =
    isPrevious
        ? "PRÉCÉDENT"
        : "SUIVANT";


const imagePath =
    `images/artifacts/${artifact.id}.webp`;


return `
    <a
        class="item-nav-card ${direction}"
        href="item.html?id=${encodeURIComponent(artifact.id)}">

        <div class="item-nav-direction">

            ${
                isPrevious
                    ? `${arrow} ${label}`
                    : `${label} ${arrow}`
            }

        </div>


        <div class="item-nav-content">

            <div class="item-nav-image">

                <img
                    src="${imagePath}"
                    alt="${escapeHtml(artifact.name ?? "")}"
                    onerror="this.style.display='none';">

            </div>


            <div class="item-nav-info">

                <span class="item-nav-category">
                    ARTEFACT
                </span>

                <strong>
                    ${escapeHtml(
                        artifact.name ??
                        "Artefact inconnu"
                    )}
                </strong>

            </div>

        </div>

    </a>
`;


}

/* =============================================================
LIEN RETOUR ARTEFACT
============================================================= */

function setupArtifactBackLink() {


const backLink =
    document.getElementById(
        "back-link"
    );

if (!backLink) {
    return;
}

backLink.href =
    "category.html?type=artifacts";

backLink.textContent =
    "← Retour aux artefacts";


}

/* =============================================================
IMAGE ARTEFACT
============================================================= */

function setupArtifactImage(
artifact
) {


const image =
    document.getElementById(
        "item-image"
    );

const placeholder =
    document.getElementById(
        "item-image-placeholder"
    );


const imagePath =
    `images/artifacts/${artifact.id}.webp`;


image.src =
    imagePath;

image.alt =
    artifact.name ?? "";


image.style.display =
    "block";


if (placeholder) {
    placeholder.style.display =
        "none";
}


image.onerror = () => {

    image.style.display =
        "none";

    if (placeholder) {

        placeholder.style.display =
            "flex";
    }

};


}

/* =============================================================
ARMES
============================================================= */

function displayWeapon(weapon) {

document.title =
    `${weapon.name ?? "Arme"} - Anopoly Wiki`;

setText(
    "item-name",
    weapon.name ?? "Arme inconnue"
);

setText(
    "item-category",
    formatCategory(weapon.category)
);

setText(
    "item-anomaly",
    weapon.caliber ??
    weapon.Caliber ??
    ""
);

/*
 * Cette page est désormais polyvalente.
 * Les anciens IDs d'armes sont utilisés
 * uniquement s'ils existent dans le HTML.
 */

setText(
    "weapon-name",
    weapon.name
);

setText(
    "weapon-category",
    formatCategory(weapon.category)
);

setText(
    "weapon-id",
    weapon.id
);

setText(
    "weapon-caliber-info",
    weapon.caliber ??
    weapon.Caliber ??
    "-"
);

setText(
    "weapon-category-info",
    formatCategory(weapon.category)
);

setupWeaponImage(weapon);


}

function setupWeaponNavigation(
currentWeapon,
weapons
) {


const category =
    currentWeapon.category;

const sameCategory =
    weapons.filter(
        weapon =>
            weapon.category === category
    );

const index =
    sameCategory.findIndex(
        weapon =>
            String(weapon.id) ===
            String(currentWeapon.id)
    );

if (index === -1) {
    return;
}

const previous =
    document.getElementById(
        "previous-container"
    );

const next =
    document.getElementById(
        "next-container"
    );

if (index > 0) {

    previous.innerHTML =
        createWeaponNavigationCard(
            sameCategory[index - 1],
            "previous"
        );
}

if (
    index <
    sameCategory.length - 1
) {

    next.innerHTML =
        createWeaponNavigationCard(
            sameCategory[index + 1],
            "next"
        );
}


}

function createWeaponNavigationCard(
weapon,
direction
) {

const previous =
    direction === "previous";

return `
    <a
        class="item-nav-card ${direction}"
        href="item.html?id=${encodeURIComponent(weapon.id)}">

        <div class="item-nav-direction">

            ${
                previous
                    ? "← PRÉCÉDENT"
                    : "SUIVANT →"
            }

        </div>

        <div class="item-nav-content">

            <div class="item-nav-image">

                <img
                    src="images/weapons/${weapon.id}.webp"
                    alt="${escapeHtml(weapon.name ?? "")}">

            </div>

            <div class="item-nav-info">

                <span class="item-nav-category">
                    ${escapeHtml(
                        formatCategory(
                            weapon.category
                        )
                    )}
                </span>

                <strong>
                    ${escapeHtml(
                        weapon.name ??
                        "Arme inconnue"
                    )}
                </strong>

            </div>

        </div>

    </a>
`;

}

function setupWeaponBackLink(weapon) {

const link =
    document.getElementById(
        "back-link"
    );

if (!link) {
    return;
}

link.href =
    `category.html?type=${encodeURIComponent(
        weapon.category
    )}`;

link.textContent =
    `← Retour aux ${formatCategory(
        weapon.category
    )}`;

}

function setupWeaponImage(weapon) {

const image =
    document.getElementById(
        "item-image"
    );

const placeholder =
    document.getElementById(
        "item-image-placeholder"
    );

if (!image) {
    return;
}

image.src =
    `images/weapons/${weapon.id}.webp`;

image.alt =
    weapon.name ?? "";

image.style.display =
    "block";

if (placeholder) {
    placeholder.style.display =
        "none";
}

image.onerror = () => {

    image.style.display =
        "none";

    if (placeholder) {
        placeholder.style.display =
            "flex";
    }

};
```

}

/* =============================================================
OUTILS
============================================================= */

function setText(
id,
value
) {


const element =
    document.getElementById(id);

if (element) {
    element.textContent =
        value ?? "-";
}


}

function formatNumber(
value
) {

const number =
    Number(value);

if (Number.isNaN(number)) {
    return value ?? "-";
}

return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2)
        .replace(/\.?0+$/, "");

}

function formatModifierValue(
value,
isPercentage
) {

const formatted =
    formatNumber(value);

return isPercentage
    ? `${formatted}%`
    : `+${formatted}`;

}

function formatStatType(
value
) {

const names = {

    Health:
        "Santé",

    MoveSpeed:
        "Vitesse de déplacement",

    CarryWeight:
        "Capacité de charge",

    StaminaRegen:
        "Régénération d'endurance",

    Stamina:
        "Endurance",

    DamageReduction:
        "Réduction des dégâts",

    HealingEfficiency:
        "Efficacité des soins"

};

return names[value] ??
    formatCategory(value);

}

function formatAnomaly(
value
) {

const names = {

    Gravitational:
        "Gravitationnelle",

    Electro:
        "Électrique",

    Chemical:
        "Chimique",

    Thermal:
        "Thermique",

    Psi:
        "Psi"

};

return names[value] ??
    formatCategory(value);

}

function formatRarity(
value
) {

const names = {

    Common:
        "Commune",

    Uncommon:
        "Peu commune",

    Rare:
        "Rare",

    Epic:
        "Épique",

    Legendary:
        "Légendaire",

    Quest:
        "Quête"

};

return names[value] ??
    value ??
    "Inconnue";

}

function formatCategory(
category
) {

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

function escapeHtml(
value
) {

return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

function showError() {


const page =
    document.querySelector(
        ".item-page"
    );

if (!page) {
    return;
}

page.innerHTML = `

    <div class="error-message">

        <h1>
            Item introuvable
        </h1>

        <p>
            L'item demandé n'existe pas ou
            n'a pas pu être chargé.
        </p>

        <a
            href="index.html"
            class="back-button">

            ← Retour à la database

        </a>

    </div>

`;

}
