                                                                                                  
  
                                                                          
                                                                            
                                                                                                  
                                                                                           
                                                                                      
  
                                                                                               
export class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConfigError";
    }
}
                                                                                 
const REFERENCE_BOARD = {
    id: "reference",
    name: "Reference treasure hunt",
    width: 3,
    height: 3,
    start: { x: 0, y: 0 },
    walls: [{ x: 1, y: 1 }],
    treasures: [{ id: "t1", x: 2, y: 0, value: 10 }],
    exit: { x: 2, y: 2 },
    initialMoves: 6,
};
const REFERENCE_RANGE = { id: "reference", name: "Reference target range", ammunition: 2 };
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function field(data, name) {
    if (!(name in data))
        throw new ConfigError(`Game data has the wrong shape: missing "${name}"`);
    return data[name];
}
function text(data, name) {
    const value = field(data, name);
    if (typeof value !== "string")
        throw new ConfigError(`Game data has the wrong shape: "${name}" must be text`);
    return value;
}
function whole(data, name) {
    const value = field(data, name);
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new ConfigError(`Game data has the wrong shape: "${name}" must be a whole number`);
    }
    return value;
}
function point(value, name) {
    if (!isRecord(value))
        throw new ConfigError(`Game data has the wrong shape: "${name}" must be an {x, y} object`);
    return Object.freeze({ x: whole(value, "x"), y: whole(value, "y") });
}
function list(data, name) {
    const value = field(data, name);
    if (!Array.isArray(value))
        throw new ConfigError(`Game data has the wrong shape: "${name}" must be a list`);
    return value;
}
function parseBoard(data) {
    return Object.freeze({
        id: text(data, "id"),
        name: text(data, "name"),
        width: whole(data, "width"),
        height: whole(data, "height"),
        start: point(field(data, "start"), "start"),
        walls: Object.freeze(list(data, "walls").map((w) => point(w, "walls[]"))),
        treasures: Object.freeze(list(data, "treasures").map((t) => {
            if (!isRecord(t))
                throw new ConfigError('Game data has the wrong shape: "treasures[]" must be objects');
            return Object.freeze({ id: text(t, "id"), x: whole(t, "x"), y: whole(t, "y"), value: whole(t, "value") });
        })),
        exit: point(field(data, "exit"), "exit"),
        initialMoves: whole(data, "initialMoves"),
    });
}
function parseRange(data) {
    return Object.freeze({ id: text(data, "id"), name: text(data, "name"), ammunition: whole(data, "ammunition") });
}
                                                                      
function sameJson(a, b) {
    if (Array.isArray(a) && Array.isArray(b))
        return a.length === b.length && a.every((v, i) => sameJson(v, b[i]));
    if (isRecord(a) && isRecord(b)) {
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length && keys.every((k) => k in b && sameJson(a[k], b[k]));
    }
    return a === b;
}
export function parseConfig(genre, data) {
    if (!isRecord(data))
        throw new ConfigError("Game data has the wrong shape: expected a JSON object");
    const parsed = genre === "treasure" ? parseBoard(data) : parseRange(data);
    const reference = genre === "treasure" ? REFERENCE_BOARD : REFERENCE_RANGE;
    if (!sameJson(parsed, reference) || Object.keys(data).length !== Object.keys(reference).length) {
        throw new ConfigError("Unexpected game definition: this package supports only the fixed reference definition");
    }
    return parsed;
}
                                  