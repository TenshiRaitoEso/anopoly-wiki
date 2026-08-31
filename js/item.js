document.addEventListener("DOMContentLoaded", () => {
initializeWeaponPage();
});

/* =========================================================
INITIALISATION
========================================================= */

async function initializeWeaponPage() {


const weaponId = getWeaponIdFromUrl();

if (!weaponId) {
    showError("Aucun identifiant d'arme n'a été fourni dans l'URL.");
    return;
}

try {

    const weapons = await loadWeapons();

    const weapon = findWeapon(weapons, weaponId);

    if (!weapon) {
        showError(
            `Aucune arme avec l'identifiant "${weaponId}" n'a été trouvée.`
        );
        return;
    }

    displayWeapon(weapon);

} catch (error) {

    console.error("ANOPOLY — erreur chargement arme :", error);

    showError(
        "Impossible de charger weapons.json. Vérifie le chemin du fichier et son format JSON."
    );

}


}

/* =========================================================
URL
========================================================= */

function getWeaponIdFromUrl() {


const params = new URLSearchParams(
    window.location.search
);

return params.get("id")?.trim() || null;


}

/* =========================================================
JSON
========================================================= */

async function loadWeapons() {


const response = await fetch(
    "data/weapons.json",
    {
        cache: "no-cache"
    }
);

if (!response.ok) {
    throw new Error(
        `HTTP ${response.status} — weapons.json introuvable`
    );
}

const data = await response.json();

/*
 * Le fichier doit normalement être :
 *
 * [
 *   {...},
 *   {...}
 * ]
 *
 * Mais on accepte aussi :
 *
 * {
 *   "weapons": [...]
 * }
 */

if (Array.isArray(data)) {
    return data;
}

if (Array.isArray(data.weapons)) {
    return data.weapons;
}

throw new Error(
    "Format weapons.json invalide."
);


}

/* =========================================================
RECHERCHE ARME
========================================================= */

function findWeapon(weapons, id) {


const normalizedId = normalize(id);

return weapons.find(weapon => {

    if (!weapon) {
        return false;
    }

    return normalize(
        weapon.id
    ) === normalizedId;

});


}

/* =========================================================
AFFICHAGE GLOBAL
========================================================= */

