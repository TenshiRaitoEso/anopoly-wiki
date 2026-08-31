document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);

    const requestedType = params.get("type");
    const itemId = params.get("id");

    if (!itemId) {
        showError();
        return;
    }

    try {

        const type = normalizeItemType(requestedType);

        /*
         * =====================================================
         * CONFIGURATION DES DATABASES
         * =====================================================
         */

        const databaseConfig = {

            weapon: {
                file: "data/weapons.json",
                imageFolder: "weapons",
                label: "Arme"
            },

            armor: {
                file: "data/armors.json",
                imageFolder: "armors",
                label: "Armure"
            },

            map: {
                file: "data/maps.json",
                imageFolder: "maps",
                label: "Map"
            },

            enemy: {
                file: "data/enemies.json",
                imageFolder: "enemies",
                label: "Ennemi"
            },

            artifact: {
                file: "data/artifacts.json",
                imageFolder: "artifacts",
                label: "Artefact"
            }

        };


        /*
         * =====================================================
         * TYPE INCONNU
         * =====================================================
         */

        if (!type || !databaseConfig[type]) {

            /*
             * Compatibilité avec les anciennes URLs :
             *
             * item.html?id=123
             *
             * Dans ce cas on essaie toutes les bases.
             */

            const result = await findItemWithoutType(itemId);

            if (!result) {
                showError();
                return;
            }

            renderItem(
                result.item,
                result.type,
                result.data,
                result.items
            );

            return;
        }


        /*
         * =====================================================
         * CHARGEMENT DU JSON
         * =====================================================
         */

        const config = databaseConfig[type];

        const response = await fetch(config.file);

        if (!response.ok) {

            throw new Error(
                `Impossible de charger ${config.file}`
            );

        }

        const data = await response.json();

        const items = extractItems(data);

        if (!Array.isArray(items)) {

            throw new Error(
                `${config.file} ne contient pas une liste valide`
            );

        }


        /*
         * =====================================================
         * RECHERCHE DE L'ITEM
         * =====================================================
         */

        const item = items.find(
            element =>
                String(element.id) === String(itemId)
        );


        if (!item) {

            showError();

            return;
        }


        /*
         * =====================================================
         * AFFICHAGE
         * =====================================================
         */

        renderItem(
            item,
            type,
            data,
            items
        );


    } catch (error) {

        console.error(
            "Erreur lors du chargement de l'item :",
            error
        );

        showError();

    }

});


/* =============================================================
NORMALISATION DU TYPE
============================================================= */

function normalizeItemType(type) {

    if (!type) {
        return null;
    }

    const value =
        String(type)
            .toLowerCase()
            .trim();

    const aliases = {

        weapon: "weapon",
        weapons: "weapon",

        arme: "weapon",
        armes: "weapon",

        armor: "armor",
        armors: "armor",

        armour: "armor",
        armours: "armor",

        armor-combat: "armor",
        armor-research: "armor",
        armor-intermediate: "armor",

        map: "map",
        maps: "map",

        enemy: "enemy",
        enemies: "enemy",

        ennemi: "enemy",
        ennemies: "enemy",

        artifact: "artifact",
        artifacts: "artifact",

        artefact: "artifact",
        artefacts: "artifact"

    };

    return aliases[value] ?? null;

}


/* =============================================================
RECHERCHE SANS TYPE
============================================================= */

async function findItemWithoutType(itemId) {

    const databases = [

        {
            type: "weapon",
            file: "data/weapons.json"
        },

        {
            type: "armor",
            file: "data/armors.json"
        },

        {
            type: "map",
            file: "data/maps.json"
        },

        {
            type: "enemy",
            file: "data/enemies.json"
        },

        {
            type: "artifact",
            file: "data/artifacts.json"
        }

    ];


    for (const database of databases) {

        try {

            const response =
                await fetch(database.file);

            if (!response.ok) {
                continue;
            }

            const data =
                await response.json();

            const items =
                extractItems(data);

            if (!Array.isArray(items)) {
                continue;
            }

            const item =
                items.find(
                    element =>
                        String(element.id) ===
                        String(itemId)
                );

            if (item) {

                return {
                    item,
                    type: database.type,
                    data,
                    items
                };

            }

        } catch (error) {

            console.warn(
                `Impossible de tester ${database.file}`,
                error
            );

        }

    }

    return null;

}


