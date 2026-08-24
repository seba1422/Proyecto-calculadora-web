/**
 * Pokémon Champions Pokédex Calculator & Team Defense Analyzer
 * Rotom Smartphone Edition - Vue 3 (CDN) Reactive Engine
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
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === "team_add") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(659.25, now + 0.06);
                osc.frequency.setValueAtTime(880, now + 0.12);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {
            // Manejar silenciosamente
        }
    }
}

const rotomAudio = new RotomAudio();

createApp({
    setup() {
        // Estados de Sistema
        const loading = ref(true);
        const error = ref(null);
        const soundEnabled = ref(true);
        
        // Pestaña Activa: 'info' (Información), 'calc' (Cálculo SP), 'team' (Equipo 6 Pokémon)
        const activeTab = ref("info");
        const rotomMood = ref("happy");

        // Filtros y Búsqueda
        const searchQuery = ref("");
        const selectedTypeFilter = ref("");
        const selectedGenFilter = ref("all");

        // Bases de Datos
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

        // Selección Actual en Pestañas 1 & 2
        const selectedPokemon = ref(null);
        const selectedNature = ref(null);
        const selectedItem = ref("");
        const selectedMoves = ref(["", "", "", ""]);

        // Puntos SP (Total máx 66, máx 32 por stat)
        const spPoints = reactive({
            hp: 0,
            atk: 0,
            def: 0,
            spa: 0,
            spd: 0,
            spe: 0
        });

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

        // Helpers de Traducción ES / LATAM
        const getMoveDisplayName = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.moves?.[name];
            return tr?.display || name;
        };

        const getMoveDescription = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.moves?.[name];
            return tr?.description || "";
        };

        const getAbilityDisplayName = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.abilities?.[name];
            return tr?.display || name;
        };

        const getAbilityDescription = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.abilities?.[name];
            if (tr && tr.description) return tr.description;
            const item = abilitiesMap.value.get(name);
            return item?.description || "Habilidad oficial de Pokémon.";
        };

        const getItemDisplayName = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.items?.[name];
            return tr?.display || name;
        };

        const getItemDescription = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.items?.[name];
            if (tr && tr.description) return tr.description;
            const item = items.value.find(i => i.name === name);
            return item?.description || "Objeto oficial de combate.";
        };

        // Helper para crear key única de Pokémon
        const getPokemonKey = (p) => {
            if (!p) return "";
            return `${p.name}|${p.dexNumber}|${p.form || "Base"}`;
        };

        // Roster filtrado por Nombre/Número, Tipo y Generación
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

        // Índice actual en el roster filtrado
        const currentPokemonIndex = computed(() => {
            if (!selectedPokemon.value) return -1;
            return filteredRoster.value.findIndex(p => 
                p.name === selectedPokemon.value.name && p.form === selectedPokemon.value.form
            );
        });

        // Estadísticas base del Pokémon seleccionado
        const baseStats = computed(() => {
            if (!selectedPokemon.value) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
            const key = getPokemonKey(selectedPokemon.value);
            return statsMap.value.get(key) || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, total: 0 };
        });

        // SP Usados y Restantes
        const spUsed = computed(() => {
            return spPoints.hp + spPoints.atk + spPoints.def + spPoints.spa + spPoints.spd + spPoints.spe;
        });

        const spRemaining = computed(() => {
            return 66 - spUsed.value;
        });

        // Multiplicador de naturaleza por estadística
        const getNatureMultiplier = (statKey) => {
            if (!selectedNature.value) return 1.0;
            const natureStatName = TRANSLATIONS.natureStatKeys[statKey];
            if (selectedNature.value.increasedStat === natureStatName) return 1.1;
            if (selectedNature.value.decreasedStat === natureStatName) return 0.9;
            return 1.0;
        };

        // Estadísticas finales calculadas (Fórmulas Champions a Nivel 50)
        const finalStats = computed(() => {
            const base = baseStats.value;
            return {
                hp: base.hp + spPoints.hp + 75,
                atk: Math.floor((base.atk + spPoints.atk + 20) * getNatureMultiplier("atk")),
                def: Math.floor((base.def + spPoints.def + 20) * getNatureMultiplier("def")),
                spa: Math.floor((base.spa + spPoints.spa + 20) * getNatureMultiplier("spa")),
                spd: Math.floor((base.spd + spPoints.spd + 20) * getNatureMultiplier("spd")),
                spe: Math.floor((base.spe + spPoints.spe + 20) * getNatureMultiplier("spe"))
            };
        });

        // Total final de estadísticas
        const finalTotal = computed(() => {
            const f = finalStats.value;
            return f.hp + f.atk + f.def + f.spa + f.spd + f.spe;
        });

        // Habilidades verificadas del Pokémon seleccionado con nombres y descripciones ES / LATAM
        const verifiedAbilities = computed(() => {
            if (!selectedPokemon.value || !selectedPokemon.value.abilities) return [];
            const names = Object.values(selectedPokemon.value.abilities);
            const list = [];
            for (const name of names) {
                const item = abilitiesMap.value.get(name);
                const displayName = getAbilityDisplayName(name);
                const description = getAbilityDescription(name);
                if (item && item.championsVerified === true) {
                    list.push({ ...item, displayName, description, originalName: name });
                } else if (item) {
                    list.push({ ...item, displayName, description, originalName: name, unverified: true });
                } else {
                    list.push({ name, displayName, description });
                }
            }
            return list;
        });

        // Objeto seleccionado con información en español
        const selectedItemInfo = computed(() => {
            if (!selectedItem.value) return null;
            const it = items.value.find(i => i.name === selectedItem.value);
            if (!it) return null;
            return {
                ...it,
                displayName: getItemDisplayName(it.name),
                description: getItemDescription(it.name)
            };
        });

        // Movimientos disponibles en Champions con nombres ES / LATAM
        const availableMoves = computed(() => {
            if (!selectedPokemon.value) return [];
            const learnset = learnsets.value[selectedPokemon.value.name];
            if (!learnset || !learnset.moves) return [];

            const list = [];
            for (const m of learnset.moves) {
                const moveData = movesMap.value.get(m.name);
                if (moveData && moveData.inChampions === true) {
                    const displayName = getMoveDisplayName(m.name);
                    const description = getMoveDescription(m.name);
                    list.push({ ...moveData, displayName, description, originalName: m.name });
                }
            }
            return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
        });

        // Lista de los 4 movimientos seleccionados
        const moveDetails = computed(() => {
            return selectedMoves.value.map(name => {
                if (!name) return null;
                const m = movesMap.value.get(name);
                if (!m) return null;
                return {
                    ...m,
                    displayName: getMoveDisplayName(name),
                    description: getMoveDescription(name)
                };
            });
        });

        // Helper para calcular efectividad de un atacante contra un par de tipos
        const calculateDefenderMultiplier = (atkType, defTypes) => {
            if (!typeChart.value || !defTypes || defTypes.length === 0) return 1;
            let mult = 1;
            for (const dt of defTypes) {
                if (dt && typeChart.value[atkType] && typeChart.value[atkType][dt] !== undefined) {
                    mult *= typeChart.value[atkType][dt];
                }
            }
            return mult;
        };

        // Efectividades individuales del Pokémon seleccionado
        const typeEffectiveness = computed(() => {
            if (!selectedPokemon.value || !selectedPokemon.value.types || !typeChart.value) {
                return { immune: [], superResistant: [], resistant: [], normal: [], weak: [], superWeak: [] };
            }

            const res = { immune: [], superResistant: [], resistant: [], normal: [], weak: [], superWeak: [] };

            for (const atkType of typesList.value) {
                const multiplier = calculateDefenderMultiplier(atkType, selectedPokemon.value.types);
                const item = {
                    type: atkType,
                    nameEs: TRANSLATIONS.types[atkType] || atkType,
                    multiplier,
                    color: TYPE_COLORS[atkType] || "#777"
                };

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
        // ANÁLISIS DE COBERTURA DEFENSIVA DEL EQUIPO (PESTAÑA 3)
        // ========================================================
        const filledTeamCount = computed(() => {
            return teamSlots.value.filter(s => s.types && s.types.some(t => !!t)).length;
        });

        // Matriz de efectividades del equipo para los 18 tipos
        const teamEffectivenessMatrix = computed(() => {
            if (!typeChart.value || typesList.value.length === 0) return [];

            const activeMembers = teamSlots.value.map((slot, index) => {
                const validTypes = slot.types.filter(t => !!t);
                if (validTypes.length === 0) return null;
                return {
                    slotIndex: index + 1,
                    name: slot.pokemonName || `Slot ${index + 1}`,
                    form: slot.form,
                    dexNumber: slot.dexNumber,
                    types: validTypes,
                    sprite: slot.dexNumber ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${slot.dexNumber}.gif` : null
                };
            }).filter(Boolean);

            if (activeMembers.length === 0) return [];

            return typesList.value.map(atkType => {
                let weakCount = 0;
                let superWeakCount = 0;
                let resistantCount = 0;
                let superResistantCount = 0;
                let immuneCount = 0;
                let neutralCount = 0;

                const memberBreakdowns = activeMembers.map(m => {
                    const mult = calculateDefenderMultiplier(atkType, m.types);
                    if (mult === 0) immuneCount++;
                    else if (mult === 0.25) superResistantCount++;
                    else if (mult === 0.5) resistantCount++;
                    else if (mult === 1) neutralCount++;
                    else if (mult === 2) weakCount++;
                    else if (mult === 4) superWeakCount++;

                    return {
                        member: m,
                        multiplier: mult
                    };
                });

                const totalWeak = weakCount + superWeakCount;
                const totalResist = resistantCount + superResistantCount + immuneCount;
                const netBalance = totalResist - totalWeak;

                let status = "balanced";
                if (totalWeak >= 3 && immuneCount === 0 && totalResist <= 1) {
                    status = "critical_danger";
                } else if (totalWeak >= 2 && totalResist === 0) {
                    status = "danger";
                } else if (totalResist >= 3 || immuneCount >= 2) {
                    status = "fortress";
                } else if (totalResist > totalWeak) {
                    status = "safe";
                }

                return {
                    type: atkType,
                    nameEs: TRANSLATIONS.types[atkType] || atkType,
                    color: TYPE_COLORS[atkType] || "#777",
                    weakCount,
                    superWeakCount,
                    totalWeak,
                    resistantCount,
                    superResistantCount,
                    immuneCount,
                    neutralCount,
                    totalResist,
                    netBalance,
                    status,
                    breakdown: memberBreakdowns
                };
            });
        });

        // Diagnóstico Rotom Inteligente
        const teamDiagnostics = computed(() => {
            const matrix = teamEffectivenessMatrix.value;
            if (matrix.length === 0) {
                return {
                    alerts: [{
                        type: "info",
                        icon: "💡",
                        title: "Equipo Vacío",
                        desc: "Agrega al menos 1 Pokémon o pulsa 'Equipo Recomendado' para analizar las defensas de tu team."
                    }],
                    grade: "—",
                    summary: "Esperando datos del equipo..."
                };
            }

            const alerts = [];
            const criticalWeakTypes = matrix.filter(m => m.status === "critical_danger");
            const strongResistTypes = matrix.filter(m => m.status === "fortress");
            const zeroCoverageWeak = matrix.filter(m => m.totalWeak > 0 && m.totalResist === 0);

            if (criticalWeakTypes.length > 0) {
                alerts.push({
                    type: "danger",
                    icon: "🚨",
                    title: `Debilidad Crítica: ${criticalWeakTypes.map(t => t.nameEs).join(", ")}`,
                    desc: `¡Cuidado, Rotom-detecta que 3 o más Pokémon sufren daño súper efectivo contra ${criticalWeakTypes.map(t => t.nameEs).join(", ")} sin inmunidades!`
                });
            }

            if (zeroCoverageWeak.length > 0 && criticalWeakTypes.length === 0) {
                alerts.push({
                    type: "warning",
                    icon: "⚠️",
                    title: `Sin Resistencia a: ${zeroCoverageWeak.map(t => t.nameEs).slice(0, 3).join(", ")}`,
                    desc: `No tienes ningún Pokémon en el equipo que resista ataques de tipo ${zeroCoverageWeak.map(t => t.nameEs).join(", ")}.`
                });
            }

            if (strongResistTypes.length > 0) {
                alerts.push({
                    type: "success",
                    icon: "🛡️",
                    title: `Gran Muro Defensivo contra: ${strongResistTypes.map(t => t.nameEs).slice(0, 3).join(", ")}`,
                    desc: `Tu equipo cuenta con una excelente combinación de resistencias e inmunidades para estos tipos.`
                });
            }

            let totalDanger = criticalWeakTypes.length * 2 + zeroCoverageWeak.length;
            let totalStrengths = strongResistTypes.length;
            let grade = "A";
            let summary = "¡Un equipo con balance defensivo sobresaliente!";

            if (totalDanger >= 4) {
                grade = "C";
                summary = "Hay vulnerabilidades compartidas severas. Considera ajustar la variedad de tipos elementales.";
            } else if (totalDanger >= 2) {
                grade = "B";
                summary = "Buen equipo, aunque debes tener precaución con ciertos tipos atacantes clave.";
            } else if (totalStrengths >= 4 && totalDanger === 0) {
                grade = "S+";
                summary = "¡Sinergia defensiva de élite! Casi sin debilidades descubiertas.";
            }

            return { alerts, grade, summary };
        });

        // URL de la imagen del Pokémon
        const pokemonArtwork = computed(() => {
            if (!selectedPokemon.value) return "";
            const dex = selectedPokemon.value.dexNumber;
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
        });

        // Sprite animado
        const pokemonSprite = computed(() => {
            if (!selectedPokemon.value) return "";
            const dex = selectedPokemon.value.dexNumber;
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${dex}.gif`;
        });

        // Métodos de Audio & Navegación
        const playSound = (type = "click") => {
            if (soundEnabled.value) {
                rotomAudio.play(type);
            }
        };

        const toggleSound = () => {
            soundEnabled.value = !soundEnabled.value;
            rotomAudio.enabled = soundEnabled.value;
            if (soundEnabled.value) {
                rotomAudio.play("beep");
            }
        };

        const switchTab = (tabName) => {
            activeTab.value = tabName;
            playSound("tab");
            rotomMood.value = tabName === "team" ? "analyzing" : tabName === "calc" ? "thinking" : "happy";
        };

        const selectPokemon = (pokemon) => {
            if (!pokemon) return;
            selectedPokemon.value = pokemon;
            selectedMoves.value = ["", "", "", ""];
            resetSp(false);
            playSound("scan");
            rotomMood.value = "electric";
            setTimeout(() => { rotomMood.value = "happy"; }, 800);
        };

        const selectNextPokemon = () => {
            const list = filteredRoster.value;
            if (list.length === 0) return;
            const idx = currentPokemonIndex.value;
            const nextIdx = (idx + 1) % list.length;
            selectPokemon(list[nextIdx]);
        };

        const selectPrevPokemon = () => {
            const list = filteredRoster.value;
            if (list.length === 0) return;
            const idx = currentPokemonIndex.value;
            const prevIdx = (idx - 1 + list.length) % list.length;
            selectPokemon(list[prevIdx]);
        };

        const modifySp = (stat, amount) => {
            const current = spPoints[stat];
            const next = current + amount;

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
            spPoints.hp = 0;
            spPoints.atk = 0;
            spPoints.def = 0;
            spPoints.spa = 0;
            spPoints.spd = 0;
            spPoints.spe = 0;
            if (playSoundEffect) playSound("beep");
        };

        const applyPreset = (presetName) => {
            resetSp(false);
            if (presetName === "sweeper_phys") {
                spPoints.atk = 32;
                spPoints.spe = 32;
                spPoints.hp = 2;
            } else if (presetName === "sweeper_spec") {
                spPoints.spa = 32;
                spPoints.spe = 32;
                spPoints.hp = 2;
            } else if (presetName === "tank_phys") {
                spPoints.hp = 32;
                spPoints.def = 32;
                spPoints.spd = 2;
            } else if (presetName === "tank_spec") {
                spPoints.hp = 32;
                spPoints.spd = 32;
                spPoints.def = 2;
            } else if (presetName === "balanced") {
                spPoints.hp = 11;
                spPoints.atk = 11;
                spPoints.def = 11;
                spPoints.spa = 11;
                spPoints.spd = 11;
                spPoints.spe = 11;
            }
            playSound("beep");
        };

        const isMoveDisabledInSlot = (moveName, slotIndex) => {
            if (!moveName) return false;
            return selectedMoves.value.some((selected, idx) => idx !== slotIndex && selected === moveName);
        };

        const selectNatureByName = (name) => {
            const nat = natures.value.find(n => n.name === name);
            if (nat) {
                selectedNature.value = nat;
                playSound("click");
            }
        };

        const getStatBarPercent = (statKey) => {
            const finalVal = finalStats.value[statKey] || 0;
            const maxVal = statKey === "hp" ? 500 : 400;
            return Math.min(100, Math.max(5, (finalVal / maxVal) * 100));
        };

        const setTeamSlotFromPokemon = (slotIndex, poke) => {
            if (!poke) {
                teamSlots.value[slotIndex] = {
                    id: slotIndex + 1,
                    pokemonName: "",
                    form: "Base",
                    dexNumber: null,
                    types: ["", ""],
                    custom: false
                };
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
            const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
            setTeamSlotFromPokemon(targetIdx, selectedPokemon.value);
            activeTab.value = "team";
            playSound("team_add");
        };

        const clearSlot = (slotIndex) => {
            setTeamSlotFromPokemon(slotIndex, null);
            playSound("beep");
        };

        const clearTeam = () => {
            teamSlots.value = teamSlots.value.map((_, i) => ({
                id: i + 1,
                pokemonName: "",
                form: "Base",
                dexNumber: null,
                types: ["", ""],
                custom: false
            }));
            playSound("beep");
        };

        const fillSampleTeam = () => {
            const sampleNames = ["Venusaur", "Charizard", "Blastoise", "Gengar", "Dragonite", "Snorlax"];
            sampleNames.forEach((name, idx) => {
                const found = roster.value.find(p => p.name === name);
                if (found) {
                    teamSlots.value[idx] = {
                        id: idx + 1,
                        pokemonName: found.name,
                        form: found.form || "Base",
                        dexNumber: found.dexNumber,
                        types: [found.types[0] || "", found.types[1] || ""],
                        custom: false
                    };
                }
            });
            playSound("team_add");
        };

        // Carga inicial asíncrona de datos
        const loadAllData = async () => {
            loading.value = true;
            error.value = null;

            try {
                const [
                    rosterRes,
                    statsRes,
                    naturesRes,
                    learnsetsRes,
                    movesRes,
                    abilitiesRes,
                    itemsRes,
                    typeChartRes,
                    translationsRes
                ] = await Promise.all([
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
                for (const st of statsRes) {
                    sMap.set(getPokemonKey(st), st);
                }
                statsMap.value = sMap;

                natures.value = naturesRes;
                learnsets.value = learnsetsRes;

                const mMap = new Map();
                for (const mv of movesRes) {
                    mMap.set(mv.name, mv);
                }
                movesMap.value = mMap;

                const aMap = new Map();
                for (const ab of abilitiesRes) {
                    aMap.set(ab.name, ab);
                }
                abilitiesMap.value = aMap;

                items.value = itemsRes.filter(it => !it.name.trim().toUpperCase().startsWith("TR"));

                typeChart.value = typeChartRes.chart;
                typesList.value = typeChartRes.types.filter(t => t.trim().toLowerCase() !== "stellar");
                translationsMap.value = translationsRes;

                // Configurar selección inicial
                const initialNature = naturesRes.find(n => n.name === "Hardy") || naturesRes[0];
                selectedNature.value = initialNature;

                if (rosterRes.length > 0) {
                    const defaultPoke = rosterRes.find(p => p.name === "Pikachu") || rosterRes[0];
                    selectPokemon(defaultPoke);
                    fillSampleTeam();
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
            pokemonSprite,
            teamSlots,
            filledTeamCount,
            teamEffectivenessMatrix,
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
            loadAllData
        };
    }
}).mount("#app");