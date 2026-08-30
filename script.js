/**
 * Pokémon Champions Pokédex Calculator & Team Defense Analyzer
 * Rotom Smartphone Edition - Vue 3 Reactive Engine
 * v3.0 — Enhanced Competitive Damage Engine & Full Translations
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

// Diccionario de las 25 Naturalezas con nombres en español y modificaciones
const NATURE_DICT = {
    Hardy: { es: "Fuerte", inc: null, dec: null, text: "Neutra (Sin modificaciones)" },
    Lonely: { es: "Huraña", inc: "atk", dec: "def", text: "+10% Ataque / -10% Defensa" },
    Brave: { es: "Audaz", inc: "atk", dec: "spe", text: "+10% Ataque / -10% Velocidad" },
    Adamant: { es: "Firme", inc: "atk", dec: "spa", text: "+10% Ataque / -10% At. Esp." },
    Naughty: { es: "Pícara", inc: "atk", dec: "spd", text: "+10% Ataque / -10% Def. Esp." },
    Bold: { es: "Osada", inc: "def", dec: "atk", text: "+10% Defensa / -10% Ataque" },
    Docile: { es: "Dócil", inc: null, dec: null, text: "Neutra (Sin modificaciones)" },
    Relaxed: { es: "Plácida", inc: "def", dec: "spe", text: "+10% Defensa / -10% Velocidad" },
    Impish: { es: "Agitada", inc: "def", dec: "spa", text: "+10% Defensa / -10% At. Esp." },
    Lax: { es: "Floja", inc: "def", dec: "spd", text: "+10% Defensa / -10% Def. Esp." },
    Timid: { es: "Miedosa", inc: "spe", dec: "atk", text: "+10% Velocidad / -10% Ataque" },
    Hasty: { es: "Activa", inc: "spe", dec: "def", text: "+10% Velocidad / -10% Defensa" },
    Serious: { es: "Seria", inc: null, dec: null, text: "Neutra (Sin modificaciones)" },
    Jolly: { es: "Alegre", inc: "spe", dec: "spa", text: "+10% Velocidad / -10% At. Esp." },
    Naive: { es: "Ingenua", inc: "spe", dec: "spd", text: "+10% Velocidad / -10% Def. Esp." },
    Modest: { es: "Modesta", inc: "spa", dec: "atk", text: "+10% At. Esp. / -10% Ataque" },
    Mild: { es: "Afable", inc: "spa", dec: "def", text: "+10% At. Esp. / -10% Defensa" },
    Quiet: { es: "Mansa", inc: "spa", dec: "spe", text: "+10% At. Esp. / -10% Velocidad" },
    Bashful: { es: "Tímida", inc: null, dec: null, text: "Neutra (Sin modificaciones)" },
    Rash: { es: "Alocada", inc: "spa", dec: "spd", text: "+10% At. Esp. / -10% Def. Esp." },
    Calm: { es: "Serena", inc: "spd", dec: "atk", text: "+10% Def. Esp. / -10% Ataque" },
    Gentle: { es: "Amable", inc: "spd", dec: "def", text: "+10% Def. Esp. / -10% Defensa" },
    Sassy: { es: "Grosera", inc: "spd", dec: "spe", text: "+10% Def. Esp. / -10% Velocidad" },
    Careful: { es: "Cauta", inc: "spd", dec: "spa", text: "+10% Def. Esp. / -10% At. Esp." },
    Quirky: { es: "Rara", inc: null, dec: null, text: "Neutra (Sin modificaciones)" }
};

// Diccionario de las 191 Habilidades oficiales de Champions en Español
const ABILITY_DICT = {
    "Adaptability": { es: "Adaptable", desc: "Los movimientos que coinciden con el tipo del usuario tienen una bonificación STAB de 2.0x en lugar de 1.5x." },
    "Aerilate": { es: "Piel Celeste", desc: "Los movimientos de tipo Normal se convierten en tipo Volador y aumentan su potencia un 20%." },
    "Aftermath": { es: "Detonación", desc: "Si el usuario se debilita por un ataque de contacto, el atacante pierde 1/4 de sus PS máximos." },
    "Analytic": { es: "Cálculo Final", desc: "Aumenta la potencia del movimiento en un 30% si el usuario ataca en último lugar en el turno." },
    "Anger Point": { es: "Irascible", desc: "Aumenta el Ataque al máximo (+6 niveles) al recibir un golpe crítico." },
    "Anticipation": { es: "Anticipación", desc: "Al entrar al combate, detecta si el rival tiene algún movimiento súper efectivo o de K.O. en un golpe." },
    "Armor Tail": { es: "Cola Armadura", desc: "Impide que los Pokémon rivales utilicen movimientos con prioridad contra el usuario o sus aliados." },
    "Aroma Veil": { es: "Velo Aroma", desc: "Protege al usuario y a sus aliados de efectos que limitan movimientos (Mofa, Otra Vez, Atracción, etc.)." },
    "Battle Bond": { es: "Fuerte Afecto", desc: "Si derrota a un oponente, aumenta su Ataque, Ataque Especial y Velocidad en 1 nivel (una vez por combate)." },
    "Berserk": { es: "Cólera", desc: "Aumenta el Ataque Especial en 1 nivel cuando sus PS bajan del 50% por recibir daño directo." },
    "Big Pecks": { es: "Sacapecho", desc: "Evita que los Pokémon rivales reduzcan la estadística de Defensa del usuario." },
    "Blaze": { es: "Mar Llamas", desc: "Aumenta la potencia de los movimientos de tipo Fuego en un 50% cuando los PS están por debajo del 33%." },
    "Bulletproof": { es: "Antibalas", desc: "Otorga inmunidad frente a movimientos basados en bombas, esferas y proyectiles (Bomba Lodo, Bola Sombra, etc.)." },
    "Cheek Pouch": { es: "Carrillo", desc: "Restaura un 33% de los PS máximos adicionales al consumir cualquier baya en combate." },
    "Chlorophyll": { es: "Clorofila", desc: "Duplica la Velocidad del Pokémon mientras el clima de Sol esté activo en el campo." },
    "Clear Body": { es: "Cuerpo Puro", desc: "Evita que otros Pokémon reduzcan las características del usuario." },
    "Cloud Nine": { es: "Aclimatación", desc: "Anula todos los efectos de las condiciones climáticas mientras el Pokémon esté en el campo." },
    "Competitive": { es: "Tenacidad", desc: "Aumenta el Ataque Especial en 2 niveles por cada característica que le reduzca un rival." },
    "Compound Eyes": { es: "Ojo Compuesto", desc: "Aumenta la precisión de los movimientos del usuario en un 30%." },
    "Contrary": { es: "Respondón", desc: "Invierte los cambios en las características (las bajadas se convierten en subidas y viceversa)." },
    "Corrosion": { es: "Corrosión", desc: "Permite envenenar a cualquier Pokémon sin importar si es de tipo Veneno o Acero." },
    "Cud Chew": { es: "Rumia", desc: "Si consume una baya, vuelve a consumirla y obtener su efecto al final del siguiente turno." },
    "Curious Medicine": { es: "Medicina Extraña", desc: "Al entrar al combate, restablece a 0 todas las modificaciones de características de sus aliados." },
    "Cursed Body": { es: "Cuerpo Maldito", desc: "Tiene un 30% de probabilidad de anular el movimiento del rival al recibir un ataque." },
    "Cute Charm": { es: "Gran Encanto", desc: "Tiene un 30% de probabilidad de enamorar al atacante si este usa un movimiento de contacto." },
    "Damp": { es: "Humedad", desc: "Impide el uso de movimientos autodestructivos como Autodestrucción y Explosión a todos los Pokémon." },
    "Defiant": { es: "Competitivo", desc: "Aumenta el Ataque en 2 niveles por cada característica que le reduzca un rival." },
    "Disguise": { es: "Disfraz", desc: "Protege al usuario de un solo ataque que cause daño directo por combate." },
    "Dragonize": { es: "Dragonizar", desc: "Los movimientos de tipo Normal se convierten en tipo Dragón y aumentan su potencia un 20%." },
    "Drizzle": { es: "Llovizna", desc: "Activa el clima de Lluvia de forma automática al entrar al campo de batalla." },
    "Drought": { es: "Sequía", desc: "Activa el clima de Sol intenso de forma automática al entrar al campo de batalla." },
    "Dry Skin": { es: "Piel Seca", desc: "Recupera PS con la Lluvia y con ataques de tipo Agua, pero recibe un 25% más de daño por Fuego." },
    "Early Bird": { es: "Madrugar", desc: "El Pokémon despierta del estado de sueño en la mitad del tiempo normal." },
    "Earth Eater": { es: "Geofagia", desc: "Inmune a ataques de tipo Tierra; al recibir uno, recupera 1/4 de sus PS máximos." },
    "Electromorphosis": { es: "Dinamo", desc: "Al recibir daño de un ataque, se carga de energía potenciando su siguiente movimiento de tipo Eléctrico." },
    "Fairy Aura": { es: "Aura Feérica", desc: "Aumenta la potencia de los movimientos de tipo Hada de todos los Pokémon en un 33%." },
    "Filter": { es: "Filtro", desc: "Reduce el daño recibido por ataques súper efectivos en un 25% (recibe 0.75x de daño)." },
    "Flame Body": { es: "Cuerpo Llama", desc: "Tiene un 30% de probabilidad de quemar al atacante que utilice un movimiento de contacto." },
    "Flash Fire": { es: "Absorbe Fuego", desc: "Inmune a movimientos de tipo Fuego; al recibir uno, potencia sus ataques de Fuego un 50%." },
    "Flower Veil": { es: "Velo Flor", desc: "Protege a los Pokémon de tipo Planta aliados de bajadas de características y problemas de estado." },
    "Forecast": { es: "Predicción", desc: "Cambia de tipo según el clima activo (Agua en lluvia, Fuego en sol, Hielo en nieve)." },
    "Friend Guard": { es: "Compasión", desc: "Reduce en un 25% el daño directo que reciben los Pokémon aliados en combate." },
    "Frisk": { es: "Cacheo", desc: "Identifica y revela el objeto equipado por el Pokémon rival al entrar al combate." },
    "Fur Coat": { es: "Pelaje Recio", desc: "Duplica la estadística de Defensa física del poseedor, reduciendo a la mitad el daño físico recibido." },
    "Gale Wings": { es: "Alas Vendaval", desc: "Otorga prioridad +1 a los movimientos de tipo Volador cuando el usuario tiene los PS al máximo." },
    "Gluttony": { es: "Gula", desc: "Consume bayas que se activan con salud baja cuando los PS caen al 50% en vez del 25%." },
    "Gooey": { es: "Baba", desc: "Reduce en 1 nivel la Velocidad del atacante cuando este utiliza un movimiento de contacto." },
    "Guts": { es: "Agallas", desc: "Aumenta el Ataque en un 50% si sufre un problema de estado e ignora la penalización de quemadura." },
    "Harvest": { es: "Cosecha", desc: "50% de probabilidad (100% bajo Sol) de recuperar una baya consumida al final de cada turno." },
    "Healer": { es: "Alma Cura", desc: "30% de probabilidad al final de cada turno de curar el problema de estado de un aliado adyacente." },
    "Heatproof": { es: "Ignífugo", desc: "Reduce a la mitad el daño recibido por ataques de tipo Fuego y quemaduras." },
    "Heavy Metal": { es: "Metal Pesado", desc: "Duplica el peso del Pokémon." },
    "Hospitality": { es: "Hospitalidad", desc: "Al entrar al combate, restaura un 25% de los PS máximos de su aliado en combate." },
    "Huge Power": { es: "Potencia", desc: "Duplica la estadística de Ataque físico del Pokémon (2.0x de Ataque)." },
    "Hunger Switch": { es: "Mutapetito", desc: "Alterna entre Forma Saciada y Forma Voraz al final de cada turno." },
    "Hustle": { es: "Entusiasmo", desc: "Aumenta el Ataque físico en un 50%, pero reduce la precisión de los movimientos físicos en un 20%." },
    "Hydration": { es: "Hidratación", desc: "Cura todos los problemas de estado al final de cada turno si hay clima de Lluvia activo." },
    "Hyper Cutter": { es: "Corte Fuerte", desc: "Evita que los rivales reduzcan la estadística de Ataque del usuario." },
    "Ice Body": { es: "Gélido", desc: "Recupera 1/16 de los PS máximos al final de cada turno mientras haya clima de Nieve." },
    "Illuminate": { es: "Iluminación", desc: "Evita que se reduzca la precisión del usuario e ignora los aumentos de evasión del rival." },
    "Illusion": { es: "Ilusión", desc: "Adopta la apariencia del último Pokémon del equipo hasta recibir daño directo." },
    "Immunity": { es: "Inmunidad", desc: "Inmunidad total contra el envenenamiento y el veneno grave." },
    "Imposter": { es: "Impostor", desc: "Se transforma automáticamente en el rival que tiene enfrente al entrar al campo." },
    "Infiltrator": { es: "Allanamiento", desc: "Los ataques del usuario ignoran pantallas (Reflejo, Pantalla Luz, Velo Aurora) y Sustituto." },
    "Innards Out": { es: "Revés", desc: "Al debilitarse por un ataque rival, causa un daño al atacante igual a los PS que tenía antes del golpe." },
    "Inner Focus": { es: "Foco Interno", desc: "Evita el retroceso y previene la bajada de Ataque causada por la habilidad Intimidación." },
    "Insomnia": { es: "Insomnio", desc: "Evita que el Pokémon caiga dormido por cualquier efecto." },
    "Intimidate": { es: "Intimidación", desc: "Al entrar al combate, reduce el Ataque de todos los rivales adyacentes en 1 nivel." },
    "Iron Fist": { es: "Puño Férreo", desc: "Aumenta la potencia de los movimientos basados en puñetazos en un 20%." },
    "Justified": { es: "Justiciero", desc: "Aumenta el Ataque en 1 nivel al recibir un ataque de tipo Siniestro." },
    "Keen Eye": { es: "Vista Lince", desc: "Evita que baje la precisión del usuario e ignora los aumentos de evasión del rival." },
    "Klutz": { es: "Zoquete", desc: "El Pokémon no puede utilizar ni recibir los efectos de su objeto equipado." },
    "Leaf Guard": { es: "Defensa Hoja", desc: "Evita problemas de estado persistentes mientras el clima de Sol esté activo." },
    "Levitate": { es: "Levitación", desc: "Otorga inmunidad total contra ataques de tipo Tierra, Púas, Púas Tóxicas y Red Viscosa." },
    "Light Metal": { es: "Metal Liviano", desc: "Reduce el peso del Pokémon a la mitad." },
    "Lightning Rod": { es: "Pararrayos", desc: "Atrae movimientos Eléctricos, otorga inmunidad eléctrica y sube el At. Especial en 1 nivel." },
    "Limber": { es: "Flexibilidad", desc: "Inmunidad total contra la parálisis." },
    "Liquid Voice": { es: "Voz Fluida", desc: "Los movimientos basados en sonido se convierten en tipo Agua." },
    "Long Reach": { es: "Remoto", desc: "Los movimientos del usuario se ejecutan sin hacer contacto físico directo con el rival." },
    "Magic Bounce": { es: "Espejo Mágico", desc: "Refleja hacia el atacante todos los movimientos de estado que alteren stats o pongan trampas." },
    "Magic Guard": { es: "Muro Mágico", desc: "El Pokémon solo recibe daño por ataques directos (inmune a veneno, quemadura, clima, vidasfera, etc.)." },
    "Magician": { es: "Prestidigitador", desc: "Roba el objeto del rival al golpearlo con un ataque si el usuario no lleva objeto." },
    "Magma Armor": { es: "Escudo Magma", desc: "Inmunidad total contra el congelamiento." },
    "Marvel Scale": { es: "Escama Especial", desc: "Aumenta la Defensa física en un 50% si el usuario sufre un problema de estado." },
    "Mega Launcher": { es: "Megadisparador", desc: "Aumenta la potencia de los movimientos de pulsos y auras en un 50%." },
    "Mega Sol": { es: "Megasol", desc: "Desata un sol abrasador que potencia ataques de Fuego y anula los de Agua." },
    "Merciless": { es: "Ensañamiento", desc: "Los ataques del usuario son siempre golpes críticos garantizados si el rival está envenenado." },
    "Mimicry": { es: "Mimetismo", desc: "Cambia el tipo del Pokémon según el Campo activo (Eléctrico, Césped, Niebla, Psíquico)." },
    "Minus": { es: "Menos", desc: "Aumenta el Ataque Especial en un 50% si un aliado en combate tiene la habilidad Más o Menos." },
    "Mirror Armor": { es: "Coraza Reflejo", desc: "Refleja de vuelta al rival cualquier reducción de características que intente aplicar." },
    "Mold Breaker": { es: "Rompemoldes", desc: "Los movimientos del usuario ignoran las habilidades defensivas del rival (Levitación, Robustez, etc.)." },
    "Moody": { es: "Veleta", desc: "Al final de cada turno, aumenta una estadística al azar en 2 niveles y reduce otra en 1 nivel." },
    "Motor Drive": { es: "Electromotor", desc: "Inmune a ataques de tipo Eléctrico; al recibir uno, aumenta su Velocidad en 1 nivel." },
    "Moxie": { es: "Autoestima", desc: "Aumenta el Ataque en 1 nivel cada vez que debilita a un rival con un ataque directo." },
    "Multiscale": { es: "Compensación", desc: "Reduce a la mitad el daño recibido de cualquier ataque si el usuario tiene los PS al máximo." },
    "Mummy": { es: "Momia", desc: "Al recibir un movimiento de contacto, cambia la habilidad del atacante a Momia." },
    "Natural Cure": { es: "Cura Natural", desc: "Cura todos los problemas de estado del Pokémon al retirarse del campo de batalla." },
    "No Guard": { es: "Indefenso", desc: "Todos los movimientos usados por o contra este Pokémon tienen 100% de precisión." },
    "Oblivious": { es: "Despiste", desc: "Inmunidad contra la atracción, la seducción, la Mofa y la Intimidación." },
    "Opportunist": { es: "Oportunista", desc: "Copia cualquier aumento de características que se aplique un rival durante el combate." },
    "Overcoat": { es: "Funda", desc: "Inmunidad al daño de clima (tormenta de arena) y a movimientos de polvo o esporas." },
    "Overgrow": { es: "Espesura", desc: "Aumenta la potencia de los movimientos de tipo Planta en un 50% cuando los PS bajan del 33%." },
    "Own Tempo": { es: "Ritmo Propio", desc: "Inmunidad contra la confusión y contra la bajada de Ataque por Intimidación." },
    "Parental Bond": { es: "Amor Filial", desc: "Permite atacar dos veces en el mismo turno; el segundo golpe inflige un 25% del daño del primero." },
    "Pickpocket": { es: "Hurto", desc: "Roba el objeto del rival cuando este golpea al usuario con un movimiento de contacto." },
    "Pickup": { es: "Recogida", desc: "Puede recoger objetos usados por otros Pokémon en combate." },
    "Piercing Drill": { es: "Taladro Perforador", desc: "Los movimientos perforantes ignoran la defensa aumentada y pantallas del rival." },
    "Pixilate": { es: "Piel Feérica", desc: "Los movimientos de tipo Normal se convierten en tipo Hada y aumentan su potencia un 20%." },
    "Plus": { es: "Más", desc: "Aumenta el Ataque Especial en un 50% si un aliado en combate tiene la habilidad Más o Menos." },
    "Poison Heal": { es: "Antídoto", desc: "Si está envenenado, recupera 1/8 de sus PS máximos al final de cada turno en vez de perder salud." },
    "Poison Point": { es: "Punto Tóxico", desc: "Tiene un 30% de probabilidad de envenenar al rival que use un movimiento de contacto." },
    "Poison Touch": { es: "Toque Tóxico", desc: "Tiene un 30% de probabilidad de envenenar al objetivo al usar cualquier movimiento de contacto." },
    "Prankster": { es: "Bromista", desc: "Otorga prioridad +1 a los movimientos de clase Estado (no afecta a rivales de tipo Siniestro)." },
    "Pressure": { es: "Presión", desc: "Hace que los rivales consuman 2 PP en lugar de 1 al utilizar movimientos dirigidos al usuario." },
    "Protean": { es: "Mutatipo", desc: "Cambia el tipo del Pokémon al del movimiento que va a utilizar antes de atacar." },
    "Pure Power": { es: "Energía Pura", desc: "Duplica la estadística de Ataque físico del Pokémon (2.0x de Ataque)." },
    "Purifying Salt": { es: "Sal Purificadora", desc: "Inmunidad a problemas de estado y reduce a la mitad el daño recibido de tipo Fantasma." },
    "Queenly Majesty": { es: "Regia Presencia", desc: "Impide que los rivales usen movimientos de prioridad contra el usuario o sus aliados." },
    "Quick Draw": { es: "Mano Rápida", desc: "30% de probabilidad de atacar en primer lugar en su categoría de prioridad con ataques directos." },
    "Quick Feet": { es: "Pies Rápidos", desc: "Aumenta la Velocidad en un 50% al sufrir un problema de estado e ignora la penalización de parálisis." },
    "Rain Dish": { es: "Cura Lluvia", desc: "Recupera 1/16 de los PS máximos al final de cada turno mientras haya clima de Lluvia activo." },
    "Receiver": { es: "Receptor", desc: "Copia la habilidad de un aliado debilitado en combate." },
    "Reckless": { es: "Audaz", desc: "Aumenta en un 20% la potencia de los movimientos que provocan daño de retroceso al usuario." },
    "Refrigerate": { es: "Piel Helada", desc: "Los movimientos de tipo Normal se convierten en tipo Hielo y aumentan su potencia un 20%." },
    "Regenerator": { es: "Regeneración", desc: "Recupera 1/3 de sus PS máximos al retirarse del campo de batalla." },
    "Ripen": { es: "Maduración", desc: "Duplica los efectos de cualquier baya consumida por el Pokémon." },
    "Rivalry": { es: "Rivalidad", desc: "Aumenta la potencia un 25% contra mismo género, y la reduce un 25% contra género opuesto." },
    "Rock Head": { es: "Cabeza Roca", desc: "Protege al usuario de recibir daño de retroceso por sus propios ataques." },
    "Rough Skin": { es: "Piel Tosca", desc: "Los rivales que golpean con movimientos de contacto pierden 1/8 de sus PS máximos." },
    "Sand Force": { es: "Poder Arena", desc: "Aumenta la potencia de ataques de tipo Tierra, Roca y Acero en un 30% bajo Tormenta de Arena." },
    "Sand Rush": { es: "Ímpetu Arena", desc: "Duplica la Velocidad del Pokémon bajo Tormenta de Arena e inmunidad al daño de arena." },
    "Sand Spit": { es: "Expulsarena", desc: "Activa el clima de Tormenta de Arena automáticamente al ser golpeado por un ataque." },
    "Sand Stream": { es: "Chorro Arena", desc: "Activa el clima de Tormenta de Arena de forma automática al entrar al campo de batalla." },
    "Sand Veil": { es: "Velo Arena", desc: "Aumenta la evasión en un 20% bajo Tormenta de Arena e inmunidad al daño de arena." },
    "Sap Sipper": { es: "Herbívoro", desc: "Inmune a ataques de tipo Planta; al recibir uno, aumenta su Ataque en 1 nivel." },
    "Scrappy": { es: "Intrépido", desc: "Permite golpear a tipos Fantasma con ataques de Normal y Lucha, e inmunidad a Intimidación." },
    "Screen Cleaner": { es: "Antibarrera", desc: "Al entrar, elimina todas las pantallas activas en ambos lados del campo (Reflejo, Pantalla de Luz, etc.)." },
    "Shadow Tag": { es: "Sombra Trampa", desc: "Impide que los Pokémon rivales puedan huir o ser retirados del combate (excepto tipo Fantasma)." },
    "Sharpness": { es: "Cortante", desc: "Aumenta la potencia de los movimientos basados en cortes o tajos en un 50%." },
    "Shed Skin": { es: "Mudar", desc: "33% de probabilidad al final de cada turno de curar cualquier problema de estado." },
    "Sheer Force": { es: "Potencia Bruta", desc: "Aumenta la potencia de movimientos con efectos secundarios un 30%, pero anula dichos efectos." },
    "Shell Armor": { es: "Caparazón", desc: "Protege al Pokémon frente a golpes críticos (no puede recibir golpes críticos)." },
    "Shield Dust": { es: "Polvo Escudo", desc: "Bloquea los efectos secundarios adicionales de los ataques recibidos." },
    "Skill Link": { es: "Encadenado", desc: "Los movimientos de impacto múltiple golpean siempre el número máximo de veces (5 impactos)." },
    "Slush Rush": { es: "Quitanieves", desc: "Duplica la Velocidad del Pokémon mientras haya clima de Nieve activo." },
    "Sniper": { es: "Francotirador", desc: "Aumenta el multiplicador de los golpes críticos de 1.5x a 2.25x del daño normal." },
    "Snow Cloak": { es: "Manto Níveo", desc: "Aumenta la evasión en un 20% durante el clima de Nieve." },
    "Snow Warning": { es: "Nevada", desc: "Activa el clima de Nieve de forma automática al entrar al campo de batalla." },
    "Solar Power": { es: "Poder Solar", desc: "Aumenta el Ataque Especial en un 50% bajo Sol, pero pierde 1/8 de PS máximos cada turno." },
    "Solid Rock": { es: "Roca Sólida", desc: "Reduce en un 25% el daño recibido por ataques súper efectivos." },
    "Soundproof": { es: "Insonorizar", desc: "Otorga inmunidad total contra todos los movimientos basados en sonido." },
    "Speed Boost": { es: "Impulso", desc: "Aumenta la Velocidad en 1 nivel al final de cada turno que permanezca en el campo." },
    "Spicy Spray": { es: "Pulverizador Picante", desc: "Reduce la Defensa del rival en 1 nivel al entrar al combate." },
    "Stall": { es: "Rezagado", desc: "El Pokémon siempre actúa en último lugar dentro de su orden de prioridad." },
    "Stalwart": { es: "Firmeza", desc: "Los movimientos del usuario ignoran los efectos de reubicación y atracción de ataques rivales." },
    "Stamina": { es: "Firmeza", desc: "Aumenta la Defensa en 1 nivel cada vez que recibe daño de un ataque." },
    "Stance Change": { es: "Cambio de Postura", desc: "Cambia a Forma Filo al atacar y a Forma Escudo al usar Escudo Real." },
    "Static": { es: "Electricidad Estática", desc: "Tiene un 30% de probabilidad de paralizar al atacante que use un movimiento de contacto." },
    "Steadfast": { es: "Impasible", desc: "Aumenta la Velocidad en 1 nivel cada vez que el Pokémon retrocede por un ataque." },
    "Stench": { es: "Hedor", desc: "Otorga un 10% de probabilidad de hacer retroceder al rival con cualquier ataque." },
    "Sticky Hold": { es: "Viscosidad", desc: "Evita que otros Pokémon puedan robar o quitar el objeto equipado al usuario." },
    "Strong Jaw": { es: "Mandíbula Fuerte", desc: "Aumenta la potencia de los movimientos basados en mordiscos en un 50%." },
    "Sturdy": { es: "Robustez", desc: "Sobrevive con 1 PS a ataques fulminantes si tenía los PS al máximo e inmunidad a K.O. en 1 golpe." },
    "Super Luck": { es: "Afortunado", desc: "Aumenta el índice de golpe crítico en 1 nivel (+1 ratio crítico)." },
    "Supersweet Syrup": { es: "Néctar Dulce", desc: "Al entrar al combate, reduce la evasión de todos los rivales en 1 nivel." },
    "Supreme Overlord": { es: "General Supremo", desc: "Aumenta la potencia de los ataques en un 10% por cada aliado debilitado (hasta +50%)." },
    "Surge Surfer": { es: "Cola Surf", desc: "Duplica la Velocidad del Pokémon mientras el Campo Eléctrico esté activo." },
    "Swarm": { es: "Enjambre", desc: "Aumenta la potencia de los movimientos de tipo Bicho en un 50% cuando los PS bajan del 33%." },
    "Sweet Veil": { es: "Velo Dulce", desc: "Evita que el usuario y sus aliados caigan dormidos mientras esté en combate." },
    "Swift Swim": { es: "Nado Rápido", desc: "Duplica la Velocidad del Pokémon mientras haya clima de Lluvia activo." },
    "Symbiosis": { es: "Simbiosis", desc: "Pasa su objeto equipado a un aliado tan pronto como este consuma el suyo en combate." },
    "Synchronize": { es: "Sincronía", desc: "Si el usuario sufre quemadura, parálisis o veneno, transmite el mismo estado al rival." },
    "Tangled Feet": { es: "Tumbos", desc: "Duplica la evasión del Pokémon mientras esté bajo el estado de confusión." },
    "Technician": { es: "Experto", desc: "Aumenta en un 50% la potencia de movimientos cuya potencia base sea igual o menor a 60." },
    "Telepathy": { es: "Telepatía", desc: "El Pokémon elude y no recibe daño de los ataques realizados por sus propios aliados." },
    "Thick Fat": { es: "Sebo", desc: "Reduce a la mitad (0.5x) el daño recibido de ataques de tipo Fuego y tipo Hielo." },
    "Torrent": { es: "Torrente", desc: "Aumenta la potencia de los movimientos de tipo Agua en un 50% cuando los PS bajan del 33%." },
    "Tough Claws": { es: "Garra Dura", desc: "Aumenta la potencia de todos los movimientos de contacto en un 30%." },
    "Toxic Debris": { es: "Capa Tóxica", desc: "Coloca una capa de Púas Tóxicas en el campo rival al recibir un ataque físico." },
    "Trace": { es: "Calco", desc: "Al entrar al combate, copia una habilidad aleatoria del rival." },
    "Unaware": { es: "Ignorante", desc: "Ignora los cambios de estadísticas defensivas del rival al atacar y ofensivas al defenderse." },
    "Unburden": { es: "Liviano", desc: "Duplica la Velocidad del Pokémon tras perder o consumir su objeto equipado." },
    "Unnerve": { es: "Nerviosismo", desc: "Impide a todos los Pokémon rivales comer o hacer uso de sus bayas equipadas." },
    "Unseen Fist": { es: "Puño Invisible", desc: "Los movimientos de contacto del usuario atraviesan las protecciones rivales." },
    "Volt Absorb": { es: "Absorbe Electricidad", desc: "Inmune a ataques Eléctricos; al recibir uno, recupera 1/4 de sus PS máximos." },
    "Wandering Spirit": { es: "Alma Errante", desc: "Intercambia habilidades con el rival cuando este golpea al usuario con un movimiento de contacto." },
    "Water Absorb": { es: "Absorbe Agua", desc: "Inmune a ataques de tipo Agua; al recibir uno, recupera 1/4 de sus PS máximos." },
    "Water Bubble": { es: "Pompa", desc: "Duplica ataques de Agua, reduce a la mitad el daño de Fuego e inmunidad a quemaduras." },
    "Weak Armor": { es: "Armadura Frágil", desc: "Al recibir un ataque físico, baja la Defensa en 1 nivel y sube la Velocidad en 2 niveles." },
    "White Smoke": { es: "Humo Blanco", desc: "Evita que otros Pokémon reduzcan las características del usuario." },
    "Zero to Hero": { es: "Cambio Heroico", desc: "Al retirarse del campo y volver a entrar, Palafin cambia a Forma Heroica." }
};

// ============================================================
// MOTOR DE SPRITES — Fix Mega y Formas Alternas
// ============================================================
function getPokemonShowdownSlug(pokemon) {
    if (!pokemon) return null;
    const name = pokemon.name || "";
    const form = pokemon.form || "Base";

    if (name.startsWith("Mega ")) {
        const base = name.slice(5).toLowerCase().replace(/\s+/g, "");
        if (base === "charizardx" || base.endsWith("x") && base.length > 2) return base.slice(0, -1) + "-megax";
        if (base === "charizardy" || base.endsWith("y") && base.length > 2) return base.slice(0, -1) + "-megay";
        if (base === "mewtwox") return "mewtwo-megax";
        if (base === "mewtwoy") return "mewtwo-megay";
        return base + "-mega";
    }

    if (name.startsWith("Alolan ")) return name.slice(7).toLowerCase().replace(/\s+/g, "") + "-alola";
    if (name.startsWith("Galarian ")) return name.slice(9).toLowerCase().replace(/\s+/g, "") + "-galar";
    if (name.startsWith("Hisuian ")) return name.slice(8).toLowerCase().replace(/\s+/g, "") + "-hisui";
    if (name.startsWith("Paldean ")) return name.slice(8).toLowerCase().replace(/\s+/g, "") + "-paldea";

    if (form === "Mega" || form === "Mega X") {
        const base = name.toLowerCase().replace(/\s+/g, "");
        if (form === "Mega X") return base + "-megax";
        return base + "-mega";
    }
    if (form === "Mega Y") return name.toLowerCase().replace(/\s+/g, "") + "-megay";
    if (form === "Alola") return name.toLowerCase().replace(/\s+/g, "") + "-alola";
    if (form === "Galar") return name.toLowerCase().replace(/\s+/g, "") + "-galar";
    if (form === "Hisui") return name.toLowerCase().replace(/\s+/g, "") + "-hisui";
    if (form === "Paldea") return name.toLowerCase().replace(/\s+/g, "") + "-paldea";

    return name.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "");
}

function getPokemonSpriteShowdown(pokemon) {
    if (!pokemon) return "";
    const slug = getPokemonShowdownSlug(pokemon);
    return `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`;
}

function getPokemonArtworkUrl(pokemon) {
    if (!pokemon) return "";
    const name = pokemon.name || "";
    const dex = pokemon.dexNumber;
    const form = pokemon.form || "Base";

    const hasMegaForm = name.startsWith("Mega ") || form === "Mega" || form === "Mega X" || form === "Mega Y";
    const hasRegionalForm = name.startsWith("Alolan ") || name.startsWith("Galarian ") || name.startsWith("Hisuian ") || name.startsWith("Paldean ");

    if (hasMegaForm || hasRegionalForm) {
        const slug = getPokemonShowdownSlug(pokemon);
        return `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
}

function getTeamSlotSpriteUrl(slot) {
    if (!slot || !slot.dexNumber) return "";
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
            if (AudioContext) this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
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
        } catch (e) {}
    }
}

const rotomAudio = new RotomAudio();

// ============================================================
// MOTOR DE CÁLCULO DE DAÑO COMPETITIVO
// ============================================================

function applyBoost(stat, boost) {
    if (boost === 0) return stat;
    if (boost > 0) return Math.floor(stat * (2 + boost) / 2);
    return Math.floor(stat * 2 / (2 + Math.abs(boost)));
}

/**
 * Multiplicador de clima (4 climas: sol, lluvia, arena, nieve)
 */
