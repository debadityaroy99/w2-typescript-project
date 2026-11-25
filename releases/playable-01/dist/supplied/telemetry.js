                                                                  
  
                                                                                                        
                                                                                                   
                                                                                                     
                                                                                                       
  
                                                                                          
                                          
                                                          
export function newRunId() {
    return `run-${crypto.randomUUID().slice(0, 8)}`;
}
export async function recordEvent(event) {
    // Serialising now copies before/after, so later actions cannot rewrite this record.
    const body = JSON.stringify({
        runId: event.runId,
        sequence: event.sequence,
        action: event.action,
        accepted: event.accepted,
        before: event.before,
        after: event.after,
    });
    const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
    if (!response.ok)
        throw new Error(`Local collector rejected the event: HTTP ${response.status}`);
}
//# sourceMappingURL=telemetry.js.map