function displayWeapon(weapon) {


const name =
    getValue(
        weapon,
        ["name", "displayName", "Name", "DisplayName"],
        "Arme inconnue"
    );

const id =
    getValue(
        weapon,
        ["id", "Id"],
        "unknown"
    );

const category =
    getValue(
        weapon,
        ["category", "Category"],
        ""
    );

const caliber =
    getValue(
        weapon,
        ["caliber", "Caliber"],
        ""
    );

const description =
    getValue(
        weapon,
        ["description", "Description"],
        ""
    );


/* -----------------------------------------------------
   TITRE
----------------------------------------------------- */

setText(
    "weapon-name",
    name
);

setText(
    "weapon-category",
    formatCategory(category)
);

setText(
    "weapon-caliber",
    caliber || "Non renseigné"
);

setText(
    "weapon-id",
    id
);

setText(
    "breadcrumb-name",
    name.toUpperCase()
);

setText(
    "breadcrumb-category",
    formatCategory(category).toUpperCase()
);

setText(
    "weapon-description",
    description
);


/* -----------------------------------------------------
   INFORMATIONS
----------------------------------------------------- */

setText(
    "info-id",
    id
);

setText(
    "info-category",
    formatCategory(category)
);

setText(
    "info-caliber",
    caliber || "Non renseigné"
);

setText(
    "info-type",
    getValue(
        weapon,
        ["type", "Type", "weaponType", "WeaponType"],
        "Non renseigné"
    )
);


/* -----------------------------------------------------
   STATISTIQUES
----------------------------------------------------- */

const damage = getWeaponDamage(weapon);

setText(
    "stat-damage",
    formatNumber(damage)
);

setText(
    "stat-fire-rate",
    formatNumber(
        getValue(
            weapon,
            [
                "fireRate",
                "FireRate",
                "rpm",
                "RPM",
                "rateOfFire",
                "RateOfFire"
            ]
        )
    )
);

setText(
    "stat-magazine",
    formatNumber(
        getValue(
            weapon,
            [
                "magazine",
                "Magazine",
                "magazineSize",
                "MagazineSize",
                "capacity",
                "Capacity"
            ]
        )
    )
);

setText(
    "stat-reload",
    formatNumber(
        getValue(
            weapon,
            [
                "reloadTime",
                "ReloadTime",
                "reload",
                "Reload"
            ]
        ),
        2
    )
);

setText(
    "stat-range",
    formatNumber(
        getValue(
            weapon,
            [
                "range",
                "Range",
                "effectiveRange",
                "EffectiveRange"
            ]
        )
    )
);

setText(
    "stat-spread",
    formatNumber(
        getValue(
            weapon,
            [
                "spread",
                "Spread",
                "dispersion",
                "Dispersion"
            ]
        ),
        3
    )
);

setText(
    "stat-ergonomics",
    formatNumber(
        getValue(
            weapon,
            [
                "ergonomics",
                "Ergonomics",
                "ergonomy",
                "Ergonomy"
            ]
        )
    )
);

setText(
    "stat-weight",
    formatNumber(
        getValue(
            weapon,
            [
                "weight",
                "Weight"
            ]
        ),
        2
    )
);


/* -----------------------------------------------------
   MULTIPLICATEURS
----------------------------------------------------- */

displayMultipliers(weapon);


/* -----------------------------------------------------
   COURBE DE DÉGÂTS
----------------------------------------------------- */

displayDamageCurve(weapon);


/* -----------------------------------------------------
   IMAGE
----------------------------------------------------- */

displayWeaponImage(
    weapon,
    id,
    name
);


/* -----------------------------------------------------
   LIENS
----------------------------------------------------- */

setupNavigation(
    category
);


/* -----------------------------------------------------
   TITRE
----------------------------------------------------- */

document.title =
    `${name} — ANOPOLY`;


}

/* =========================================================
DÉGÂTS
========================================================= */

function getWeaponDamage(weapon) {


const directDamage = getValue(
    weapon,
    [
        "damage",
        "Damage",
        "baseDamage",
        "BaseDamage"
    ]
);

if (isNumber(directDamage)) {
    return directDamage;
}


/*
 * Si l'arme utilise une courbe :
 *
 * damageCurve: [
 *   { distance: 0, damage: 50 },
 *   { distance: 50, damage: 45 }
 * ]
 *
 * On affiche ici le premier dommage
 * comme valeur principale.
 */

const curve =
    getDamageCurve(weapon);

if (curve.length > 0) {

    const first = curve[0];

    return getValue(
        first,
        [
            "damage",
            "Damage",
            "value",
            "Value"
        ]
    );

}

return null;


}

/* =========================================================
MULTIPLICATEURS
========================================================= */

function displayMultipliers(weapon) {


const multipliers =
    weapon.multipliers ||
    weapon.Multipliers ||
    weapon.hitMultipliers ||
    weapon.HitMultipliers ||
    {};


const body =
    getValue(
        weapon,
        [
            "bodyMultiplier",
            "BodyMultiplier",
            "bodyDamageMultiplier",
            "BodyDamageMultiplier"
        ],
        getValue(
            multipliers,
            [
                "body",
                "Body"
            ]
        )
    );


const head =
    getValue(
        weapon,
        [
            "headMultiplier",
            "HeadMultiplier",
            "headDamageMultiplier",
            "HeadDamageMultiplier"
        ],
        getValue(
            multipliers,
            [
                "head",
                "Head"
            ]
        )
    );


const arm =
    getValue(
        weapon,
        [
            "armMultiplier",
            "ArmMultiplier",
            "limbMultiplier",
            "LimbMultiplier"
        ],
        getValue(
            multipliers,
            [
                "arm",
                "Arm",
                "limb",
                "Limb"
            ]
        )
    );


const leg =
    getValue(
        weapon,
        [
            "legMultiplier",
            "LegMultiplier",
            "legDamageMultiplier",
            "LegDamageMultiplier"
        ],
        getValue(
            multipliers,
            [
                "leg",
                "Leg"
            ]
        )
    );


setText(
    "mult-body",
    formatMultiplier(
        body,
        "1.00"
    )
);

setText(
    "mult-head",
    formatMultiplier(
        head
    )
);

setText(
    "mult-arm",
    formatMultiplier(
        arm
    )
);

setText(
    "mult-leg",
    formatMultiplier(
        leg
    )
);


}