function weatherMultiplier(weather, moveType) {
    if (weather === "sun") {
        if (moveType === "Fire") return 1.5;
        if (moveType === "Water") return 0.5;
    }
    if (weather === "rain") {
        if (moveType === "Water") return 1.5;
        if (moveType === "Fire") return 0.5;
    }
    return 1.0;
}

/**
 * Multiplicador de campos (4 campos: grassy, electric, misty, psychic)
 */
function terrainMultiplier(terrain, moveType, moveName) {
    if (terrain === "grassy") {
        if (moveType === "Grass") return 1.3;
        // Terremoto, Magnitud y Terratemblor se reducen a la mitad (0.5x)
        if (moveName === "Earthquake" || moveName === "Magnitude" || moveName === "Bulldoze") {
            return 0.5;
        }
    }
    if (terrain === "electric" && moveType === "Electric") return 1.3;
    if (terrain === "misty" && moveType === "Dragon") return 0.5; // Reduce daño recibido de Dragon al 50%
    if (terrain === "psychic" && moveType === "Psychic") return 1.3;
    return 1.0;
}

function describeModifiers(mods) {
    const parts = [];
    if (mods.stab > 1) parts.push(`STAB ×${mods.stab}`);
    if (mods.typeEff !== 1) parts.push(`Efectividad ×${mods.typeEff}`);
    if (mods.weather !== 1) parts.push(`Clima ×${mods.weather}`);
    if (mods.terrain !== 1) parts.push(`Campo ×${mods.terrain}`);
    if (mods.screen !== 1) parts.push(`Pantalla ×${mods.screen.toFixed(2)}`);
    if (mods.criticalHit) parts.push("Golpe Crítico ×1.5 (Ignora pantallas y defensas rivales)");
    if (mods.item !== 1) parts.push(`Objeto ×${mods.item}`);
    return parts.join(" | ");
}

