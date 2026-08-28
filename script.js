/**
 * Pokémon Champions Pokédex Calculator & Team Defense Analyzer
 * Rotom Smartphone Edition - Vue 3 (CDN) Reactive Engine
 * v2.0 — Battle Simulator + Mega Fix + Friendly Matrix
 */

const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

// Endpoints oficiales de datos de Champions
const API_ENDPOINTS = {
    ROSTER: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/pokemon/roster.json",
    STATS: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/pokemon/base-stats.json",
    NATURES: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/natures/natures.json",
    LEARNSETS: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/learnsets/learnsets.json",
    MOVES: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/moves/moves.json",
    ABILITIES: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/abilities/abilities.json",
    ITEMS: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/items/items.json",
    TYPE_CHART: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/type-chart/effectiveness.json",
    TRANSLATIONS: "./translations.json"
};

// Generaciones Pokémon
const GENERATIONS = [
    { id: "all", name: "Todas las Generaciones", min: 1, max: 9999 },
    { id: "1", name: "Gen 1 (Kanto)", min: 1, max: 151 },
    { id: "2", name: "Gen 2 (Johto)", min: 152, max: 251 },
    { id: "3", name: "Gen 3 (Hoenn)", min: 252, max: 386 },
    { id: "4", name: "Gen 4 (Sinnoh)", min: 387, max: 493 },
    { id: "5", name: "Gen 5 (Teselia/Unova)", min: 494, max: 649 },
    { id: "6", name: "Gen 6 (Kalos)", min: 650, max: 721 },
    { id: "7", name: "Gen 7 (Alola)", min: 722, max: 809 },
    { id: "8", name: "Gen 8 (Galar/Hisui)", min: 810, max: 905 },
    { id: "9", name: "Gen 9 (Paldea)", min: 906, max: 1025 }
];

// Traducciones fijas en Español
const TRANSLATIONS = {
    types: {
        Normal: "Normal",
        Fire: "Fuego",
        Water: "Agua",
        Electric: "Eléctrico",
        Grass: "Planta",
        Ice: "Hielo",
        Fighting: "Lucha",
        Poison: "Veneno",
        Ground: "Tierra",
        Flying: "Volador",
        Psychic: "Psíquico",
        Bug: "Bicho",
        Rock: "Roca",
        Ghost: "Fantasma",
        Dragon: "Dragón",
        Dark: "Siniestro",
        Steel: "Acero",
        Fairy: "Hada"
    },
    categories: {
        Physical: "Físico",
        Special: "Especial",
        Status: "Estado"
    },
    stats: {
        hp: "PS",
        atk: "Ataque",
        def: "Defensa",
        spa: "At. Esp.",
        spd: "Def. Esp.",
        spe: "Velocidad"
    },
    natureStatKeys: {
        hp: "hp",
        atk: "attack",
        def: "defense",
        spa: "sp_attack",
        spd: "sp_defense",
        spe: "speed"
    }
};

// Colores oficiales de Tipos Pokémon
const TYPE_COLORS = {
    Normal: "#9FA19F",
    Fire: "#E62829",
    Water: "#2980EF",
    Electric: "#FAC000",
    Grass: "#3FA129",
    Ice: "#3DCEF3",
    Fighting: "#FF8000",
    Poison: "#9141CB",
    Ground: "#915121",
    Flying: "#81B9EF",
    Psychic: "#EF4179",
    Bug: "#91A119",
    Rock: "#AFA981",
    Ghost: "#704170",
    Dragon: "#5060E1",
    Dark: "#50413F",
    Steel: "#60A1B8",
    Fairy: "#EF70EF"
};

// ============================================================
// MOTOR DE SPRITES — Fix Mega y Formas Alternas
// ============================================================

/**
 * Convierte el nombre de un Pokémon al slug de Pokémon Showdown
 * para sprites animados GIF. Ejemplo:
 *   "Mega Venusaur"     → "venusaur-mega"
 *   "Mega Charizard X"  → "charizard-megax"
 *   "Alolan Raichu"     → "raichu-alola"
 *   "Hisuian Zorua"     → "zorua-hisui"
 *   "Paldean Tauros"    → "tauros-paldea-combat"
 */
function getPokemonShowdownSlug(pokemon) {
    if (!pokemon) return null;
    const name = pokemon.name || "";
    const form = pokemon.form || "Base";

    // Mega Evolutions
    if (name.startsWith("Mega ")) {
        const base = name.slice(5).toLowerCase().replace(/\s+/g, "");
        // Especiales: Mega Charizard X/Y, Mega Mewtwo X/Y
        if (base === "charizardx" || base.endsWith("x") && base.length > 2) return base.slice(0, -1) + "-megax";
        if (base === "charizardy" || base.endsWith("y") && base.length > 2) return base.slice(0, -1) + "-megay";
        if (base === "mewtwox") return "mewtwo-megax";
        if (base === "mewtwoy") return "mewtwo-megay";
        return base + "-mega";
    }

    // Alola forms
    if (name.startsWith("Alolan ")) {
        return name.slice(7).toLowerCase().replace(/\s+/g, "") + "-alola";
    }
    // Galar forms
    if (name.startsWith("Galarian ")) {
        return name.slice(9).toLowerCase().replace(/\s+/g, "") + "-galar";
    }
    // Hisui forms
    if (name.startsWith("Hisuian ")) {
        return name.slice(8).toLowerCase().replace(/\s+/g, "") + "-hisui";
    }
    // Paldea forms
    if (name.startsWith("Paldean ")) {
        const base = name.slice(8).toLowerCase().replace(/\s+/g, "");
        return base + "-paldea";
    }

    // form-based check
    if (form === "Mega" || form === "Mega X") {
        const base = name.toLowerCase().replace(/\s+/g, "");
        if (form === "Mega X") return base + "-megax";
        return base + "-mega";
    }
    if (form === "Mega Y") {
        return name.toLowerCase().replace(/\s+/g, "") + "-megay";
    }
    if (form === "Alola") return name.toLowerCase().replace(/\s+/g, "") + "-alola";
    if (form === "Galar") return name.toLowerCase().replace(/\s+/g, "") + "-galar";
    if (form === "Hisui") return name.toLowerCase().replace(/\s+/g, "") + "-hisui";
    if (form === "Paldea") return name.toLowerCase().replace(/\s+/g, "") + "-paldea";

    // Default: just lowercase the name
    return name.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "");
}