/* =========================================================
COURBE DE DÉGÂTS
========================================================= */

function getDamageCurve(weapon) {


const curve =
    weapon.damageCurve ||
    weapon.DamageCurve ||
    weapon.damagePoints ||
    weapon.DamagePoints ||
    weapon.damage ||
    null;


if (!Array.isArray(curve)) {
    return [];
}


return curve
    .map(point => {

        if (typeof point === "number") {

            return {
                distance: null,
                damage: point
            };

        }

        if (!point) {
            return null;
        }

        return {
            distance: getValue(
                point,
                [
                    "distance",
                    "Distance",
                    "range",
                    "Range"
                ]
            ),

            damage: getValue(
                point,
                [
                    "damage",
                    "Damage",
                    "value",
                    "Value"
                ]
            )
        };

    })
    .filter(point =>
        point &&
        isNumber(point.damage)
    );


}

function displayDamageCurve(weapon) {


const container =
    document.getElementById(
        "damage-curve"
    );

if (!container) {
    return;
}


const curve =
    getDamageCurve(weapon);


if (curve.length === 0) {

    container.innerHTML = `
        <div class="curve-empty">
            Aucune donnée balistique disponible.
        </div>
    `;

    return;
}


container.innerHTML = "";


const maxDamage =
    Math.max(
        ...curve.map(
            point => Number(point.damage)
        )
    );


curve.forEach(point => {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "damage-curve-row";


    const distance =
        document.createElement(
            "div"
        );

    distance.className =
        "damage-curve-distance";

    distance.textContent =
        point.distance !== null
            ? `${formatNumber(point.distance)} m`
            : "—";


    const bar =
        document.createElement(
            "div"
        );

    bar.className =
        "damage-curve-bar";


    const fill =
        document.createElement(
            "div"
        );

    fill.className =
        "damage-curve-fill";


    const percentage =
        maxDamage > 0
            ? Math.max(
                4,
                (point.damage / maxDamage) * 100
            )
            : 0;


    fill.style.width =
        `${percentage}%`;


    const value =
        document.createElement(
            "div"
        );

    value.className =
        "damage-curve-value";

    value.textContent =
        formatNumber(point.damage);


    bar.appendChild(fill);

    row.appendChild(distance);

    row.appendChild(bar);

    row.appendChild(value);

    container.appendChild(row);

});


}

/* =========================================================
IMAGE
========================================================= */

function displayWeaponImage(
weapon,
id,
name
) {


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


const jsonImage =
    getValue(
        weapon,
        [
            "image",
            "Image",
            "imagePath",
            "ImagePath",
            "icon",
            "Icon",
            "iconPath",
            "IconPath"
        ]
    );


const possiblePaths = [];


if (jsonImage) {

    let path =
        String(jsonImage).trim();

    path =
        path.replace(/\\/g, "/");

    if (
        path.startsWith("/")
    ) {
        path =
            path.substring(1);
    }

    if (
        path.startsWith("./")
    ) {
        path =
            path.substring(2);
    }

    possiblePaths.push(
        path
    );
}


possiblePaths.push(
    `images/weapons/${id}.webp`
);

possiblePaths.push(
    `images/weapons/${id}.png`
);

possiblePaths.push(
    `images/weapons/${id}.jpg`
);


let currentPath = 0;


function tryNextImage() {

    if (
        currentPath >=
        possiblePaths.length
    ) {

        image.style.display =
            "none";

        if (placeholder) {
            placeholder.style.display =
                "flex";
        }

        return;
    }


    const path =
        possiblePaths[currentPath++];

    image.src =
        path;

    image.alt =
        name;

}


image.onload = () => {

    image.style.display =
        "block";

    if (placeholder) {
        placeholder.style.display =
            "none";
    }

};


image.onerror = () => {

    tryNextImage();

};


tryNextImage();


}