/**
 * Cálculo de Daño Competitivo (Fórmula Nivel 50)
 */
function calculateDamage(attacker, atkStats, defender, defStats, moveData, battleField, typeChart, typesList) {
    if (!moveData || !moveData.power || moveData.power <= 0) return null;
    if (!atkStats || !defStats) return null;

    const level = 50;
    let basePower = moveData.power;
    const category = moveData.category; // Physical | Special
    const moveType = moveData.type;
    const moveOriginalName = moveData.originalName || moveData.name;

    // Reglas de Rayo Solar y Cuchillada Solar en clima no-sol (Lluvia, Arena, Nieve)
    if (moveOriginalName === "Solar Beam" || moveOriginalName === "Solar Blade") {
        if (battleField.weather === "sand" || battleField.weather === "snow" || battleField.weather === "rain") {
            basePower = Math.floor(basePower * 0.5);
        }
    }

    // ---- STAB ----
    const atkTypes = attacker.pokemon?.types || [];
    let stab = 1.0;
    if (atkTypes.includes(moveType)) {
        const atkAbility = attacker.ability || Object.values(attacker.pokemon?.abilities || {})[0];
        stab = atkAbility === "Adaptability" ? 2.0 : 1.5;
    }

    // ---- EFECTIVIDAD DE TIPOS ----
    const defTypes = defender.pokemon?.types?.filter(t => !!t) || [];
    let typeEff = 1.0;
    if (typeChart && defTypes.length > 0) {
        for (const dt of defTypes) {
            if (dt && typeChart[moveType] && typeChart[moveType][dt] !== undefined) {
                typeEff *= typeChart[moveType][dt];
            }
        }
    }
    if (typeEff === 0) return null; // Inmune

    // ---- STATS BASE Y ETAPAS ----
    let atkStatRaw, defStatRaw;
    if (category === "Physical") {
        atkStatRaw = atkStats.atk;
        defStatRaw = defStats.def;
    } else {
        atkStatRaw = atkStats.spa;
        defStatRaw = defStats.spd;
    }

    // Reglas de Golpe Crítico sobre ETAPAS (Gen 6+):
    // El crítico ignora reducciones de ataque del atacante (si atkBoost < 0, se toma como 0)
    // El crítico ignora aumentos de defensa del defensor (si defBoost > 0, se toma como 0)
    let effectiveAtkBoost = attacker.atkBoost || 0;
    let effectiveDefBoost = defender.defBoost || 0;

    if (battleField.criticalHit) {
        if (effectiveAtkBoost < 0) effectiveAtkBoost = 0;
        if (effectiveDefBoost > 0) effectiveDefBoost = 0;
    }

    atkStatRaw = applyBoost(atkStatRaw, effectiveAtkBoost);
    defStatRaw = applyBoost(defStatRaw, effectiveDefBoost);

    // Buff defensivo de Nieve (Pokémon tipo Hielo ven su Defensa física +50%)
    if (battleField.weather === "snow" && defTypes.includes("Ice") && category === "Physical") {
        defStatRaw = Math.floor(defStatRaw * 1.5);
    }

    // Buff defensivo de Tormenta de Arena (Pokémon tipo Roca ven su Def. Especial +50%)
    if (battleField.weather === "sand" && defTypes.includes("Rock") && category === "Special") {
        defStatRaw = Math.floor(defStatRaw * 1.5);
    }

    // Objetos atacante
    let itemMult = 1.0;
    const atkItem = attacker.item || "";
    if (atkItem === "Choice Band" && category === "Physical") itemMult = 1.5;
    if (atkItem === "Choice Specs" && category === "Special") itemMult = 1.5;
    if (atkItem === "Life Orb") itemMult = 1.3;
    if (atkItem === "Muscle Band" && category === "Physical") itemMult = 1.1;
    if (atkItem === "Wise Glasses" && category === "Special") itemMult = 1.1;

    // Objetos defensor
    let defItemMult = 1.0;
    const defItem = defender.item || "";
    if (defItem === "Eviolite") defItemMult = 1.5;
    if (defItem === "Assault Vest" && category === "Special") defItemMult = 1.5;

    // Habilidades defensivas directas (no se ignoran con crítico)
    const defAbility = defender.ability || Object.values(defender.pokemon?.abilities || {})[0];
    if (defAbility === "Fur Coat" && category === "Physical") defItemMult *= 2.0;
    if (defAbility === "Thick Fat" && (moveType === "Fire" || moveType === "Ice")) itemMult *= 0.5;

    atkStatRaw = Math.floor(atkStatRaw * itemMult);
    defStatRaw = Math.floor(defStatRaw * defItemMult);

    // ---- CLIMA ----
    const wMult = weatherMultiplier(battleField.weather, moveType);

    // ---- CAMPOS ----
    const tMult = terrainMultiplier(battleField.terrain, moveType, moveOriginalName);

    // ---- PANTALLAS (El golpe crítico ignora Reflejo, Pantalla de Luz y Velo Aurora) ----
    let screenMult = 1.0;
    if (!battleField.criticalHit) {
        if (category === "Physical" && (battleField.reflect || battleField.auroraVeil)) {
            screenMult = battleField.format === "doubles" ? (2 / 3) : 0.5;
        }
        if (category === "Special" && (battleField.lightScreen || battleField.auroraVeil)) {
            screenMult = battleField.format === "doubles" ? (2 / 3) : 0.5;
        }
    }

    // ---- CRÍTICO (Gen 6+ = 1.5x) ----
    const critMult = battleField.criticalHit ? 1.5 : 1.0;

    // ---- FÓRMULA OFICIAL DE DAÑO NIVEL 50 ----
    // Base = Math.floor(((2 * Nivel / 5 + 2) * Potencia * (Ataque / Defensa)) / 50) + 2
    const baseDamage = Math.floor(
        (((2 * level / 5 + 2) * basePower * (atkStatRaw / Math.max(1, defStatRaw))) / 50 + 2)
    );

    // Modificadores combinados
    const combined = baseDamage
        * stab
        * typeEff
        * wMult
        * tMult
        * screenMult
        * critMult;

    // 16 Rollos de daño aleatorio competitivo (85% al 100%)
    const rolls = [];
    for (let i = 85; i <= 100; i++) {
        rolls.push(Math.max(1, Math.floor(combined * i / 100)));
    }

    const minDmg = rolls[0];
    const maxDmg = rolls[rolls.length - 1];
    const defHP = defender.currentHp || defStats.hp;
    const minPct = +((minDmg / defStats.hp) * 100).toFixed(1);
    const maxPct = +((maxDmg / defStats.hp) * 100).toFixed(1);

    const koRolls = rolls.filter(r => r >= defHP).length;
    const koPct = Math.round((koRolls / 16) * 100);

    let koLabel, koClass;
    if (minDmg >= defHP) {
        koLabel = "¡OHKO Garantizado!";
        koClass = "guarantee";
    } else if (koPct >= 75) {
        koLabel = `${koPct}% Probabilidad de KO en 1 golpe`;
        koClass = "likely";
    } else if (koPct > 0) {
        koLabel = `${koPct}% Probabilidad de KO en 1 golpe`;
        koClass = "possible";
    } else if (maxDmg >= defHP / 2) {
        koLabel = "Posible 2HKO (2 golpes)";
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
        criticalHit: battleField.criticalHit,
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
        moveType: moveType,
        modifiers: describeModifiers(mods)
    };
}

