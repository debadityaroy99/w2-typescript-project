                                                                                              
  
                                                                                        
                                                                                                 
                                                                                                 
                                                                                                 
import { parseConfig } from "./supplied/config.js";
export async function loadConfig() {
    const response = await fetch("/api/ranges/reference");
    if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
    let data;
    try {
        data = await response.json();
    }
    catch {
        throw new Error("malformed");
    }
    return parseConfig("range", data);
}
//# sourceMappingURL=api.js.map