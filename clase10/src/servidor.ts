import express from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//configuracion express
const app = express();
const PORT = 4000;
const DB_PATH = path.join(path.dirname(__filename), "./../db/db.json");
const limiter =rateLimit({
    windowMs: 60_000,  //1 minuto o 60s
    max: 20,
    message: {
        error: "Demasiadas solicitudes HTTP",
        mensaje: "Haz superado el limite esperate un momento para volver a probar"
    },
    statusCode: 429 //codigo http por defecto para muchas peticiones hechas
});

//Middlewares de seguridad 
app.use(helmet());
app.use(express.json()); // para leer JSON'S en los metodos POST
app.use(limiter); //limitar la cantidad de peticiones por minuto


//Funiones para manejar la DB
async function leerDB() {
    try {
        const contenido = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(contenido);
    } catch (error) {
        const inicial = { productos: [] };
        await fs.writeFile(DB_PATH, JSON.stringify(inicial, null, 2), "utf-8");
        return inicial;
    }
}

async function escribirDB(data: any) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

//GET /productos => Listar todos los productos
app.get("/productos", async (req: Request, res: Response) => {
    const db = await leerDB();
    res.json(db.productos);
});

//GET /productos/:id => obtener un producto por su ID
app.get("/productos/:id", async (req: Request, res: Response)=> {
    const db = await leerDB();
    const id = Number(req.params.id);
    const producto = db.productos.find((p: any) => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
});


//POST /productos => Crear un nuevo producto
app.post("/productos", async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "El cuerpo de la solicitud no puede estar vacío"
        });
    }

    const { nombre, precio, stock } = req.body;

    if (typeof nombre !== "string" || nombre.trim().length < 2) {
        return res.status(400).json({
            error: "El nombre debe venir en el cuerpo y tener más de 2 caracteres"
        });
    }

    const precioNumber = Number(precio);
    const stockNumber = Number(stock);

    if (!Number.isFinite(precioNumber) || precioNumber < 0) {
        return res.status(400).json({ error: "El precio debe ser un número válido" });
    }

    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
        return res.status(400).json({ error: "El stock debe ser un número entero válido" });
    }

    const db = await leerDB();


    const nuevoProducto = {
        id: Date.now(),
        nombre: nombre.trim(),
        precio: precioNumber,
        stock: stockNumber,
    };

    db.productos = Array.isArray(db.productos) ? db.productos : [];
    db.productos.push(nuevoProducto);
    await escribirDB(db);

    res.status(201).json(nuevoProducto);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:4000`);
});