/**
 * Retorna la URL del sprite animado de Showdown (GIF).
 * Fallback a PNG estático de Showdown gen5, luego PokeAPI.
*/

function getPokemonSpriteShowdown(pokemon) {
    if (!pokemon) return "";
    const slug = getPokemonShowdownSlug(pokemon);
    return `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`;
}

/**
 * Retorna la URL del artwork oficial.
 * Para formas Mega en PokeAPI: número 10033 = Mega Venusaur, etc.
 * Usamos Showdown front sprites como artwork para formas especiales.
 */
function getPokemonArtworkUrl(pokemon) {
    if (!pokemon) return "";
    const name = pokemon.name || "";
    const dex = pokemon.dexNumber;
    const form = pokemon.form || "Base";

    // Para formas Mega/regionales, Showdown tiene sprites más precisos
    const hasMegaForm = name.startsWith("Mega ") || form === "Mega" || form === "Mega X" || form === "Mega Y";
    const hasRegionalForm = name.startsWith("Alolan ") || name.startsWith("Galarian ") || name.startsWith("Hisuian ") || name.startsWith("Paldean ");

    if (hasMegaForm || hasRegionalForm) {
        const slug = getPokemonShowdownSlug(pokemon);
        // Showdown tiene artwork de alta resolución en dex/
        return `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`;
    }

    // Forma base: usar official-artwork de PokeAPI
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
}

/**
 * Retorna el sprite para un slot de equipo (puede ser Mega).
 * Prioriza sprites animados de Showdown.
 */
function getTeamSlotSpriteUrl(slot) {
    if (!slot || !slot.dexNumber) return "";
    // Reconstruir objeto pokemon desde slot
    const mockPoke = { name: slot.pokemonName || "", dexNumber: slot.dexNumber, form: slot.form || "Base" };
    const slug = getPokemonShowdownSlug(mockPoke);
    return `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`;
}

// Sintetizador de Efectos de Sonido Rotom
class RotomAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    play(type) {
        if (!this.enabled) return;
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            if (type === "click") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === "tab") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.04);
                osc.frequency.setValueAtTime(783.99, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.14);
                osc.start(now);
                osc.stop(now + 0.14);
            } else if (type === "beep") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === "scan") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(350, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === "team_add") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.07, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {
            // Audio no disponible
        }
    }
}

const rotomAudio = new RotomAudio();

// ============================================================
// MOTOR DE CÁLCULO DE DAÑO — Fórmula Competitiva Champions
// ============================================================

/**
 * Aplica el multiplicador de boost (+1 a +6 / -1 a -6).
 * Tabla oficial de Pokémon: +1=1.5x, +2=2x, +3=2.5x... -1=0.67x, etc.
 */
function applyBoost(stat, boost) {
    if (boost === 0) return stat;
    if (boost > 0) return Math.floor(stat * (2 + boost) / 2);
    return Math.floor(stat * 2 / (2 + Math.abs(boost)));
}

/**
 * Calcula el multiplicador de clima sobre un movimiento.
 */
function weatherMultiplier(weather, moveType, isSun, isRain, isHarsh, isHeavy) {
    if (weather === "sun" || weather === "harsh_sun") {
        if (moveType === "Fire") return weather === "harsh_sun" ? 1.5 : 1.5;
        if (moveType === "Water") return weather === "harsh_sun" ? 0 : 0.5;
    }
    if (weather === "rain" || weather === "heavy_rain") {
        if (moveType === "Water") return weather === "heavy_rain" ? 1.5 : 1.5;
        if (moveType === "Fire") return weather === "heavy_rain" ? 0 : 0.5;
    }
    return 1;
}

/**
 * Calcula el multiplicador de terreno.
 */
function terrainMultiplier(terrain, moveType) {
    if (terrain === "electric" && moveType === "Electric") return 1.3;
    if (terrain === "grassy" && moveType === "Grass") return 1.3;
    if (terrain === "psychic" && moveType === "Psychic") return 1.3;
    return 1;
}

/**
 * Retorna descripción legible de los modificadores activos.
 */
function describeModifiers(mods) {
    const parts = [];
    if (mods.stab > 1) parts.push(`STAB ×${mods.stab}`);
    if (mods.typeEff !== 1) parts.push(`Efectividad ×${mods.typeEff}`);
    if (mods.weather !== 1) parts.push(`Clima ×${mods.weather}`);
    if (mods.terrain !== 1) parts.push(`Terreno ×${mods.terrain}`);
    if (mods.screen !== 1) parts.push(`Pantalla ×${mods.screen.toFixed(2)}`);
    if (mods.burned) parts.push("Quemadura ×0.5");
    if (mods.criticalHit) parts.push("Golpe Crítico ×1.5");
    if (mods.helpingHand) parts.push("Mano Amiga ×1.5");
    if (mods.item !== 1) parts.push(`Objeto ×${mods.item}`);
    return parts.join(" | ");
}

/**
 * Motor principal de cálculo de daño (fórmula Pokémon Champions nivel 50).
 * Retorna objeto con todos los datos del resultado.
 */
