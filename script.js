/**
 * Pokémon Champions Pokédex Calculator
 * Vue 3 (CDN) Reactive Engine
 */

const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

// Endpoints de datos
const API_ENDPOINTS = {
    ROSTER: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/pokemon/roster.json",
    STATS: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/pokemon/base-stats.json",
    NATURES: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/natures/natures.json",
    LEARNSETS: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/learnsets/learnsets.json",
    MOVES: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/moves/moves.json",
    ABILITIES: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/abilities/abilities.json",
    ITEMS: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/items/items.json",
    TYPE_CHART: "https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/refs/heads/main/type-chart/effectiveness.json"
};

// Traducciones
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

// Colores oficiales por tipo Pokémon
const TYPE_COLORS = {
    Normal: "#A8A878",
    Fire: "#F08030",
    Water: "#6890F0",
    Electric: "#F8D030",
    Grass: "#78C850",
    Ice: "#98D8D8",
    Fighting: "#C03028",
    Poison: "#A040A0",
    Ground: "#E0C068",
    Flying: "#A890F0",
    Psychic: "#F85888",
    Bug: "#A8B820",
    Rock: "#B8A038",
    Ghost: "#705898",
    Dragon: "#7038F8",
    Dark: "#705848",
    Steel: "#B8B8D0",
    Fairy: "#EE99AC"
};

// Audio sintetizado (Web Audio API para sonido retro de Pokédex)
class RetroAudio {
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

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;

            if (type === "click") {
                osc.type = "square";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === "beep") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.setValueAtTime(880, now + 0.05); // A5
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === "pokedex_scan") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
                gain.gain.setValueAtTime(0.09, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
            }
        } catch (e) {
            // Ignorar errores de audio
        }
    }
}

const retroAudio = new RetroAudio();