/* =============================================================
EXTRACTION DES ITEMS
============================================================= */

function extractItems(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    const possibleKeys = [

        "items",
        "weapons",
        "armors",
        "armor",
        "maps",
        "enemies",
        "artifacts",
        "artefacts"

    ];

    for (const key of possibleKeys) {

        if (Array.isArray(data[key])) {
            return data[key];
        }

    }

    return [];

}


/* =============================================================
AFFICHAGE PRINCIPAL
============================================================= */

function renderItem(
    item,
    type,
    data,
    items
) {

    resetPage();

    switch (type) {

        case "weapon":
            displayWeapon(item);
            break;

        case "armor":
            displayArmor(item);
            break;

        case "map":
            displayMap(item);
            break;

        case "enemy":
            displayEnemy(item);
            break;

        case "artifact":
            displayArtifact(
                item,
                data?.rarityQualityScaling
            );
            break;

        default:
            displayGenericItem(item, type);
            break;

    }


    /*
     * Navigation
     */

    setupNavigation(
        item,
        type,
        items
    );


    /*
     * Lien retour
     */

    setupBackLink(
        item,
        type
    );


    /*
     * Image

     * Les fonctions spécifiques ont déjà
     * configuré l'image.
     */

}


/* =============================================================
RESET PAGE
============================================================= */

function resetPage() {

    const sections = [

        "quality-section",
        "stats-section",
        "damage-section",
        "artifact-anomaly-section",
        "description-section"

    ];

    for (const id of sections) {

        const element =
            document.getElementById(id);

        if (element) {

            element.hidden = true;

        }

    }


    const stats =
        document.getElementById("stats-list");

    if (stats) {
        stats.innerHTML = "";
    }


    const damage =
        document.getElementById("damage-list");

    if (damage) {
        damage.innerHTML = "";
    }


    const anomalies =
        document.getElementById(
            "artifact-anomalies"
        );

    if (anomalies) {
        anomalies.innerHTML = "";
    }


    const info =
        document.getElementById("info-list");

    if (info) {
        info.innerHTML = "";
    }


    const description =
        document.getElementById(
            "item-description"
        );

    if (description) {
        description.textContent = "";
    }


    const previous =
        document.getElementById(
            "previous-container"
        );

    const next =
        document.getElementById(
            "next-container"
        );

    if (previous) {
        previous.innerHTML = "";
    }

    if (next) {
        next.innerHTML = "";
    }

}


/* =============================================================
ARME
============================================================= */