/* =========================================================
NAVIGATION
========================================================= */

function setupNavigation(category) {


const backButton =
    document.getElementById(
        "back-button"
    );

const breadcrumb =
    document.getElementById(
        "breadcrumb-category"
    );


if (!category) {
    return;
}


const categoryUrl =
    `category.html?type=${encodeURIComponent(category)}`;


if (backButton) {
    backButton.href =
        categoryUrl;
}


if (breadcrumb) {
    breadcrumb.href =
        categoryUrl;
}


}

/* =========================================================
CATEGORIES
========================================================= */

function formatCategory(category) {


if (!category) {
    return "Arme";
}


return String(category)
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
        word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
    )
    .join(" ");


}

/* =========================================================
VALEURS JSON
========================================================= */

function getValue(
object,
keys,
fallback = null
) {


if (
    object === null ||
    object === undefined
) {
    return fallback;
}


for (const key of keys) {

    if (
        object[key] !== undefined &&
        object[key] !== null
    ) {

        return object[key];

    }

}


return fallback;

}

/* =========================================================
DOM
========================================================= */

function setText(
id,
value
) {

const element =
    document.getElementById(id);

if (!element) {
    return;
}


if (
    value === null ||
    value === undefined ||
    value === ""
) {

    element.textContent =
        "—";

    return;
}


element.textContent =
    value;

}

/* =========================================================
FORMAT NOMBRE
========================================================= */

function formatNumber(
value,
decimals = 2
) {

if (
    value === null ||
    value === undefined ||
    value === ""
) {
    return "—";
}


const number =
    Number(value);


if (!Number.isFinite(number)) {
    return "—";
}


/*
 * Supprime les zéros inutiles.
 *
 * 40.00 → 40
 * 40.50 → 40.5
 */

return number
    .toFixed(decimals)
    .replace(
        /\.?0+$/,
        ""
    );

}

/* =========================================================
MULTIPLICATEUR
========================================================= */

function formatMultiplier(
value,
fallback = "—"
) {

if (
    value === null ||
    value === undefined ||
    value === ""
) {
    return fallback;
}


const number =
    Number(value);


if (!Number.isFinite(number)) {
    return fallback;
}


return `${number.toFixed(2)}×`;

}

/* =========================================================
TEST NOMBRE
========================================================= */

function isNumber(value) {

return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(
        Number(value)
    )
);

}

/* =========================================================
NORMALISATION
========================================================= */

function normalize(value) {

if (
    value === null ||
    value === undefined
) {
    return "";
}


return String(value)
    .trim()
    .toLowerCase();

}

/* =========================================================
ERREUR
========================================================= */

function showError(message) {

const page =
    document.querySelector(
        ".weapon-page"
    );

const error =
    document.getElementById(
        "weapon-error"
    );

const errorText =
    document.getElementById(
        "weapon-error-text"
    );


if (errorText) {
    errorText.textContent =
        message;
}


if (error) {
    error.hidden =
        false;
}


/*
 * On masque seulement les données
 * de l'arme.
 *
 * La topbar et la sidebar
 * restent visibles.
 */

if (page) {

    page
        .querySelectorAll(
            ".weapon-hero, .weapon-section"
        )
        .forEach(element => {

            element.style.display =
                "none";

        });

}


document.title =
    "Arme introuvable — ANOPOLY";

}