function calculateDamage(attacker, atkStats, defender, defStats, moveData, battleField, typeChart, typesList) {
    if (!moveData || !moveData.power || moveData.power <= 0) return null;
    if (!atkStats || !defStats) return null;

    const level = 50;
    const basePower = moveData.power;
    const category = moveData.category; // Physical | Special
    const moveType = moveData.type;

    // ---- STAB ----
    const atkTypes = attacker.pokemon?.types || [];
    const effectiveMoveType = (battleField.tera && battleField.teraType) ? battleField.teraType : moveType;
    let stab = 1;
    if (atkTypes.includes(effectiveMoveType)) {
        // Comprobar habilidad Adaptability
        const atkAbility = Object.values(attacker.pokemon?.abilities || {}).find(a => a === "Adaptability");
        stab = atkAbility ? 2.0 : 1.5;
    }
    if (battleField.tera && battleField.teraType && atkTypes.includes(battleField.teraType) && battleField.teraType === moveType) {
        stab = Math.max(stab, 2.0);
    }

    // ---- EFECTIVIDAD ----
    const defTypes = defender.pokemon?.types?.filter(t => !!t) || [];
    let typeEff = 1;
    if (typeChart && defTypes.length > 0) {
        for (const dt of defTypes) {
            if (dt && typeChart[effectiveMoveType] && typeChart[effectiveMoveType][dt] !== undefined) {
                typeEff *= typeChart[effectiveMoveType][dt];
            }
        }
    }
    if (typeEff === 0) return null; // Inmune, no hay daño

    // ---- STATS de ataque y defensa ----
    let atkStatRaw, defStatRaw;
    if (category === "Physical") {
        atkStatRaw = atkStats.atk;
        defStatRaw = defStats.def;
    } else {
        atkStatRaw = atkStats.spa;
        defStatRaw = defStats.spd;
    }

    // Aplicar boosts
    atkStatRaw = applyBoost(atkStatRaw, attacker.atkBoost || 0);
    defStatRaw = applyBoost(defStatRaw, defender.defBoost || 0);

    // Objeto del atacante — multiplicadores comunes
    let itemMult = 1;
    const atkItem = attacker.item || "";
    if (atkItem === "Choice Band" && category === "Physical") itemMult = 1.5;
    if (atkItem === "Choice Specs" && category === "Special") itemMult = 1.5;
    if (atkItem === "Life Orb") itemMult = 1.3;
    if (atkItem === "Muscle Band" && category === "Physical") itemMult = 1.1;
    if (atkItem === "Wise Glasses" && category === "Special") itemMult = 1.1;

    // Objeto del defensor — multiplicadores defensivos
    let defItemMult = 1;
    const defItem = defender.item || "";
    if (defItem === "Eviolite") defItemMult = 1.5; // reduce daño
    if (defItem === "Assault Vest" && category === "Special") defItemMult = 1.5;

    // Aplicar objetos al stat
    atkStatRaw = Math.floor(atkStatRaw * itemMult);
    defStatRaw = Math.floor(defStatRaw * defItemMult);

    // ---- CLIMA ----
    const wMult = weatherMultiplier(battleField.weather, effectiveMoveType);

    // ---- TERRENO ----
    const tMult = terrainMultiplier(battleField.terrain, effectiveMoveType);

    // ---- PANTALLAS ----
    let screenMult = 1;
    if (!battleField.criticalHit) { // Críticos ignoran pantallas
        if ((category === "Physical") && (battleField.reflect || battleField.auroraVeil)) {
            screenMult = battleField.format === "doubles" ? (2 / 3) : 0.5;
        }
        if ((category === "Special") && (battleField.lightScreen || battleField.auroraVeil)) {
            screenMult = battleField.format === "doubles" ? (2 / 3) : 0.5;
        }
        if (battleField.friendGuard) screenMult *= 0.75;
    }

    // ---- QUEMADURA ----
    const burnedMult = (battleField.isBurned && category === "Physical") ? 0.5 : 1;

    // ---- CRÍTICO ----
    const critMult = battleField.criticalHit ? 1.5 : 1;

    // ---- MANO AMIGA ----
    const helpingHandMult = battleField.helpingHand ? 1.5 : 1;

    // ---- DOBLES ----
    // En dobles, movimientos que afectan a todos reducen daño en 75%
    const doublesMult = battleField.format === "doubles" ? 0.75 : 1;

    // ---- FÓRMULA BASE ----
    // Daño = ((2*Nivel/5 + 2) * Potencia * (Ataque/Defensa)) / 50 + 2
    const baseDamage = Math.floor(
        (((2 * level / 5 + 2) * basePower * (atkStatRaw / defStatRaw)) / 50 + 2)
    );

    // ---- MODIFICADORES COMBINADOS ----
    const combined = baseDamage
        * stab
        * typeEff
        * wMult
        * tMult
        * screenMult
        * burnedMult
        * critMult
        * helpingHandMult;

    // ---- 16 ROLLOS (85% a 100%) ----
    const rolls = [];
    for (let i = 85; i <= 100; i++) {
        rolls.push(Math.floor(combined * i / 100));
    }

    const minDmg = rolls[0];
    const maxDmg = rolls[rolls.length - 1];
    const defHP = defender.currentHp || defStats.hp;
    const minPct = +((minDmg / defStats.hp) * 100).toFixed(1);
    const maxPct = +((maxDmg / defStats.hp) * 100).toFixed(1);

    // ---- CLASIFICACIÓN KO ----
    const koRolls = rolls.filter(r => r >= defHP).length;
    const koPct = Math.round((koRolls / 16) * 100);

    let koLabel, koClass;
    if (minDmg >= defHP) {
        koLabel = "¡OHKO Garantizado!";
        koClass = "guarantee";
    } else if (koPct >= 75) {
        koLabel = `${koPct}% KO en 1 golpe`;
        koClass = "likely";
    } else if (koPct > 0) {
        koLabel = `${koPct}% KO en 1 golpe`;
        koClass = "possible";
    } else if (maxDmg >= defHP / 2) {
        koLabel = "Posible 2HKO";
        koClass = "neutral2hko";
    } else {
        koLabel = "No alcanza el KO";
        koClass = "safe";
    }

    const mods = {
        stab,
        typeEff,
        weather: wMult,
        terrain: tMult,
        screen: screenMult,
        burned: battleField.isBurned && category === "Physical",
        criticalHit: battleField.criticalHit,
        helpingHand: battleField.helpingHand,
        item: itemMult
    };

    return {
        rolls,
        minDmg,
        maxDmg,
        minPct,
        maxPct,
        koLabel,
        koClass,
        koPct,
        basePower,
        atkStat: atkStatRaw,
        defStat: defStatRaw,
        stab,
        typeEff,
        category,
        moveName: moveData.displayName || moveData.name || "",
        moveType: effectiveMoveType,
        modifiers: describeModifiers(mods)
    };
}

// ============================================================
// VUE APP
// ============================================================