function displayWeapon(weapon) {

    document.title =
        `${weapon.name ?? "Arme"} - Anopoly Wiki`;


    setText(
        "item-category",
        formatCategory(
            weapon.category
        )
    );


    setText(
        "item-name",
        weapon.name ?? "Arme inconnue"
    );


    setText(
        "item-subtitle",
        getRawValue(
            weapon,
            [
                "caliber",
                "Caliber"
            ]
        ) ?? ""
    );


    setupItemImage(
        weapon,
        "weapons"
    );


    /*
     * Statistiques
     */

    const stats = [];

    addStat(
        stats,
        "Dégâts",
        getRawValue(
            weapon,
            [
                "damage",
                "Damage"
            ]
        ),
        "par tir"
    );

    addStat(
        stats,
        "Cadence",
        getRawValue(
            weapon,
            [
                "fireRate",
                "FireRate",
                "rpm",
                "RPM"
            ]
        ),
        "RPM"
    );

    addStat(
        stats,
        "Chargeur",
        getRawValue(
            weapon,
            [
                "magazine",
                "Magazine",
                "magazineSize",
                "MagazineSize"
            ]
        ),
        "coups"
    );

    addStat(
        stats,
        "Rechargement",
        getRawValue(
            weapon,
            [
                "reloadTime",
                "ReloadTime"
            ]
        ),
        "secondes"
    );

    addStat(
        stats,
        "Portée",
        getRawValue(
            weapon,
            [
                "range",
                "Range"
            ]
        ),
        "mètres"
    );

    addStat(
        stats,
        "Dispersion",
        getRawValue(
            weapon,
            [
                "spread",
                "Spread"
            ]
        ),
        "°"
    );

    addStat(
        stats,
        "Ergonomie",
        getRawValue(
            weapon,
            [
                "ergonomics",
                "Ergonomics"
            ]
        ),
        ""
    );

    addStat(
        stats,
        "Poids",
        getRawValue(
            weapon,
            [
                "weight",
                "Weight"
            ]
        ),
        "kg"
    );


    renderStats(stats);


    /*
     * Zones d'impact
     */

    const damages = [];

    addDamage(
        damages,
        "Corps",
        getRawValue(
            weapon,
            [
                "bodyMultiplier",
                "BodyMultiplier",
                "bodyDamageMultiplier"
            ]
        )
    );

    addDamage(
        damages,
        "Tête",
        getRawValue(
            weapon,
            [
                "headMultiplier",
                "HeadMultiplier",
                "headDamageMultiplier"
            ]
        )
    );

    addDamage(
        damages,
        "Bras",
        getRawValue(
            weapon,
            [
                "armMultiplier",
                "ArmMultiplier",
                "limbMultiplier",
                "LimbMultiplier"
            ]
        )
    );

    addDamage(
        damages,
        "Jambes",
        getRawValue(
            weapon,
            [
                "legMultiplier",
                "LegMultiplier"
            ]
        )
    );


    if (damages.length > 0) {

        renderDamageList(
            damages,
            "Zones d'impact"
        );

    }


    /*
     * Informations
     */

    const info = [

        [
            "Identifiant",
            weapon.id
        ],

        [
            "Catégorie",
            formatCategory(
                weapon.category
            )
        ],

        [
            "Calibre",
            getRawValue(
                weapon,
                [
                    "caliber",
                    "Caliber"
                ]
            )
        ]

    ];


    renderInfo(info);

}


/* =============================================================
ARMURE
============================================================= */

function displayArmor(armor) {

    document.title =
        `${armor.name ?? "Armure"} - Anopoly Wiki`;


    setText(
        "item-category",
        formatCategory(
            armor.category
        )
    );


    setText(
        "item-name",
        armor.name ?? "Armure inconnue"
    );


    setText(
        "item-subtitle",
        getRawValue(
            armor,
            [
                "description",
                "Description"
            ]
        ) ?? ""
    );


    setupItemImage(
        armor,
        "armors"
    );


    const stats = [];


    /*
     * Stats stockées dans un dictionnaire.
     */

    const armorStats =
        getRawValue(
            armor,
            [
                "stats",
                "Stats"
            ]
        );


    if (
        armorStats &&
        typeof armorStats === "object" &&
        !Array.isArray(armorStats)
    ) {

        for (const [
            key,
            value
        ] of Object.entries(armorStats)) {

            addStat(
                stats,
                formatStatType(key),
                value,
                ""
            );

        }

    }


    /*
     * Stats directes
     */

    addStatIfMissing(
        stats,
        "Poids",
        getRawValue(
            armor,
            [
                "weight",
                "Weight"
            ]
        ),
        "kg"
    );


    addStatIfMissing(
        stats,
        "Protection balistique",
        getRawValue(
            armor,
            [
                "bulletResistance",
                "BulletResistance",
                "armor",
                "Armor"
            ]
        ),
        ""
    );


    renderStats(stats);


    /*
     * Informations
     */

    renderInfo([

        [
            "Identifiant",
            armor.id
        ],

        [
            "Catégorie",
            formatCategory(
                armor.category
            )
        ]

    ]);


    renderDescription(
        getRawValue(
            armor,
            [
                "description",
                "Description"
            ]
        )
    );

}


/* =============================================================
MAP
============================================================= */