createApp({
    setup() {
        // Estados de carga
        const loading = ref(true);
        const error = ref(null);
        const soundEnabled = ref(true);
        const mobileTab = ref("screen1"); // 'screen1' (Visor) o 'screen2' (Calculadora)

        // Filtros y búsqueda
        const searchQuery = ref("");
        const selectedTypeFilter = ref("");

        // Bases de datos cargadas
        const roster = ref([]);
        const statsMap = ref(new Map());
        const natures = ref([]);
        const learnsets = ref({});
        const movesMap = ref(new Map());
        const abilitiesMap = ref(new Map());
        const items = ref([]);
        const typeChart = ref(null);
        const typesList = ref([]);

        // Selección actual
        const selectedPokemon = ref(null);
        const selectedNature = ref(null);
        const selectedItem = ref("");
        const selectedMoves = ref(["", "", "", ""]);

        // Puntos SP (Stat Points: Total máximo 66, máximo por stat 32)
        const spPoints = reactive({
            hp: 0,
            atk: 0,
            def: 0,
            spa: 0,
            spd: 0,
            spe: 0
        });

        // Helper para crear key única de Pokémon
        const getPokemonKey = (p) => {
            if (!p) return "";
            return `${p.name}|${p.dexNumber}|${p.form}`;
        };

        // Roster filtrado por búsqueda y tipo
        const filteredRoster = computed(() => {
            const query = searchQuery.value.trim().toLowerCase();
            const typeFilt = selectedTypeFilter.value;

            return roster.value.filter(p => {
                const matchName = p.name.toLowerCase().includes(query);
                const matchDex = String(p.dexNumber).includes(query) || `#${String(p.dexNumber).padStart(3, "0")}`.includes(query);
                const matchType = !typeFilt || (p.types && p.types.includes(typeFilt));
                return (matchName || matchDex) && matchType;
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

        // Estadísticas finales calculadas (Fórmulas Champions)
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

        // Habilidades verificadas del Pokémon seleccionado
        const verifiedAbilities = computed(() => {
            if (!selectedPokemon.value || !selectedPokemon.value.abilities) return [];
            const names = Object.values(selectedPokemon.value.abilities);
            const list = [];
            for (const name of names) {
                const item = abilitiesMap.value.get(name);
                if (item && item.championsVerified === true) {
                    list.push(item);
                } else if (item) {
                    list.push({ ...item, unverified: true });
                } else {
                    list.push({ name, description: "Habilidad sin descripción disponible." });
                }
            }
            return list;
        });

        // Objeto seleccionado con información
        const selectedItemInfo = computed(() => {
            if (!selectedItem.value) return null;
            return items.value.find(it => it.name === selectedItem.value) || null;
        });

        // Movimientos disponibles en Champions para el Pokémon seleccionado
        const availableMoves = computed(() => {
            if (!selectedPokemon.value) return [];
            const learnset = learnsets.value[selectedPokemon.value.name];
            if (!learnset || !learnset.moves) return [];

            const list = [];
            for (const m of learnset.moves) {
                const moveData = movesMap.value.get(m.name);
                if (moveData && moveData.inChampions === true) {
                    list.push(moveData);
                }
            }
            return list.sort((a, b) => a.name.localeCompare(b.name));
        });

        // Lista de los 4 movimientos seleccionados con todos sus datos
        const moveDetails = computed(() => {
            return selectedMoves.value.map(name => {
                if (!name) return null;
                return movesMap.value.get(name) || null;
            });
        });

        // Cálculo de efectividades defensivas
        const typeEffectiveness = computed(() => {
            if (!selectedPokemon.value || !selectedPokemon.value.types || !typeChart.value) {
                return { immune: [], superResistant: [], resistant: [], normal: [], weak: [], superWeak: [] };
            }

            const chart = typeChart.value;
            const res = {
                immune: [],
                superResistant: [],
                resistant: [],
                normal: [],
                weak: [],
                superWeak: []
            };

            for (const atkType of typesList.value) {
                let multiplier = 1;
                for (const defType of selectedPokemon.value.types) {
                    const factor = chart[atkType]?.[defType] ?? 1;
                    multiplier *= factor;
                }

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

        // URL de la imagen del Pokémon (Official artwork con fallback)
        const pokemonArtwork = computed(() => {
            if (!selectedPokemon.value) return "";
            const dex = selectedPokemon.value.dexNumber;
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
        });

        // Sprite animado / pixel art de respaldo
        const pokemonSprite = computed(() => {
            if (!selectedPokemon.value) return "";
            const dex = selectedPokemon.value.dexNumber;
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${dex}.gif`;
        });

        // Métodos
        const playSound = (type = "click") => {
            if (soundEnabled.value) {
                retroAudio.play(type);
            }
        };

        const toggleSound = () => {
            soundEnabled.value = !soundEnabled.value;
            retroAudio.enabled = soundEnabled.value;
            if (soundEnabled.value) {
                retroAudio.play("beep");
            }
        };

        const selectPokemon = (pokemon) => {
            if (!pokemon) return;
            selectedPokemon.value = pokemon;
            selectedMoves.value = ["", "", "", ""];
            resetSp(false);
            playSound("pokedex_scan");
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

        // Presets comunes de SP para Champions
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
                    typeChartRes
                ] = await Promise.all([
                    fetch(API_ENDPOINTS.ROSTER).then(r => r.json()),
                    fetch(API_ENDPOINTS.STATS).then(r => r.json()),
                    fetch(API_ENDPOINTS.NATURES).then(r => r.json()),
                    fetch(API_ENDPOINTS.LEARNSETS).then(r => r.json()),
                    fetch(API_ENDPOINTS.MOVES).then(r => r.json()),
                    fetch(API_ENDPOINTS.ABILITIES).then(r => r.json()),
                    fetch(API_ENDPOINTS.ITEMS).then(r => r.json()),
                    fetch(API_ENDPOINTS.TYPE_CHART).then(r => r.json())
                ]);

                // Asignar y construir índices optimizados
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

                // Filtrar objetos excluyendo "TR"
                items.value = itemsRes.filter(it => !it.name.trim().toUpperCase().startsWith("TR"));

                typeChart.value = typeChartRes.chart;
                typesList.value = typeChartRes.types.filter(t => t.trim().toLowerCase() !== "stellar");

                // Configurar selección inicial
                const initialNature = naturesRes.find(n => n.name === "Hardy") || naturesRes[0];
                selectedNature.value = initialNature;

                if (rosterRes.length > 0) {
                    const defaultPoke = rosterRes.find(p => p.name === "Venusaur") || rosterRes[0];
                    selectPokemon(defaultPoke);
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
            loading,
            error,
            soundEnabled,
            mobileTab,
            searchQuery,
            selectedTypeFilter,
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
            loadAllData
        };
    }
}).mount("#app");