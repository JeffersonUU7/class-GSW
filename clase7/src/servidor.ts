import express, { type Request, type Response } from 'express';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

//mal forma de enviar errores en Typescript
// app.use((error: any, req: Request, res: Response, next: Function) => {
//     res.status(500).send(Error)


const app = express();
const limiter = rateLimit({
            windowMs: 60000,
            max: 20,
            message: {
                error: "Demasiados solicitudes HTTP",
                mensaje: "Haz superado el limite esperate un momento para volver a probar"
            },
            statusCode: 429 //codigo http por defecto para muchas peticiones hechas
        });


app.use(limiter);
app.use(helmet());
//Buena forma de agregar errores en Typescript
app.use((error: Error, req: Request, res: Response, next: Function) => {
    console.error(error) //esto si queda en consola para el tecnico
    res.status(500).json({error: "Ocurrio un error Interno en el servidor"})
});


const PUERTO = 3002;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send("<h1>Contenedor de libre distribución activo" + "(Node.js + Express + TypeScript)</h1>");
});

//RUTA 1 saludo personalizado (GET)
app.get("/saludo", (req: Request, res: Response) => {
    const nombre = typeof req.query.nombre === 'string' ? req.query.nombre : "Desconocido";
    res.send(`<h1>Hola Bienvenido: ${nombre}!</h1>`);
});

// RUTA 1 saludo personalizado con POST
app.post("/saludo", (req: Request, res: Response) => {
    const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre : "Desconocido";
    res.send(`<h1>Hola Bienvenido: ${nombre}!</h1>`);
});

// RUTA 2 /INFO informacion del servidor en el mensaje de la peticion
app.get("/info", (req: Request, res: Response) => {
    res.json({
        fechaServidor: new Date().toISOString(),
        userAgent: req.headers["user-agent"] 
    });
        
    });

    //RUTA 3 calculo =dinamico -- total con IVA (13% El Salvador)
    app.get("/cotizacion", (req: Request, res: Response) => {
        const monto = Number(req.query.monto);

        if (!Number.isFinite(monto) || monto < 0) {
            res.status(400).json({ error: "monto invalido" });
            return;
        }

        const totalConIVA = monto * 1.13;
        res.json({
            montoOriginal: monto,
            iva: monto * 0.13,
            total: totalConIVA
        });
    });

    // RUTA 4 factorial
app.get("/factorial", (req: Request, res: Response) => {
    const n = Number(req.query.n);

    if (!Number.isInteger(n) || n < 0) {
        res.status(400).json({
            error: "El parámetro n debe ser un número entero mayor o igual a 0"
        });
        return;
    }

    let factorial = 1;

    for (let i = 1; i <= n; i++) {
        factorial = factorial * i;
    }

    res.json({
        numero: n,
        factorial: factorial
    });
});

// RUTA 5 temperatura - convierte Celsius a Fahrenheit
app.get("/temperatura", (req: Request, res: Response) => {
    const celsius = Number(req.query.celsius);

    if (!Number.isFinite(celsius)) {
        res.status(400).json({
            error: "El parámetro celsius debe ser un número válido"
        });
        return;
    }

    const fahrenheit = (celsius * 9 / 5) + 32;

    res.json({
        celsius: celsius,
        fahrenheit: fahrenheit
    });
});



const server = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en http://localhost:3002`);
});