function displayMap(map) {

    document.title =
        `${map.name ?? "Map"} - Anopoly Wiki`;


    setText(
        "item-category",
        "Map"
    );


    setText(
        "item-name",
        map.name ?? "Map inconnue"
    );


    setText(
        "item-subtitle",
        getRawValue(
            map,
            [
                "subtitle",
                "region",
                "zone",
                "description"
            ]
        ) ?? ""
    );


    setupItemImage(
        map,
        "maps"
    );


    const stats = [];


    addStat(
        stats,
        "Niveau",
        getRawValue(
            map,
            [
                "level",
                "Level",
                "recommendedLevel",
                "RecommendedLevel"
            ]
        ),
        ""
    );


    addStat(
        stats,
        "Difficulté",
        getRawValue(
            map,
            [
                "difficulty",
                "Difficulty"
            ]
        ),
        ""
    );


    addStat(
        stats,
        "Taille",
        getRawValue(
            map,
            [
                "size",
                "Size"
            ]
        ),
        ""
    );


    renderStats(stats);


    renderInfo([

        [
            "Identifiant",
            map.id
        ],

        [
            "Type",
            formatCategory(
                map.category
            )
        ]

    ]);


    renderDescription(
        getRawValue(
            map,
            [
                "description",
                "Description"
            ]
        )
    );

}


/* =============================================================
ENNEMI
============================================================= */

function displayEnemy(enemy) {

    document.title =
        `${enemy.name ?? "Ennemi"} - Anopoly Wiki`;


    setText(
        "item-category",
        formatCategory(
            enemy.category
        )
    );


    setText(
        "item-name",
        enemy.name ?? "Ennemi inconnu"
    );


    setText(
        "item-subtitle",
        getRawValue(
            enemy,
            [
                "type",
                "Type",
                "description",
                "Description"
            ]
        ) ?? ""
    );


    setupItemImage(
        enemy,
        "enemies"
    );


    const stats = [];


    addStat(
        stats,
        "Santé",
        getRawValue(
            enemy,
            [
                "health",
                "Health",
                "hp",
                "HP"
            ]
        ),
        "HP"
    );


    addStat(
        stats,
        "Armure",
        getRawValue(
            enemy,
            [
                "armor",
                "Armor",
                "bulletResistance",
                "BulletResistance"
            ]
        ),
        ""
    );


    addStat(
        stats,
        "Dégâts",
        getRawValue(
            enemy,
            [
                "damage",
                "Damage"
            ]
        ),
        ""
    );


    addStat(
        stats,
        "Vitesse",
        getRawValue(
            enemy,
            [
                "speed",
                "Speed",
                "movementSpeed",
                "MovementSpeed"
            ]
        ),
        ""
    );


    renderStats(stats);


    renderInfo([

        [
            "Identifiant",
            enemy.id
        ],

        [
            "Catégorie",
            formatCategory(
                enemy.category
            )
        ]

    ]);


    renderDescription(
        getRawValue(
            enemy,
            [
                "description",
                "Description"
            ]
        )
    );

}


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
        "item-category",
        "Artefact"
    );


    setText(
        "item-name",
        artifact.name ?? "Artefact inconnu"
    );


    setText(
        "item-subtitle",
        formatAnomaly(
            artifact.anomalyType
        )
    );


    setupItemImage(
        artifact,
        "artifacts"
    );


    /*
     * =========================================================
     * QUALITÉ
     * =========================================================
     */

    const qualitySection =
        document.getElementById(
            "quality-section"
        );

    const select =
        document.getElementById(
            "quality-select"
        );

    const percent =
        document.getElementById(
            "quality-percent"
        );


    const qualityTable =
        rarityConfig?.table ?? [];


    if (
        qualitySection &&
        select &&
        qualityTable.length > 0
    ) {

        qualitySection.hidden = false;

        select.innerHTML = "";


        for (
            const rarity
            of qualityTable
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                rarity.qualityPercent;


            option.dataset.rarity =
                rarity.rarity;


            option.textContent =
                `${formatRarity(rarity.rarity)} — ${rarity.qualityPercent}%`;


            if (
                rarity.rarity ===
                artifact.rarity
            ) {

                option.selected = true;

            }


            select.appendChild(
                option
            );

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

    } else {

        displayArtifactStats(
            artifact,
            100
        );


        displayArtifactAnomalies(
            artifact,
            100
        );

    }


    /*
     * Informations
     */

    renderInfo([

        [
            "Identifiant",
            artifact.id
        ],

        [
            "Rareté",
            formatRarity(
                artifact.rarity
            )
        ],

        [
            "Anomalie",
            formatAnomaly(
                artifact.anomalyType
            )
        ],

        [
            "Poids",
            formatNumber(
                artifact.weight
            ) + " kg"
        ],

        [
            "Taille",
            formatGridSize(
                artifact.gridSize
            )
        ]

    ]);


    renderDescription(
        artifact.description
    );

}


