                                                                                                          
  
                                                                                                  
                                                                                                         
                                                                                             
                                                                                                
function region(id) {
    const found = document.getElementById(id);
    if (!found)
        throw new Error(`Supplied page is missing #${id}`);
    return found;
}
function show(value) {
    if (Array.isArray(value))
        return value.length === 0 ? "none" : value.map(show).join(", ");
    if (typeof value === "object" && value !== null) {
        const record = value;
        if (typeof record.x === "number" && typeof record.y === "number" && Object.keys(record).length === 2) {
            return `(${record.x},${record.y})`;
        }
        return JSON.stringify(value);
    }
    return String(value);
}
/** Describe a state object: one <dt>/<dd> pair per public field, in the object's own order. */
export function paint(state) {
    const list = region("state");
    const rows = [];
    for (const [name, value] of Object.entries(state)) {
        const term = document.createElement("dt");
        term.textContent = name;
        const detail = document.createElement("dd");
        detail.dataset.field = name;
        detail.textContent = show(value);
        rows.push(term, detail);
    }
    list.replaceChildren(...rows);
    const status = state.status;
    if (typeof status === "string")
        document.body.dataset.status = status;
}
/** Replace the text of one message region: "api", "status", "result" or "telemetry". */
export function text(name, message) {
    region(name).textContent = message;
}
/** Show the current run ID and carry it into the local event view link. */
export function identify(runId) {
    region("run-id").textContent = runId;
    const link = region("event-link");
    if (link instanceof HTMLAnchorElement)
        link.href = `events.html?runId=${encodeURIComponent(runId)}`;
}
//# sourceMappingURL=render.js.map