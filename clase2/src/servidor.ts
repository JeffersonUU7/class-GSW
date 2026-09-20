import * as http from 'http';
import { URL } from 'url';

//router handler == equivalente a un server

function manejarMensaje(nombre: string, mensaje: string): string {
    return `<h1>Hola, ${nombre}!</h1>
    <p>Bienvenido a tu primer contenedor web, ${nombre}!</p>`;
}

//contenedor web: decide que handler se ejecuta dependiendo de la ruta
const servidor = http.createServer((req: any, res: any) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (url.pathname === '/saludo') {
        const nombre = url.searchParams.get('nombre') ?? 'desconocido';
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(manejarMensaje(nombre, ''));
        return;

    }
    if (url.pathname === '/suma') {
        const a = Number(url.searchParams.get('a') ?? 0);
        const b = Number(url.searchParams.get('b') ?? 0);

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`La suma de ${a} y ${b} es: ${a + b}`);
        return;
    }
    

    //NUEVA RUTA /DESPEDIDA

    if (url.pathname === '/despedida') {
        const nombre = url.searchParams.get('nombre') ?? 'amigo';

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Adiós, ${nombre}!</h1>
        <p>Gracias por visitar este servidor web.</p>`);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Página no encontrada');
})

servidor.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});