/* =============================================================
STATS ARTEFACT
============================================================= */

function displayArtifactStats(
    artifact,
    qualityPercent
) {

    const modifiers =
        artifact.statModifiers ?? [];


    const stats = [];


    const multiplier =
        Number(qualityPercent) / 100;


    for (
        const modifier
        of modifiers
    ) {

        const baseValue =
            Number(modifier.value);


        const finalValue =
            baseValue * multiplier;


        stats.push({

            label:
                formatStatType(
                    modifier.statType
                ),

            value:
                formatModifierValue(
                    finalValue,
                    modifier.isPercentage
                ),

            unit: ""

        });

    }


    renderStats(
        stats,
        "Statistiques"
    );

}


/* =============================================================
ANOMALIES ARTEFACT
============================================================= */

function displayArtifactAnomalies(
    artifact,
    qualityPercent
) {

    const modifiers =
        artifact.anomalyModifiers ?? [];


    const damages = [];


    const multiplier =
        Number(qualityPercent) / 100;


    for (
        const modifier
        of modifiers
    ) {

        const finalValue =
            Number(modifier.value) *
            multiplier;


        damages.push({

            label:
                formatAnomaly(
                    modifier.type
                ),

            value:
                formatModifierValue(
                    finalValue,
                    false
                )

        });

    }


    if (damages.length === 0) {

        const section =
            document.getElementById(
                "artifact-anomaly-section"
            );

        if (section) {
            section.hidden = true;
        }

        return;

    }


    renderDamageList(
        damages,
        "Anomalies"
    );

}


/* =============================================================
ITEM GÉNÉRIQUE
============================================================= */

function displayGenericItem(
    item,
    type
) {

    document.title =
        `${item.name ?? "Item"} - Anopoly Wiki`;


    setText(
        "item-category",
        formatCategory(type)
    );


    setText(
        "item-name",
        item.name ?? "Item inconnu"
    );


    setText(
        "item-subtitle",
        ""
    );


    setupItemImage(
        item,
        getImageFolder(type)
    );


    const stats = [];


    for (
        const [
            key,
            value
        ] of Object.entries(item)
    ) {

        if (
            [
                "id",
                "name",
                "description",
                "category"
            ].includes(key)
        ) {
            continue;
        }


        if (
            value === null ||
            value === undefined ||
            typeof value === "object"
        ) {
            continue;
        }


        stats.push({

            label:
                formatStatType(key),

            value:
                formatNumber(value),

            unit: ""

        });

    }


    renderStats(stats);


    renderInfo([

        [
            "Identifiant",
            item.id
        ],

        [
            "Catégorie",
            formatCategory(
                item.category
            )
        ]

    ]);


    renderDescription(
        item.description
    );

}


/* =============================================================
NAVIGATION
============================================================= */