createApp({
    setup() {
        // Estados globales
        const loading = ref(true);
        const error = ref(null);
        const soundEnabled = ref(true);
        const activeTab = ref("info");
        const rotomMood = ref("happy");
        const searchQuery = ref("");
        const selectedTypeFilter = ref("");
        const selectedGenFilter = ref("all");
        const matrixView = ref("friendly"); // "friendly" | "detailed"

        // Datos de Champions
        const roster = ref([]);
        const statsMap = ref(new Map());
        const natures = ref([]);
        const learnsets = ref({});
        const movesMap = ref(new Map());
        const abilitiesMap = ref(new Map());
        const items = ref([]);
        const typeChart = ref(null);
        const typesList = ref([]);
        const translationsMap = ref({ moves: {}, abilities: {}, items: {} });

        // Selección Actual en Pestaña 1
        const selectedPokemon = ref(null);
        const selectedNature = ref(null);
        const selectedItem = ref("");
        const selectedMoves = ref(["", "", "", ""]);

        // Puntos SP para Pestaña 1 (conservada para referencia)
        const spPoints = reactive({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

        // ========================================================
        // GESTIÓN DEL EQUIPO DE 6 POKÉMON (PESTAÑA 3)
        // ========================================================
        const teamSlots = ref([
            { id: 1, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 2, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 3, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 4, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 5, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 6, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false }
        ]);

        // ========================================================
        // ESTADO DEL SIMULADOR DE BATALLA (PESTAÑA 2)
        // ========================================================
        const attacker = reactive({
            pokemon: null,
            nature: null,
            item: "",
            sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            atkBoost: 0,
            selectedMove: ""
        });

        const defender = reactive({
            pokemon: null,
            nature: null,
            item: "",
            sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            defBoost: 0,
            currentHp: 100
        });

        const battleField = reactive({
            format: "singles",
            weather: "",
            terrain: "",
            reflect: false,
            lightScreen: false,
            auroraVeil: false,
            friendGuard: false,
            criticalHit: false,
            tera: false,
            teraType: "",
            isBurned: false,
            helpingHand: false
        });

        // ========================================================
        // HELPERS DE TRADUCCIÓN
        // ========================================================
        const getMoveDisplayName = (name) => {
            if (!name) return "";
            return translationsMap.value.moves?.[name]?.display || name;
        };

        const getMoveDescription = (name) => {
            if (!name) return "";
            return translationsMap.value.moves?.[name]?.description || "";
        };

        const getAbilityDisplayName = (name) => {
            if (!name) return "";
            return translationsMap.value.abilities?.[name]?.display || name;
        };

        const getAbilityDescription = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.abilities?.[name];
            if (tr?.description) return tr.description;
            return abilitiesMap.value.get(name)?.description || "Habilidad oficial de Pokémon.";
        };

        const getItemDisplayName = (name) => {
            if (!name) return "";
            return translationsMap.value.items?.[name]?.display || name;
        };

        const getItemDescription = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.items?.[name];
            if (tr?.description) return tr.description;
            return items.value.find(i => i.name === name)?.description || "Objeto oficial de combate.";
        };

        const getPokemonKey = (p) => {
            if (!p) return "";
            return `${p.name}|${p.dexNumber}|${p.form || "Base"}`;
        };

        // ========================================================
        // COMPUTED — FILTROS Y SELECCIÓN
        // ========================================================
        const filteredRoster = computed(() => {
            const query = searchQuery.value.trim().toLowerCase();
            const typeFilt = selectedTypeFilter.value;
            const genFilt = selectedGenFilter.value;
            const genData = GENERATIONS.find(g => g.id === genFilt) || GENERATIONS[0];

            return roster.value.filter(p => {
                const matchName = p.name.toLowerCase().includes(query);
                const matchDex = String(p.dexNumber).includes(query) || `#${String(p.dexNumber).padStart(3, "0")}`.includes(query);
                const matchType = !typeFilt || (p.types && p.types.includes(typeFilt));
                const matchGen = p.dexNumber >= genData.min && p.dexNumber <= genData.max;
                return (matchName || matchDex) && matchType && matchGen;
            });
        });

        const currentPokemonIndex = computed(() => {
            if (!selectedPokemon.value) return -1;
            return filteredRoster.value.findIndex(p =>
                p.name === selectedPokemon.value.name && p.form === selectedPokemon.value.form
            );
        });

        // Stats base del Pokémon de la Pestaña 1
        const baseStats = computed(() => {
            if (!selectedPokemon.value) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
            return statsMap.value.get(getPokemonKey(selectedPokemon.value)) || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
        });

        const spUsed = computed(() => spPoints.hp + spPoints.atk + spPoints.def + spPoints.spa + spPoints.spd + spPoints.spe);
        const spRemaining = computed(() => 66 - spUsed.value);

        const getNatureMultiplier = (statKey, nature) => {
            if (!nature) return 1.0;
            const key = TRANSLATIONS.natureStatKeys[statKey];
            if (nature.increasedStat === key) return 1.1;
            if (nature.decreasedStat === key) return 0.9;
            return 1.0;
        };

        const finalStats = computed(() => {
            const base = baseStats.value;
            const nat = selectedNature.value;
            return {
                hp: base.hp + spPoints.hp + 75,
                atk: Math.floor((base.atk + spPoints.atk + 20) * getNatureMultiplier("atk", nat)),
                def: Math.floor((base.def + spPoints.def + 20) * getNatureMultiplier("def", nat)),
                spa: Math.floor((base.spa + spPoints.spa + 20) * getNatureMultiplier("spa", nat)),
                spd: Math.floor((base.spd + spPoints.spd + 20) * getNatureMultiplier("spd", nat)),
                spe: Math.floor((base.spe + spPoints.spe + 20) * getNatureMultiplier("spe", nat))
            };
        });

        const finalTotal = computed(() => {
            const f = finalStats.value;
            return f.hp + f.atk + f.def + f.spa + f.spd + f.spe;
        });

        // ========================================================
        // COMPUTED — SIMULADOR DE BATALLA: STATS ATACANTE
        // ========================================================
        const atkBaseStats = computed(() => {
            if (!attacker.pokemon) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
            return statsMap.value.get(getPokemonKey(attacker.pokemon)) || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
        });

        const atkSpUsed = computed(() => Object.values(attacker.sp).reduce((a, b) => a + b, 0));
        const atkSpRemaining = computed(() => 66 - atkSpUsed.value);

        const atkFinalStats = computed(() => {
            const base = atkBaseStats.value;
            const nat = attacker.nature;
            return {
                hp: base.hp + attacker.sp.hp + 75,
                atk: Math.floor((base.atk + attacker.sp.atk + 20) * getNatureMultiplier("atk", nat)),
                def: Math.floor((base.def + attacker.sp.def + 20) * getNatureMultiplier("def", nat)),
                spa: Math.floor((base.spa + attacker.sp.spa + 20) * getNatureMultiplier("spa", nat)),
                spd: Math.floor((base.spd + attacker.sp.spd + 20) * getNatureMultiplier("spd", nat)),
                spe: Math.floor((base.spe + attacker.sp.spe + 20) * getNatureMultiplier("spe", nat))
            };
        });

        // ========================================================
        // COMPUTED — SIMULADOR DE BATALLA: STATS DEFENSOR
        // ========================================================
        const defBaseStats = computed(() => {
            if (!defender.pokemon) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
            return statsMap.value.get(getPokemonKey(defender.pokemon)) || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
        });

        const defSpUsed = computed(() => Object.values(defender.sp).reduce((a, b) => a + b, 0));
        const defSpRemaining = computed(() => 66 - defSpUsed.value);

        const defFinalStats = computed(() => {
            const base = defBaseStats.value;
            const nat = defender.nature;
            return {
                hp: base.hp + defender.sp.hp + 75,
                atk: Math.floor((base.atk + defender.sp.atk + 20) * getNatureMultiplier("atk", nat)),
                def: Math.floor((base.def + defender.sp.def + 20) * getNatureMultiplier("def", nat)),
                spa: Math.floor((base.spa + defender.sp.spa + 20) * getNatureMultiplier("spa", nat)),
                spd: Math.floor((base.spd + defender.sp.spd + 20) * getNatureMultiplier("spd", nat)),
                spe: Math.floor((base.spe + defender.sp.spe + 20) * getNatureMultiplier("spe", nat))
            };
        });

        const defHpPercent = computed(() => {
            if (!defFinalStats.value.hp) return 100;
            return Math.max(0, Math.min(100, (defender.currentHp / defFinalStats.value.hp) * 100));
        });

        // ========================================================
        // COMPUTED — MOVIMIENTOS DISPONIBLES DEL ATACANTE
        // ========================================================
        const atkAvailableMoves = computed(() => {
            if (!attacker.pokemon) return [];
            const learnset = learnsets.value[attacker.pokemon.name];
            if (!learnset?.moves) return [];
            const list = [];
            for (const m of learnset.moves) {
                const moveData = movesMap.value.get(m.name);
                if (moveData && moveData.inChampions === true && moveData.power && moveData.power > 0) {
                    list.push({
                        ...moveData,
                        displayName: getMoveDisplayName(m.name),
                        description: getMoveDescription(m.name),
                        originalName: m.name
                    });
                }
            }
            return list.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));
        });

        // ========================================================
        // COMPUTED — RESULTADO DE DAÑO
        // ========================================================
        const damageResult = computed(() => {
            if (!attacker.pokemon || !defender.pokemon || !attacker.selectedMove) return null;
            const moveData = movesMap.value.get(attacker.selectedMove);
            if (!moveData) return null;
            const moveWithName = {
                ...moveData,
                displayName: getMoveDisplayName(attacker.selectedMove),
            };
            return calculateDamage(
                attacker,
                atkFinalStats.value,
                defender,
                defFinalStats.value,
                moveWithName,
                battleField,
                typeChart.value,
                typesList.value
            );
        });

        // Sync defender currentHp when defFinalStats changes
        watch(defFinalStats, (newStats) => {
            defender.currentHp = newStats.hp;
        });

        // ========================================================
        // COMPUTED — PESTAÑA 1: URLS DE SPRITES
        // ========================================================
        const pokemonArtwork = computed(() => getPokemonArtworkUrl(selectedPokemon.value));
        const pokemonSpriteUrl = computed(() => getPokemonSpriteShowdown(selectedPokemon.value));

        // ========================================================
        // COMPUTED — HABILIDADES Y MOVIMIENTOS (Pestaña 1)
        // ========================================================
        const verifiedAbilities = computed(() => {
            if (!selectedPokemon.value?.abilities) return [];
            const names = Object.values(selectedPokemon.value.abilities);
            return names.map(name => {
                const item = abilitiesMap.value.get(name);
                return {
                    ...(item || {}),
                    name,
                    displayName: getAbilityDisplayName(name),
                    description: getAbilityDescription(name),
                    championsVerified: item?.championsVerified === true
                };
            });
        });

        const selectedItemInfo = computed(() => {
            if (!selectedItem.value) return null;
            const it = items.value.find(i => i.name === selectedItem.value);
            if (!it) return null;
            return { ...it, displayName: getItemDisplayName(it.name), description: getItemDescription(it.name) };
        });

        const availableMoves = computed(() => {
            if (!selectedPokemon.value) return [];
            const learnset = learnsets.value[selectedPokemon.value.name];
            if (!learnset?.moves) return [];
            const list = [];
            for (const m of learnset.moves) {
                const moveData = movesMap.value.get(m.name);
                if (moveData?.inChampions === true) {
                    list.push({ ...moveData, displayName: getMoveDisplayName(m.name), description: getMoveDescription(m.name), originalName: m.name });
                }
            }
            return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
        });

        const moveDetails = computed(() => {
            return selectedMoves.value.map(name => {
                if (!name) return null;
                const m = movesMap.value.get(name);
                if (!m) return null;
                return { ...m, displayName: getMoveDisplayName(name), description: getMoveDescription(name) };
            });
        });

        // ========================================================
        // COMPUTED — EFECTIVIDAD INDIVIDUAL (Pestaña 1)
        // ========================================================
        const calculateDefenderMultiplier = (atkType, defTypes) => {
            if (!typeChart.value || !defTypes?.length) return 1;
            let mult = 1;
            for (const dt of defTypes) {
                if (dt && typeChart.value[atkType]?.[dt] !== undefined) {
                    mult *= typeChart.value[atkType][dt];
                }
            }
            return mult;
        };

        const typeEffectiveness = computed(() => {
            if (!selectedPokemon.value?.types || !typeChart.value) {
                return { immune: [], superResistant: [], resistant: [], normal: [], weak: [], superWeak: [] };
            }
            const res = { immune: [], superResistant: [], resistant: [], normal: [], weak: [], superWeak: [] };
            for (const atkType of typesList.value) {
                const multiplier = calculateDefenderMultiplier(atkType, selectedPokemon.value.types);
                const item = { type: atkType, nameEs: TRANSLATIONS.types[atkType] || atkType, multiplier, color: TYPE_COLORS[atkType] || "#777" };
                if (multiplier === 0) res.immune.push(item);
                else if (multiplier === 0.25) res.superResistant.push(item);
                else if (multiplier === 0.5) res.resistant.push(item);
                else if (multiplier === 1) res.normal.push(item);
                else if (multiplier === 2) res.weak.push(item);
                else if (multiplier === 4) res.superWeak.push(item);
            }
            return res;
        });

        // ========================================================
        // COMPUTED — ANÁLISIS EQUIPO (Pestaña 3)
        // ========================================================
        const filledTeamCount = computed(() => {
            return teamSlots.value.filter(s => s.types?.some(t => !!t)).length;
        });

        const teamEffectivenessMatrix = computed(() => {
            if (!typeChart.value || typesList.value.length === 0) return [];

            const activeMembers = teamSlots.value.map((slot, index) => {
                const validTypes = slot.types.filter(t => !!t);
                if (validTypes.length === 0) return null;
                return { slotIndex: index + 1, name: slot.pokemonName || `Slot ${index + 1}`, types: validTypes, dexNumber: slot.dexNumber };
            }).filter(Boolean);

            if (activeMembers.length === 0) return [];

            return typesList.value.map(atkType => {
                let weakCount = 0, superWeakCount = 0, resistantCount = 0, superResistantCount = 0, immuneCount = 0, neutralCount = 0;
                for (const m of activeMembers) {
                    const mult = calculateDefenderMultiplier(atkType, m.types);
                    if (mult === 0) immuneCount++;
                    else if (mult === 0.25) superResistantCount++;
                    else if (mult === 0.5) resistantCount++;
                    else if (mult === 1) neutralCount++;
                    else if (mult === 2) weakCount++;
                    else if (mult === 4) superWeakCount++;
                }
                const totalWeak = weakCount + superWeakCount;
                const totalResist = resistantCount + superResistantCount + immuneCount;
                const netBalance = totalResist - totalWeak;
                let status = "balanced";
                if (totalWeak >= 3 && immuneCount === 0 && totalResist <= 1) status = "critical_danger";
                else if (totalWeak >= 2 && totalResist === 0) status = "danger";
                else if (totalResist >= 3 || immuneCount >= 2) status = "fortress";
                else if (totalResist > totalWeak) status = "safe";
                return {
                    type: atkType, nameEs: TRANSLATIONS.types[atkType] || atkType, color: TYPE_COLORS[atkType] || "#777",
                    weakCount, superWeakCount, totalWeak, resistantCount, superResistantCount, immuneCount, neutralCount, totalResist, netBalance, status
                };
            });
        });

        // Vista amigable agrupada
        const friendlyMatrix = computed(() => {
            const matrix = teamEffectivenessMatrix.value;
            return {
                critical: matrix.filter(m => m.status === "critical_danger"),
                danger: matrix.filter(m => m.status === "danger"),
                balanced: matrix.filter(m => m.status === "balanced" || m.status === "safe"),
                fortress: matrix.filter(m => m.status === "fortress" && m.immuneCount === 0),
                immune: matrix.filter(m => m.immuneCount > 0)
            };
        });

        const teamDiagnostics = computed(() => {
            const matrix = teamEffectivenessMatrix.value;
            if (matrix.length === 0) {
                return {
                    alerts: [{ type: "info", icon: "💡", title: "Equipo Vacío", desc: "Agrega al menos 1 Pokémon o pulsa 'Equipo Recomendado' para analizar las defensas de tu team." }],
                    grade: "—",
                    summary: "Esperando datos del equipo..."
                };
            }
            const alerts = [];
            const criticalWeakTypes = matrix.filter(m => m.status === "critical_danger");
            const strongResistTypes = matrix.filter(m => m.status === "fortress");
            const zeroCoverageWeak = matrix.filter(m => m.totalWeak > 0 && m.totalResist === 0);

            if (criticalWeakTypes.length > 0) {
                alerts.push({ type: "danger", icon: "🚨", title: `Debilidad Crítica: ${criticalWeakTypes.map(t => t.nameEs).join(", ")}`, desc: `¡Cuidado! 3 o más Pokémon sufren daño súper efectivo contra estos tipos sin inmunidades.` });
            }
            if (zeroCoverageWeak.length > 0 && criticalWeakTypes.length === 0) {
                alerts.push({ type: "warning", icon: "⚠️", title: `Sin Resistencia a: ${zeroCoverageWeak.map(t => t.nameEs).slice(0, 3).join(", ")}`, desc: `No tienes ningún Pokémon que resista ataques de estos tipos.` });
            }
            if (strongResistTypes.length > 0) {
                alerts.push({ type: "success", icon: "🛡️", title: `Gran Muro Defensivo contra: ${strongResistTypes.map(t => t.nameEs).slice(0, 3).join(", ")}`, desc: `Tu equipo tiene excelente combinación de resistencias e inmunidades para estos tipos.` });
            }

            let grade = "A";
            let summary = "¡Un equipo con balance defensivo sobresaliente!";
            const totalDanger = criticalWeakTypes.length * 2 + zeroCoverageWeak.length;
            const totalStrengths = strongResistTypes.length;

            if (totalDanger >= 4) { grade = "C"; summary = "Vulnerabilidades compartidas severas. Considera ajustar la variedad de tipos elementales."; }
            else if (totalDanger >= 2) { grade = "B"; summary = "Buen equipo, aunque debes tener precaución con ciertos tipos atacantes clave."; }
            else if (totalStrengths >= 4 && totalDanger === 0) { grade = "S+"; summary = "¡Sinergia defensiva de élite! Casi sin debilidades descubiertas."; }

            return { alerts, grade, summary };
        });

        // ========================================================
        // MÉTODOS DE AUDIO & NAVEGACIÓN
        // ========================================================
        const playSound = (type = "click") => {
            if (soundEnabled.value) rotomAudio.play(type);
        };

        const toggleSound = () => {
            soundEnabled.value = !soundEnabled.value;
            rotomAudio.enabled = soundEnabled.value;
            if (soundEnabled.value) rotomAudio.play("beep");
        };

        const switchTab = (tabName) => {
            activeTab.value = tabName;
            playSound("tab");
            rotomMood.value = tabName === "team" ? "analyzing" : tabName === "battle" ? "thinking" : "happy";
        };

        const selectPokemon = (pokemon) => {
            if (!pokemon) return;
            selectedPokemon.value = pokemon;
            selectedMoves.value = ["", "", "", ""];
            spPoints.hp = spPoints.atk = spPoints.def = spPoints.spa = spPoints.spd = spPoints.spe = 0;
            playSound("scan");
            rotomMood.value = "electric";
            setTimeout(() => { rotomMood.value = "happy"; }, 800);
        };

        const selectNextPokemon = () => {
            const list = filteredRoster.value;
            if (!list.length) return;
            const nextIdx = (currentPokemonIndex.value + 1) % list.length;
            selectPokemon(list[nextIdx]);
        };

        const selectPrevPokemon = () => {
            const list = filteredRoster.value;
            if (!list.length) return;
            const prevIdx = (currentPokemonIndex.value - 1 + list.length) % list.length;
            selectPokemon(list[prevIdx]);
        };

        // ========================================================
        // MÉTODOS DE SP (Pestaña 1 - conservado)
        // ========================================================
        const modifySp = (stat, amount) => {
            const next = spPoints[stat] + amount;
            if (next < 0 || next > 32) return;
            if (amount > 0 && spUsed.value + amount > 66) return;
            spPoints[stat] = next;
            playSound("click");
        };

        const setStatSp = (stat, targetValue) => {
            const clamped = Math.max(0, Math.min(32, targetValue));
            const diff = clamped - spPoints[stat];
            if (diff > 0 && spUsed.value + diff > 66) {
                spPoints[stat] += (66 - spUsed.value);
            } else {
                spPoints[stat] = clamped;
            }
            playSound("click");
        };

        const resetSp = (playSoundEffect = true) => {
            spPoints.hp = spPoints.atk = spPoints.def = spPoints.spa = spPoints.spd = spPoints.spe = 0;
            if (playSoundEffect) playSound("beep");
        };

        const applyPreset = (presetName) => {
            resetSp(false);
            if (presetName === "sweeper_phys") { spPoints.atk = 32; spPoints.spe = 32; spPoints.hp = 2; }
            else if (presetName === "sweeper_spec") { spPoints.spa = 32; spPoints.spe = 32; spPoints.hp = 2; }
            else if (presetName === "tank_phys") { spPoints.hp = 32; spPoints.def = 32; spPoints.spd = 2; }
            else if (presetName === "tank_spec") { spPoints.hp = 32; spPoints.spd = 32; spPoints.def = 2; }
            playSound("beep");
        };

        // ========================================================
        // MÉTODOS DE SP — SIMULADOR DE BATALLA
        // ========================================================
        const modifyAtkSp = (stat, amount) => {
            const next = attacker.sp[stat] + amount;
            if (next < 0 || next > 32) return;
            if (amount > 0 && atkSpUsed.value + amount > 66) return;
            attacker.sp[stat] = next;
            playSound("click");
        };

        const resetAtkSp = () => {
            Object.keys(attacker.sp).forEach(k => attacker.sp[k] = 0);
            playSound("beep");
        };

        const modifyDefSp = (stat, amount) => {
            const next = defender.sp[stat] + amount;
            if (next < 0 || next > 32) return;
            if (amount > 0 && defSpUsed.value + amount > 66) return;
            defender.sp[stat] = next;
            playSound("click");
        };

        const resetDefSp = () => {
            Object.keys(defender.sp).forEach(k => defender.sp[k] = 0);
            playSound("beep");
        };

        // ========================================================
        // MÉTODOS DE SELECCIÓN — BATTLE
        // ========================================================
        const setAttacker = (poke) => {
            if (!poke) return;
            attacker.pokemon = poke;
            attacker.nature = natures.value[0] || null;
            attacker.item = "";
            Object.keys(attacker.sp).forEach(k => attacker.sp[k] = 0);
            attacker.atkBoost = 0;
            attacker.selectedMove = "";
            playSound("scan");
        };

        const setDefender = (poke) => {
            if (!poke) return;
            defender.pokemon = poke;
            defender.nature = natures.value[0] || null;
            defender.item = "";
            Object.keys(defender.sp).forEach(k => defender.sp[k] = 0);
            defender.defBoost = 0;
            playSound("scan");
        };

        const selectAttackerNature = (name) => {
            const nat = natures.value.find(n => n.name === name);
            if (nat) { attacker.nature = nat; playSound("click"); }
        };

        const selectDefenderNature = (name) => {
            const nat = natures.value.find(n => n.name === name);
            if (nat) { defender.nature = nat; playSound("click"); }
        };

        const swapBattlePokemon = () => {
            const tmpPoke = attacker.pokemon;
            const tmpNat = attacker.nature;
            const tmpItem = attacker.item;
            const tmpSp = { ...attacker.sp };
            const tmpBoost = attacker.atkBoost;

            attacker.pokemon = defender.pokemon;
            attacker.nature = defender.nature;
            attacker.item = defender.item;
            Object.keys(attacker.sp).forEach(k => attacker.sp[k] = defender.sp[k]);
            attacker.atkBoost = defender.defBoost;
            attacker.selectedMove = "";

            defender.pokemon = tmpPoke;
            defender.nature = tmpNat;
            defender.item = tmpItem;
            Object.keys(defender.sp).forEach(k => defender.sp[k] = tmpSp[k]);
            defender.defBoost = tmpBoost;
            playSound("tab");
        };

        // ========================================================
        // MÉTODOS DE EQUIPO (Pestaña 3)
        // ========================================================
        const isMoveDisabledInSlot = (moveName, slotIndex) => {
            if (!moveName) return false;
            return selectedMoves.value.some((selected, idx) => idx !== slotIndex && selected === moveName);
        };

        const selectNatureByName = (name) => {
            const nat = natures.value.find(n => n.name === name);
            if (nat) { selectedNature.value = nat; playSound("click"); }
        };

        const setTeamSlotFromPokemon = (slotIndex, poke) => {
            if (!poke) {
                teamSlots.value[slotIndex] = { id: slotIndex + 1, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false };
            } else {
                teamSlots.value[slotIndex] = {
                    id: slotIndex + 1,
                    pokemonName: poke.name,
                    form: poke.form || "Base",
                    dexNumber: poke.dexNumber,
                    types: [poke.types[0] || "", poke.types[1] || ""],
                    custom: false
                };
            }
            playSound("team_add");
        };

        const addCurrentPokemonToTeam = () => {
            if (!selectedPokemon.value) return;
            const emptyIdx = teamSlots.value.findIndex(s => !s.pokemonName && (!s.types[0] && !s.types[1]));
            setTeamSlotFromPokemon(emptyIdx !== -1 ? emptyIdx : 0, selectedPokemon.value);
            activeTab.value = "team";
            playSound("team_add");
        };

        const clearSlot = (slotIndex) => {
            setTeamSlotFromPokemon(slotIndex, null);
            playSound("beep");
        };

        const clearTeam = () => {
            teamSlots.value = teamSlots.value.map((_, i) => ({ id: i + 1, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false }));
            playSound("beep");
        };

        const fillSampleTeam = () => {
            const sampleNames = ["Venusaur", "Charizard", "Blastoise", "Gengar", "Dragonite", "Snorlax"];
            sampleNames.forEach((name, idx) => {
                const found = roster.value.find(p => p.name === name);
                if (found) {
                    teamSlots.value[idx] = { id: idx + 1, pokemonName: found.name, form: found.form || "Base", dexNumber: found.dexNumber, types: [found.types[0] || "", found.types[1] || ""], custom: false };
                }
            });
            playSound("team_add");
        };

        const getTeamSlotSprite = (slot) => getTeamSlotSpriteUrl(slot);

        const getStatBarPercent = (statKey) => {
            const finalVal = finalStats.value[statKey] || 0;
            const maxVal = statKey === "hp" ? 500 : 400;
            return Math.min(100, Math.max(5, (finalVal / maxVal) * 100));
        };

        // ========================================================
        // CARGA INICIAL DE DATOS
        // ========================================================
        const loadAllData = async () => {
            loading.value = true;
            error.value = null;

            try {
                const [rosterRes, statsRes, naturesRes, learnsetsRes, movesRes, abilitiesRes, itemsRes, typeChartRes, translationsRes] = await Promise.all([
                    fetch(API_ENDPOINTS.ROSTER).then(r => r.json()),
                    fetch(API_ENDPOINTS.STATS).then(r => r.json()),
                    fetch(API_ENDPOINTS.NATURES).then(r => r.json()),
                    fetch(API_ENDPOINTS.LEARNSETS).then(r => r.json()),
                    fetch(API_ENDPOINTS.MOVES).then(r => r.json()),
                    fetch(API_ENDPOINTS.ABILITIES).then(r => r.json()),
                    fetch(API_ENDPOINTS.ITEMS).then(r => r.json()),
                    fetch(API_ENDPOINTS.TYPE_CHART).then(r => r.json()),
                    fetch(API_ENDPOINTS.TRANSLATIONS).then(r => r.json()).catch(() => ({ moves: {}, abilities: {}, items: {} }))
                ]);

                roster.value = rosterRes;

                const sMap = new Map();
                for (const st of statsRes) sMap.set(getPokemonKey(st), st);
                statsMap.value = sMap;

                natures.value = naturesRes;
                learnsets.value = learnsetsRes;

                const mMap = new Map();
                for (const mv of movesRes) mMap.set(mv.name, mv);
                movesMap.value = mMap;

                const aMap = new Map();
                for (const ab of abilitiesRes) aMap.set(ab.name, ab);
                abilitiesMap.value = aMap;

                items.value = itemsRes.filter(it => !it.name.trim().toUpperCase().startsWith("TR"));
                typeChart.value = typeChartRes.chart;
                typesList.value = typeChartRes.types.filter(t => t.trim().toLowerCase() !== "stellar");
                translationsMap.value = translationsRes;

                const initialNature = naturesRes.find(n => n.name === "Hardy") || naturesRes[0];
                selectedNature.value = initialNature;

                if (rosterRes.length > 0) {
                    const defaultPoke = rosterRes.find(p => p.name === "Pikachu") || rosterRes[0];
                    selectPokemon(defaultPoke);
                    fillSampleTeam();

                    // Pre-cargar primer Pokémon en el simulador de batalla
                    const firstPoke = rosterRes.find(p => p.name === "Pikachu") || rosterRes[0];
                    const secondPoke = rosterRes.find(p => p.dexNumber !== firstPoke.dexNumber) || rosterRes[1];
                    if (firstPoke) setAttacker(firstPoke);
                    if (secondPoke) setDefender(secondPoke);
                    attacker.nature = initialNature;
                    defender.nature = initialNature;
                }

                loading.value = false;
            } catch (err) {
                console.error("Error al cargar datos de Pokémon Champions:", err);
                error.value = "No se pudieron cargar los datos de Pokémon Champions. Verifica tu conexión a internet.";
                loading.value = false;
            }
        };

        onMounted(() => {
            loadAllData();
        });

        return {
            TRANSLATIONS,
            TYPE_COLORS,
            GENERATIONS,
            loading,
            error,
            soundEnabled,
            activeTab,
            rotomMood,
            searchQuery,
            selectedTypeFilter,
            selectedGenFilter,
            matrixView,
            roster,
            filteredRoster,
            currentPokemonIndex,
            natures,
            items,
            typesList,
            selectedPokemon,
            selectedNature,
            selectedItem,
            selectedItemInfo,
            selectedMoves,
            moveDetails,
            spPoints,
            baseStats,
            spUsed,
            spRemaining,
            finalStats,
            finalTotal,
            verifiedAbilities,
            availableMoves,
            typeEffectiveness,
            pokemonArtwork,
            pokemonSpriteUrl,
            // Battle Simulator
            attacker,
            defender,
            battleField,
            atkBaseStats,
            atkSpUsed,
            atkSpRemaining,
            atkFinalStats,
            defBaseStats,
            defSpUsed,
            defSpRemaining,
            defFinalStats,
            defHpPercent,
            atkAvailableMoves,
            damageResult,
            // Team
            teamSlots,
            filledTeamCount,
            teamEffectivenessMatrix,
            friendlyMatrix,
            teamDiagnostics,
            getMoveDisplayName,
            getAbilityDisplayName,
            getItemDisplayName,
            selectPokemon,
            selectNextPokemon,
            selectPrevPokemon,
            modifySp,
            setStatSp,
            resetSp,
            applyPreset,
            selectNatureByName,
            isMoveDisabledInSlot,
            getNatureMultiplier,
            getStatBarPercent,
            toggleSound,
            playSound,
            switchTab,
            setTeamSlotFromPokemon,
            addCurrentPokemonToTeam,
            clearSlot,
            clearTeam,
            fillSampleTeam,
            loadAllData,
            getTeamSlotSprite,
            setAttacker,
            setDefender,
            selectAttackerNature,
            selectDefenderNature,
            swapBattlePokemon,
            modifyAtkSp,
            resetAtkSp,
            modifyDefSp,
            resetDefSp
        };
    }
}).mount("#app");