// ============================================================
// APLICACIÓN PRINCIPAL VUE 3
// ============================================================

createApp({
    setup() {
        const loading = ref(true);
        const error = ref(null);
        const soundEnabled = ref(true);
        const activeTab = ref("info");
        const rotomMood = ref("happy");
        const searchQuery = ref("");
        const selectedTypeFilter = ref("");
        const selectedGenFilter = ref("all");
        const matrixView = ref("friendly");

        // Datos oficiales
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

        // Pestaña 1
        const selectedPokemon = ref(null);
        const selectedNature = ref(null);
        const selectedItem = ref("");
        const selectedMoves = ref(["", "", "", ""]);
        const spPoints = reactive({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

        // Pestaña 2: Búsquedas locales
        const attackerPokemonSearch = ref("");
        const defenderPokemonSearch = ref("");
        const attackerItemSearch = ref("");
        const defenderItemSearch = ref("");

        // 4 Slots de Movimientos equipados del Atacante
        const attackerMoveSlots = ref(["", "", "", ""]);

        // Pestaña 2: Atacante y Defensor
        const attacker = reactive({
            pokemon: null,
            nature: null,
            ability: "",
            item: "",
            sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            atkBoost: 0,
            selectedMove: ""
        });

        const defender = reactive({
            pokemon: null,
            nature: null,
            ability: "",
            item: "",
            sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            defBoost: 0,
            currentHp: 100
        });

        // Contexto de combate
        const battleField = reactive({
            format: "singles",
            weather: "", // "" | "sun" | "rain" | "sand" | "snow"
            terrain: "", // "" | "grassy" | "electric" | "misty" | "psychic"
            reflect: false,
            lightScreen: false,
            auroraVeil: false,
            criticalHit: false
        });

        // Pestaña 3: Equipo de 6
        const teamSlots = ref([
            { id: 1, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 2, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 3, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 4, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 5, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false },
            { id: 6, pokemonName: "", form: "Base", dexNumber: null, types: ["", ""], custom: false }
        ]);

        // ========================================================
        // HELPERS DE TRADUCCIÓN ROBUSTOS
        // ========================================================
        const getMoveDisplayName = (name) => {
            if (!name) return "";
            return translationsMap.value.moves?.[name]?.display || translationsMap.value.moves?.[name]?.es || name;
        };

        const getMoveDescription = (name) => {
            if (!name) return "";
            return translationsMap.value.moves?.[name]?.description || "";
        };

        const getAbilityDisplayName = (name) => {
            if (!name) return "";
            if (ABILITY_DICT[name]?.es) return ABILITY_DICT[name].es;
            return translationsMap.value.abilities?.[name]?.display || translationsMap.value.abilities?.[name]?.es || name;
        };

        const getAbilityDescription = (name) => {
            if (!name) return "";
            if (ABILITY_DICT[name]?.desc) return ABILITY_DICT[name].desc;
            const tr = translationsMap.value.abilities?.[name];
            if (tr?.description) return tr.description;
            return abilitiesMap.value.get(name)?.description || "Habilidad oficial de Pokémon.";
        };

        const getItemDisplayName = (name) => {
            if (!name) return "";
            return translationsMap.value.items?.[name]?.display || translationsMap.value.items?.[name]?.es || name;
        };

        const getItemDescription = (name) => {
            if (!name) return "";
            const tr = translationsMap.value.items?.[name];
            if (tr?.description) return tr.description;
            return items.value.find(i => i.name === name)?.description || "Objeto oficial de combate.";
        };

        const getNatureDisplayName = (natureName) => {
            if (!natureName) return "";
            const entry = NATURE_DICT[natureName];
            return entry ? `${entry.es} (${natureName})` : natureName;
        };

        const getNatureDescription = (natureName) => {
            if (!natureName) return "";
            return NATURE_DICT[natureName]?.text || "Sin efecto";
        };

        const getNatureStatEffect = (natureName, statKey) => {
            if (!natureName || !NATURE_DICT[natureName]) return null;
            const info = NATURE_DICT[natureName];
            if (info.inc === statKey) return "plus";
            if (info.dec === statKey) return "minus";
            return null;
        };

        const getPokemonKey = (p) => {
            if (!p) return "";
            return `${p.name}|${p.dexNumber}|${p.form || "Base"}`;
        };

        // ========================================================
        // COMPUTED — FILTROS DINÁMICOS CONECTADOS
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

        // Filtro específico para Atacante (usa filtros globales + buscador local)
        const filteredAttackerPokemon = computed(() => {
            const list = filteredRoster.value;
            const subQuery = attackerPokemonSearch.value.trim().toLowerCase();
            if (!subQuery) return list;
            return list.filter(p => p.name.toLowerCase().includes(subQuery) || String(p.dexNumber).includes(subQuery));
        });

        // Filtro específico para Defensor (usa filtros globales + buscador local)
        const filteredDefenderPokemon = computed(() => {
            const list = filteredRoster.value;
            const subQuery = defenderPokemonSearch.value.trim().toLowerCase();
            if (!subQuery) return list;
            return list.filter(p => p.name.toLowerCase().includes(subQuery) || String(p.dexNumber).includes(subQuery));
        });

        // Filtros de Objetos con buscador
        const filteredAttackerItems = computed(() => {
            const q = attackerItemSearch.value.trim().toLowerCase();
            if (!q) return items.value;
            return items.value.filter(it => {
                const nameEn = it.name.toLowerCase();
                const nameEs = getItemDisplayName(it.name).toLowerCase();
                return nameEn.includes(q) || nameEs.includes(q);
            });
        });

        const filteredDefenderItems = computed(() => {
            const q = defenderItemSearch.value.trim().toLowerCase();
            if (!q) return items.value;
            return items.value.filter(it => {
                const nameEn = it.name.toLowerCase();
                const nameEs = getItemDisplayName(it.name).toLowerCase();
                return nameEn.includes(q) || nameEs.includes(q);
            });
        });

        const currentPokemonIndex = computed(() => {
            if (!selectedPokemon.value) return -1;
            return filteredRoster.value.findIndex(p =>
                p.name === selectedPokemon.value.name && p.form === selectedPokemon.value.form
            );
        });

        // Stats Base Pestaña 1
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
        // SIMULADOR DE BATALLA: STATS ATACANTE
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
        // SIMULADOR DE BATALLA: STATS DEFENSOR
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
        // MOVIMIENTOS Y 4 SLOTS DEL ATACANTE
        // ========================================================
        const atkAvailableMoves = computed(() => {
            if (!attacker.pokemon) return [];
            const learnset = learnsets.value[attacker.pokemon.name];
            if (!learnset?.moves) return [];
            const list = [];
            for (const m of learnset.moves) {
                const moveData = movesMap.value.get(m.name);
                if (moveData && moveData.inChampions === true) {
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

        // 4 Movimientos estructurados para el HUD de ataque
        const attackerEquippedMoveObjects = computed(() => {
            return attackerMoveSlots.value.map((moveName, index) => {
                if (!moveName) return null;
                const m = movesMap.value.get(moveName);
                if (!m) return null;
                return {
                    slot: index + 1,
                    name: moveName,
                    displayName: getMoveDisplayName(moveName),
                    description: getMoveDescription(moveName),
                    power: m.power || 0,
                    type: m.type,
                    category: m.category,
                    accuracy: m.accuracy || 100
                };
            });
        });

        // Habilidades disponibles para el Atacante
        const attackerAvailableAbilities = computed(() => {
            if (!attacker.pokemon?.abilities) return [];
            return Object.values(attacker.pokemon.abilities).map(name => ({
                name,
                displayName: getAbilityDisplayName(name),
                description: getAbilityDescription(name)
            }));
        });

        // Habilidades disponibles para el Defensor
        const defenderAvailableAbilities = computed(() => {
            if (!defender.pokemon?.abilities) return [];
            return Object.values(defender.pokemon.abilities).map(name => ({
                name,
                displayName: getAbilityDisplayName(name),
                description: getAbilityDescription(name)
            }));
        });

        // ========================================================
        // RESULTADO DE DAÑO
        // ========================================================
        const damageResult = computed(() => {
            if (!attacker.pokemon || !defender.pokemon || !attacker.selectedMove) return null;
            const moveData = movesMap.value.get(attacker.selectedMove);
            if (!moveData) return null;
            const moveWithName = {
                ...moveData,
                displayName: getMoveDisplayName(attacker.selectedMove),
                originalName: attacker.selectedMove
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

        // Sincronizar PS del defensor
        watch(defFinalStats, (newStats) => {
            defender.currentHp = newStats.hp;
        });

        // Pestaña 1 Helpers
        const pokemonArtwork = computed(() => getPokemonArtworkUrl(selectedPokemon.value));
        const pokemonSpriteUrl = computed(() => getPokemonSpriteShowdown(selectedPokemon.value));

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
                    championsVerified: item?.championsVerified === true || true
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

        // Pestaña 3: Análisis de Equipo
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
                    alerts: [{ type: "info", icon: "💡", title: "Equipo Vacío", desc: "Agrega Pokémon para analizar las defensas de tu equipo." }],
                    grade: "—",
                    summary: "Esperando datos del equipo..."
                };
            }
            const alerts = [];
            const criticalWeakTypes = matrix.filter(m => m.status === "critical_danger");
            const strongResistTypes = matrix.filter(m => m.status === "fortress");
            const zeroCoverageWeak = matrix.filter(m => m.totalWeak > 0 && m.totalResist === 0);

            if (criticalWeakTypes.length > 0) {
                alerts.push({ type: "danger", icon: "🚨", title: `Debilidad Crítica: ${criticalWeakTypes.map(t => t.nameEs).join(", ")}`, desc: `3 o más Pokémon sufren daño súper efectivo sin resistencias.` });
            }
            if (zeroCoverageWeak.length > 0 && criticalWeakTypes.length === 0) {
                alerts.push({ type: "warning", icon: "⚠️", title: `Sin Resistencia a: ${zeroCoverageWeak.map(t => t.nameEs).slice(0, 3).join(", ")}`, desc: `No tienes Pokémon que resista ataques de estos tipos.` });
            }
            if (strongResistTypes.length > 0) {
                alerts.push({ type: "success", icon: "🛡️", title: `Muro Defensivo contra: ${strongResistTypes.map(t => t.nameEs).slice(0, 3).join(", ")}`, desc: `Excelente combinación de resistencias e inmunidades.` });
            }

            let grade = "A";
            let summary = "¡Un equipo con balance defensivo sobresaliente!";
            const totalDanger = criticalWeakTypes.length * 2 + zeroCoverageWeak.length;
            const totalStrengths = strongResistTypes.length;

            if (totalDanger >= 4) { grade = "C"; summary = "Vulnerabilidades compartidas severas. Considera ajustar la variedad de tipos."; }
            else if (totalDanger >= 2) { grade = "B"; summary = "Buen equipo, con precaución en ciertos tipos clave."; }
            else if (totalStrengths >= 4 && totalDanger === 0) { grade = "S+"; summary = "¡Sinergia defensiva de élite!"; }

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
        // MÉTODOS DE SP Y BOTONES MAX
        // ========================================================
        const modifySp = (stat, amount) => {
            const next = spPoints[stat] + amount;
            if (next < 0 || next > 32) return;
            if (amount > 0 && spUsed.value + amount > 66) return;
            spPoints[stat] = next;
            playSound("click");
        };

        const maxSp = (stat) => {
            const current = spPoints[stat];
            const remaining = 66 - spUsed.value;
            const addable = Math.min(32 - current, remaining);
            if (addable > 0) {
                spPoints[stat] += addable;
                playSound("beep");
            }
        };

        const resetSp = (playSoundEffect = true) => {
            spPoints.hp = spPoints.atk = spPoints.def = spPoints.spa = spPoints.spd = spPoints.spe = 0;
            if (playSoundEffect) playSound("beep");
        };

        // SP Atacante
        const modifyAtkSp = (stat, amount) => {
            const next = attacker.sp[stat] + amount;
            if (next < 0 || next > 32) return;
            if (amount > 0 && atkSpUsed.value + amount > 66) return;
            attacker.sp[stat] = next;
            playSound("click");
        };

        const maxAtkSp = (stat) => {
            const current = attacker.sp[stat];
            const remaining = 66 - atkSpUsed.value;
            const addable = Math.min(32 - current, remaining);
            if (addable > 0) {
                attacker.sp[stat] += addable;
                playSound("beep");
            }
        };

        const resetAtkSp = () => {
            Object.keys(attacker.sp).forEach(k => attacker.sp[k] = 0);
            playSound("beep");
        };

        // SP Defensor
        const modifyDefSp = (stat, amount) => {
            const next = defender.sp[stat] + amount;
            if (next < 0 || next > 32) return;
            if (amount > 0 && defSpUsed.value + amount > 66) return;
            defender.sp[stat] = next;
            playSound("click");
        };

        const maxDefSp = (stat) => {
            const current = defender.sp[stat];
            const remaining = 66 - defSpUsed.value;
            const addable = Math.min(32 - current, remaining);
            if (addable > 0) {
                defender.sp[stat] += addable;
                playSound("beep");
            }
        };

        const resetDefSp = () => {
            Object.keys(defender.sp).forEach(k => defender.sp[k] = 0);
            playSound("beep");
        };

        // ========================================================
        // MÉTODOS DE SELECCIÓN Y 4 SLOTS — BATTLE
        // ========================================================
        const populateAttackerDefaultMoves = (poke) => {
            if (!poke) return;
            const learnset = learnsets.value[poke.name];
            if (!learnset?.moves) {
                attackerMoveSlots.value = ["", "", "", ""];
                attacker.selectedMove = "";
                return;
            }
            // Seleccionar los mejores 4 movimientos con daño
            const damagingMoves = [];
            for (const m of learnset.moves) {
                const md = movesMap.value.get(m.name);
                if (md && md.inChampions && md.power && md.power > 0) {
                    damagingMoves.push(md);
                }
            }
            damagingMoves.sort((a, b) => (b.power || 0) - (a.power || 0));
            const top4 = damagingMoves.slice(0, 4).map(m => m.name);
            while (top4.length < 4) top4.push("");
            attackerMoveSlots.value = top4;
            attacker.selectedMove = top4[0] || "";
        };

        const setAttacker = (poke) => {
            if (!poke) return;
            attacker.pokemon = poke;
            attacker.nature = natures.value[0] || null;
            attacker.ability = Object.values(poke.abilities || {})[0] || "";
            attacker.item = "";
            Object.keys(attacker.sp).forEach(k => attacker.sp[k] = 0);
            attacker.atkBoost = 0;
            populateAttackerDefaultMoves(poke);
            playSound("scan");
        };

        const setDefender = (poke) => {
            if (!poke) return;
            defender.pokemon = poke;
            defender.nature = natures.value[0] || null;
            defender.ability = Object.values(poke.abilities || {})[0] || "";
            defender.item = "";
            Object.keys(defender.sp).forEach(k => defender.sp[k] = 0);
            defender.defBoost = 0;
            playSound("scan");
        };

        const setAttackerMoveSlot = (slotIdx, moveName) => {
            attackerMoveSlots.value[slotIdx] = moveName;
            if (!attacker.selectedMove || attacker.selectedMove === moveName) {
                attacker.selectedMove = moveName;
            }
            playSound("click");
        };

        const selectAttackerNature = (name) => {
            const nat = natures.value.find(n => n.name === name);
            if (nat) { attacker.nature = nat; playSound("click"); }
        };

        const selectDefenderNature = (name) => {
            const nat = natures.value.find(n => n.name === name);
            if (nat) { defender.nature = nat; playSound("click"); }
        };

        // Intercambio COMPLETO de Atacante y Defensor
        const swapBattlePokemon = () => {
            const tmpPoke = attacker.pokemon;
            const tmpNat = attacker.nature;
            const tmpAbility = attacker.ability;
            const tmpItem = attacker.item;
            const tmpSp = { ...attacker.sp };
            const tmpBoost = attacker.atkBoost;

            attacker.pokemon = defender.pokemon;
            attacker.nature = defender.nature;
            attacker.ability = defender.ability;
            attacker.item = defender.item;
            Object.keys(attacker.sp).forEach(k => attacker.sp[k] = defender.sp[k]);
            attacker.atkBoost = defender.defBoost;
            populateAttackerDefaultMoves(defender.pokemon);

            defender.pokemon = tmpPoke;
            defender.nature = tmpNat;
            defender.ability = tmpAbility;
            defender.item = tmpItem;
            Object.keys(defender.sp).forEach(k => defender.sp[k] = tmpSp[k]);
            defender.defBoost = tmpBoost;
            playSound("tab");
        };

        // ========================================================
        // MÉTODOS DE EQUIPO (Pestaña 3)
        // ========================================================
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

        const addCurrentPokemonToTeam = (targetSlot = null) => {
            if (!selectedPokemon.value) return;
            let slotIndex = targetSlot !== null ? targetSlot : teamSlots.value.findIndex(s => !s.pokemonName);
            if (slotIndex === -1) slotIndex = 0;
            setTeamSlotFromPokemon(slotIndex, selectedPokemon.value);
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

                const initialNature = naturesRes.find(n => n.name === "Adamant") || naturesRes[0];
                selectedNature.value = initialNature;

                if (rosterRes.length > 0) {
                    const defaultPoke = rosterRes.find(p => p.name === "Pikachu") || rosterRes[0];
                    selectPokemon(defaultPoke);
                    fillSampleTeam();

                    const firstPoke = rosterRes.find(p => p.name === "Pikachu") || rosterRes[0];
                    const secondPoke = rosterRes.find(p => p.dexNumber !== firstPoke.dexNumber) || rosterRes[1];
                    if (firstPoke) setAttacker(firstPoke);
                    if (secondPoke) setDefender(secondPoke);
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
            NATURE_DICT,
            ABILITY_DICT,
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
            filteredAttackerPokemon,
            filteredDefenderPokemon,
            filteredAttackerItems,
            filteredDefenderItems,
            attackerPokemonSearch,
            defenderPokemonSearch,
            attackerItemSearch,
            defenderItemSearch,
            currentPokemonIndex,
            natures,
            items,
            typesList,
            selectedPokemon,
            selectedNature,
            selectedItem,
            selectedItemInfo,
            selectedMoves,
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
            attackerMoveSlots,
            attackerEquippedMoveObjects,
            attackerAvailableAbilities,
            defenderAvailableAbilities,
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
            // Helpers
            getMoveDisplayName,
            getAbilityDisplayName,
            getAbilityDescription,
            getItemDisplayName,
            getItemDescription,
            getNatureDisplayName,
            getNatureDescription,
            getNatureStatEffect,
            selectPokemon,
            selectNextPokemon,
            selectPrevPokemon,
            modifySp,
            maxSp,
            resetSp,
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
            setAttackerMoveSlot,
            selectAttackerNature,
            selectDefenderNature,
            swapBattlePokemon,
            modifyAtkSp,
            maxAtkSp,
            resetAtkSp,
            modifyDefSp,
            maxDefSp,
            resetDefSp
        };
    }
}).mount("#app");