function setupNavigation(
    currentItem,
    type,
    items
) {

    const previousContainer =
        document.getElementById(
            "previous-container"
        );

    const nextContainer =
        document.getElementById(
            "next-container"
        );


    if (!previousContainer ||
        !nextContainer) {

        return;

    }


    previousContainer.innerHTML = "";
    nextContainer.innerHTML = "";


    if (!Array.isArray(items) ||
        items.length === 0) {

        return;

    }


    /*
     * Pour les armes / armures / etc.,
     * on reste dans la même catégorie.
     *
     * Pour les maps / ennemis / artefacts
     * qui n'ont pas forcément de catégorie,
     * on utilise toute la database.
     */

    let navigationItems =
        items;


    const category =
        currentItem.category;


    if (category) {

        const sameCategory =
            items.filter(
                item =>
                    item.category ===
                    category
            );


        if (
            sameCategory.length > 1
        ) {

            navigationItems =
                sameCategory;

        }

    }


    const currentIndex =
        navigationItems.findIndex(
            item =>
                String(item.id) ===
                String(currentItem.id)
        );


    if (currentIndex === -1) {

        return;

    }


    if (currentIndex > 0) {

        previousContainer.innerHTML =
            createNavigationCard(
                navigationItems[
                    currentIndex - 1
                ],
                "previous",
                type
            );

    }


    if (
        currentIndex <
        navigationItems.length - 1
    ) {

        nextContainer.innerHTML =
            createNavigationCard(
                navigationItems[
                    currentIndex + 1
                ],
                "next",
                type
            );

    }

}


/* =============================================================
CARTE NAVIGATION
============================================================= */

function createNavigationCard(
    item,
    direction,
    type
) {

    const previous =
        direction === "previous";


    const imageFolder =
        getImageFolder(type);


    const imagePath =
        `images/${imageFolder}/${item.id}.webp`;


    return `

        <a
            class="item-nav-card ${direction}"
            href="item.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(item.id)}">

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
                        src="${imagePath}"
                        alt="${escapeHtml(
                            item.name ?? ""
                        )}"
                        onerror="this.style.display='none';">

                </div>


                <div class="item-nav-info">

                    <span
                        class="item-nav-category">

                        ${escapeHtml(
                            getTypeLabel(type)
                        )}

                    </span>


                    <strong>

                        ${escapeHtml(
                            item.name ??
                            "Item inconnu"
                        )}

                    </strong>

                </div>

            </div>

        </a>

    `;

}


/* =============================================================
LIEN RETOUR
============================================================= */

function setupBackLink(
    item,
    type
) {

    const link =
        document.getElementById(
            "back-link"
        );


    if (!link) {
        return;
    }


    const category =
        item.category;


    if (
        category &&
        type !== "enemy" &&
        type !== "map" &&
        type !== "artifact"
    ) {

        link.href =
            `category.html?type=${encodeURIComponent(
                category
            )}`;


        link.textContent =
            `← Retour aux ${formatCategory(
                category
            )}`;


        return;

    }


    switch (type) {

        case "artifact":

            link.href =
                "category.html?type=artifacts";

            link.textContent =
                "← Retour aux artefacts";

            break;


        case "enemy":

            link.href =
                "category.html?type=enemies";

            link.textContent =
                "← Retour aux ennemis";

            break;


        case "map":

            link.href =
                category
                    ? `category.html?type=${encodeURIComponent(
                        category
                    )}`
                    : "index.html";

            link.textContent =
                category
                    ? `← Retour à ${formatCategory(
                        category
                    )}`
                    : "← Retour aux maps";

            break;


        default:

            link.href =
                "index.html";

            link.textContent =
                "← Retour à la database";

            break;

    }

}


/* =============================================================
IMAGE
============================================================= */

