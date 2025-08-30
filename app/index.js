import express from "express";
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { methods as authentication } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./controllers/middlewares/authorization.js";
import fs from 'fs/promises';

// Server
const app = express();
app.set("port", 4000);
app.listen(app.get("port"));
console.log("Servidor corriendo en puerto", app.get("port"));

// Configuración
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser());

// Rutas existentes
app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/index.html"));
app.get("/login.html", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/login.html"));
app.get("/register.html", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/register.html"));
app.get("/admin.html", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/admin.html"));
app.get("/dashboard.html", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/dashboard.html"));
app.get("/formulario-solicitante.html", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/admin/formulario-solicitante.html"));
app.get("/formulario-donante.html", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/admin/formulario-donante.html"));
app.post("/api/login", authentication.login);
//app.post("/api/register", authentication.register);

app.post("/api/register", async (req, res) => {
    const { nombre, user, email, telefono, password, confirmPassword } = req.body;
    if (!nombre || !user || !email || !telefono || !password || !confirmPassword) {
        return res.status(400).json({ status: "Error", message: "Faltan datos" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    const usuariosPath = path.join(__dirname, "data", "usuarios.json");

    // Leer usuarios existentes
    let usuarios = [];
    try {
        const data = await fs.readFile(usuariosPath, "utf-8");
        usuarios = JSON.parse(data);
    } catch (err) {
        usuarios = [];
    }

    // Verificar si el usuario o email ya existe
    const existe = usuarios.some(u => u.user === user || u.email === email);
    if (existe) {
        return res.status(400).json({ status: "Error", message: "Usuario o email ya registrado" });
    }

    // Agregar nuevo usuario con todos los campos
    usuarios.push({ nombre, user, email, telefono, password });

    // Guardar en el archivo
    await fs.writeFile(usuariosPath, JSON.stringify(usuarios, null, 2));

    return res.status(201).json({ status: "Ok", message: "Usuario registrado correctamente", redirect: "/login.html" });
});

// Nuevas rutas para manejo de formularios
app.post("/api/solicitudes", authorization.soloAdmin, async (req, res) => {
    try {
        const nuevaSolicitud = req.body;
        const filePath = path.join(__dirname, 'data', 'solicitudes.json');
        
        // Crear directorio si no existe
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Leer archivo existente o crear uno nuevo
        let solicitudes = [];
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            solicitudes = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
        
        // Agregar fecha y ID
        nuevaSolicitud.fecha = new Date().toISOString();
        nuevaSolicitud.id = Date.now().toString();
        
        // Agregar nueva solicitud
        solicitudes.push(nuevaSolicitud);
        
        // Guardar en archivo
        await fs.writeFile(filePath, JSON.stringify(solicitudes, null, 2));
        
        res.status(201).json({ 
            success: true,
            message: "Solicitud guardada exitosamente",
            id: nuevaSolicitud.id
        });
    } catch (error) {
        console.error("Error al guardar solicitud:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al procesar la solicitud"
        });
    }
});

app.post("/api/donaciones", authorization.soloAdmin, async (req, res) => {
    try {
        const nuevaDonacion = req.body;
        const filePath = path.join(__dirname, 'data', 'donaciones.json');
        
        // Crear directorio si no existe
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Leer archivo existente o crear uno nuevo
        let donaciones = [];
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            donaciones = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
        
        // Agregar fecha y ID
        nuevaDonacion.fecha = new Date().toISOString();
        nuevaDonacion.id = Date.now().toString();
        
        // Agregar nueva donación
        donaciones.push(nuevaDonacion);
        
        // Guardar en archivo
        await fs.writeFile(filePath, JSON.stringify(donaciones, null, 2));
        
        res.status(201).json({ 
            success: true,
            message: "Donación registrada exitosamente",
            id: nuevaDonacion.id
        });
    } catch (error) {
        console.error("Error al registrar donación:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al procesar la donación"
        });
    }
});

// Ruta para obtener solicitudes (opcional)
app.get("/api/solicitudes", authorization.soloAdmin, async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'solicitudes.json');
        const data = await fs.readFile(filePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            res.status(500).json({ error: "Error al leer las solicitudes" });
        }
    }
});

// Ruta para obtener donaciones (opcional)
app.get("/api/donaciones", authorization.soloAdmin, async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'donaciones.json');
        const data = await fs.readFile(filePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            res.status(500).json({ error: "Error al leer las donaciones" });
        }
    }
});



