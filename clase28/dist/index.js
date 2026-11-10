"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function verificarNodo(url) {
    try {
        const respuesta = await fetch(`${url}/health`, {
            signal: AbortSignal.timeout(3000) //3 seg maximo no responde lo da como
        });
        if (!respuesta.ok)
            return { url, saludable: false };
        const detalle = await respuesta.json();
        return { url, saludable: true, detalle };
    }
    catch {
        return { url, saludable: false };
    }
}
async function verificarCluster(nodos) {
    //Promise.all ejecuta todas las verificaciones en paralelo
    const resultados = await Promise.all(nodos.map(verificarNodo));
    for (const r of resultados) {
        //si se cumple la condicion ===>  ? SI: NO;
        const icono = r.saludable ? "SI" : "NO";
        console.log(`[${icono}] ------- ${r.url}`);
    }
    const health = resultados.filter((r) => r.saludable).length;
    console.log(`${health} de ${resultados.length} nodos saludables`);
}
verificarCluster(["https://localhost:9000"]);
//# sourceMappingURL=index.js.map