function setupItemImage(
    item,
    folder
) {

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


    const imagePath =
        `images/${folder}/${item.id}.webp`;


    image.src =
        imagePath;


    image.alt =
        item.name ?? "";


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
STATS
============================================================= */

function renderStats(
    stats,
    sectionTitle = "Statistiques"
) {

    const section =
        document.getElementById(
            "stats-section"
        );


    const container =
        document.getElementById(
            "stats-list"
        );


    if (!section ||
        !container) {

        return;

    }


    container.innerHTML = "";


    const validStats =
        stats.filter(
            stat =>
                stat &&
                stat.value !== null &&
                stat.value !== undefined &&
                stat.value !== "-"
        );


    if (validStats.length === 0) {

        section.hidden = true;

        return;

    }


    section.hidden = false;


    const heading =
        section.querySelector(
            ".section-heading h2"
        );


    if (heading) {

        heading.textContent =
            sectionTitle;

    }


    for (
        const stat
        of validStats
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "stat-row";


        const label =
            document.createElement(
                "span"
            );


        label.className =
            "stat-label";


        label.textContent =
            stat.label;


        const value =
            document.createElement(
                "span"
            );


        value.className =
            "stat-value";


        const valueText =
            document.createElement(
                "span"
            );


        valueText.textContent =
            stat.value;


        value.appendChild(
            valueText
        );


        if (stat.unit) {

            const unit =
                document.createElement(
                    "span"
                );


            unit.className =
                "stat-unit";


            unit.textContent =
                stat.unit;


            value.appendChild(
                unit
            );

        }


        row.appendChild(
            label
        );


        row.appendChild(
            value
        );


        container.appendChild(
            row
        );

    }

}


/* =============================================================
DAMAGE / MODIFICATEURS
============================================================= */

function renderDamageList(
    damages,
    sectionTitle
) {

    const section =
        document.getElementById(
            sectionTitle === "Anomalies"
                ? "artifact-anomaly-section"
                : "damage-section"
        );


    const container =
        document.getElementById(
            sectionTitle === "Anomalies"
                ? "artifact-anomalies"
                : "damage-list"
        );


    if (!section ||
        !container) {

        return;

    }


    container.innerHTML = "";


    if (!damages ||
        damages.length === 0) {

        section.hidden = true;

        return;

    }


    section.hidden = false;


    const heading =
        section.querySelector(
            ".section-heading h2"
        );


    if (heading) {

        heading.textContent =
            sectionTitle;

    }


    for (
        const damage
        of damages
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "damage-row";


        const label =
            document.createElement(
                "span"
            );


        label.className =
            "damage-label";


        label.textContent =
            damage.label;


        const value =
            document.createElement(
                "span"
            );


        value.className =
            "damage-value";


        value.textContent =
            damage.value;


        row.appendChild(
            label
        );


        row.appendChild(
            value
        );


        container.appendChild(
            row
        );

    }

}


/* =============================================================
INFORMATIONS
============================================================= */

function renderInfo(
    info
) {

    const container =
        document.getElementById(
            "info-list"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    for (
        const entry
        of info
    ) {

        if (!entry) {
            continue;
        }


        const label =
            entry[0];


        const value =
            entry[1];


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            continue;
        }


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "info-row";


        const labelElement =
            document.createElement(
                "span"
            );


        labelElement.textContent =
            label;


        const valueElement =
            document.createElement(
                "span"
            );


        valueElement.textContent =
            value;


        row.appendChild(
            labelElement
        );


        row.appendChild(
            valueElement
        );


        container.appendChild(
            row
        );

    }

}


/* =============================================================
DESCRIPTION
============================================================= */

function renderDescription(
    description
) {

    const section =
        document.getElementById(
            "description-section"
        );


    const container =
        document.getElementById(
            "item-description"
        );


    if (!section ||
        !container) {

        return;

    }


    if (
        description === null ||
        description === undefined ||
        String(description).trim() === ""
    ) {

        section.hidden = true;

        return;

    }


    section.hidden = false;


    container.textContent =
        description;

}


/* =============================================================
AJOUT STAT
============================================================= */

function addStat(
    stats,
    label,
    value,
    unit
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return;
    }


    stats.push({

        label,
        value: formatNumber(value),
        unit: unit ?? ""

    });

}


/* =============================================================
AJOUT STAT SI ABSENTE
============================================================= */

function addStatIfMissing(
    stats,
    label,
    value,
    unit
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return;
    }


    const exists =
        stats.some(
            stat =>
                stat.label === label
        );


    if (!exists) {

        addStat(
            stats,
            label,
            value,
            unit
        );

    }

}


/* =============================================================
AJOUT DAMAGE
============================================================= */

function addDamage(
    damages,
    label,
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return;
    }


    damages.push({

        label,

        value:
            formatMultiplier(value)

    });

}


/* =============================================================
UTILITAIRE VALEUR
============================================================= */

function getRawValue(
    object,
    keys
) {

    for (
        const key
        of keys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }


    return null;

}


/* =============================================================
FORMAT NOMBRE
============================================================= */

function formatNumber(
    value
) {

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

        return String(value);

    }


    return Number.isInteger(number)

        ? String(number)

        : number
            .toFixed(2)
            .replace(/\.?0+$/, "");

}


/* =============================================================
FORMAT MODIFICATEUR
============================================================= */

function formatModifierValue(
    value,
    isPercentage
) {

    const formatted =
        formatNumber(value);


    if (isPercentage) {

        return `${formatted}%`;

    }


    return Number(value) >= 0
        ? `+${formatted}`
        : formatted;

}


/* =============================================================
FORMAT MULTIPLICATEUR
============================================================= */

function formatMultiplier(
    value
) {

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


/* =============================================================
FORMAT TAILLE
============================================================= */

function formatGridSize(
    gridSize
) {

    if (!gridSize) {
        return "-";
    }


    if (
        gridSize.x !== undefined &&
        gridSize.y !== undefined
    ) {

        return `${gridSize.x} × ${gridSize.y}`;

    }


    return String(gridSize);

}


/* =============================================================
FORMAT STAT
============================================================= */

function formatStatType(
    value
) {

    const names = {

        Health:
            "Santé",

        MoveSpeed:
            "Vitesse de déplacement",

        MovementSpeed:
            "Vitesse de déplacement",

        RunningSpeed:
            "Vitesse de course",

        CarryWeight:
            "Capacité de charge",

        StaminaRegen:
            "Régénération d'endurance",

        Stamina:
            "Endurance",

        DamageReduction:
            "Réduction des dégâts",

        HealingEfficiency:
            "Efficacité des soins",

        "Heal Effectiveness":
            "Efficacité des soins",

        Vitality:
            "Vitalité",

        BulletResistance:
            "Résistance balistique",

        Radiation:
            "Radiation",

        "Psy-emission":
            "Émission psi",

        Bioinfection:
            "Bio-infection",

        Temperature:
            "Température",

        Frost:
            "Froid"

    };


    return names[value] ??
        formatCategory(value);

}


/* =============================================================
FORMAT ANOMALIE
============================================================= */

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


/* =============================================================
FORMAT RARETÉ
============================================================= */

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


/* =============================================================
FORMAT CATÉGORIE
============================================================= */

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


/* =============================================================
DOSSIER IMAGE
============================================================= */

function getImageFolder(
    type
) {

    switch (type) {

        case "weapon":
            return "weapons";

        case "armor":
            return "armors";

        case "map":
            return "maps";

        case "enemy":
            return "enemies";

        case "artifact":
            return "artifacts";

        default:
            return type;

    }

}


/* =============================================================
LABEL TYPE
============================================================= */

function getTypeLabel(
    type
) {

    switch (type) {

        case "weapon":
            return "ARME";

        case "armor":
            return "ARMURE";

        case "map":
            return "MAP";

        case "enemy":
            return "ENNEMI";

        case "artifact":
            return "ARTEFACT";

        default:
            return formatCategory(type);

    }

}


/* =============================================================
SET TEXT
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


/* =============================================================
ESCAPE HTML
============================================================= */

function escapeHtml(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =============================================================
ERREUR
============================================================= */

function showError() {

    const page =
        document.querySelector(
            ".item-page"
        );


    if (!page) {
        return;
    }


    const error =
        document.getElementById(
            "error-message"
        );


    if (error) {

        error.hidden = false;

    }


    const elementsToHide = [

        ".item-back",
        ".item-header",
        "#quality-section",
        "#stats-section",
        "#damage-section",
        "#artifact-anomaly-section",
        "#description-section",
        "#info-section",
        "#item-navigation"

    ];


    for (
        const selector
        of elementsToHide
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (element) {

            element.hidden = true;

        }

    }

}