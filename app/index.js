
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
// API para obtener el conteo de tipos de ayuda para el dashboard
app.get("/api/tipos_ayuda_conteo", authorization.soloAdmin, async (req, res) => {
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const solicitantesPath = path.join(process.cwd(), "app", "data", "solicitantes.json");
        let solicitantes = [];
        try {
            const data = await fs.readFile(solicitantesPath, "utf-8");
            solicitantes = JSON.parse(data);
        } catch (err) {
            solicitantes = [];
        }
        // Contar cada tipo de ayuda
        const conteo = {};
        solicitantes.forEach(s => {
            const tipo = s.tipo_ayuda || "Otro";
            conteo[tipo] = (conteo[tipo] || 0) + 1;
        });
        return res.json(conteo);
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Error al cargar los tipos de ayuda" });
    }
});
// API para obtener el total de usuarios con rol donante
app.get("/api/usuarios_donantes", authorization.soloAdmin, async (req, res) => {
    try {
        const usuariosPath = path.join(__dirname, "data", "usuarios.json");
        let usuarios = [];
        try {
            const data = await fs.readFile(usuariosPath, "utf-8");
            usuarios = JSON.parse(data);
        } catch (err) {
            usuarios = [];
        }
        const total = usuarios.filter(u => u.rol === "donante").length;
        return res.json({ total });
    } catch (error) {
        return res.status(500).json({ error: "No se pudo obtener el total de voluntarios" });
    }
});
app.get("/admin.html", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/admin.html"));
app.get("/dashboard.html", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/dashboard.html"));
app.get("/formulario-solicitante.html", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/formulario-solicitante.html"));
app.get("/formulario-donante.html", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/formulario-donante.html"));
app.post("/api/login", authentication.login);
//app.post("/api/register", authentication.register);

// Api que registra un usuario
app.post("/api/register", async (req, res) => {
    
    const { nombre, user, email, telefono, password, rol } = req.body;
    if (!nombre || !user || !email || !telefono || !password || !rol) {
        return res.status(400).json({ status: "Error", message: "Faltan datos" });
    }

    //if (password !== confirmPassword) {
        //return res.status(400).json({ status: "Error", message: "Las contraseñas no coinciden" });
   // }

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
    usuarios.push({ nombre, user, email, telefono, password, rol });

    // Guardar en el archivo
    await fs.writeFile(usuariosPath, JSON.stringify(usuarios, null, 2));

    return res.status(201).json({ status: "Ok", message: "Usuario registrado correctamente", redirect: "/login.html" });
});

// API para obtener el total de solicitudes
app.get("/api/total_solicitudes", authorization.soloAdmin, async (req, res) => {
    try {
        // const solicitudesPath = path.join(__dirname, "data", "solicitudes.json");
        const solicitudesPath = path.join(process.cwd(), "app", "data", "solicitantes.json");
        let solicitudes = [];
        try {
            const data = await fs.readFile(solicitudesPath, "utf-8");
            solicitudes = JSON.parse(data);
        } catch (err) {
            solicitudes = [];
        }
        return res.json({ total: solicitudes.length });
    } catch (error) {
        return res.status(500).json({ error: "No se pudo obtener el total de solicitudes" });
    }
});

// Ruta para obtener cantidad donaciones (opcional)
app.get("/api/total_donaciones", authorization.soloAdmin, async (req, res) => {
    try {
        // const solicitudesPath = path.join(__dirname, "data", "solicitudes.json");
        const donantesPath = path.join(process.cwd(), "app", "data", "donantes.json");
        let donantes = [];
        try {
            const data = await fs.readFile(donantesPath, "utf-8");
            donantes = JSON.parse(data);
        } catch (err) {
            donantes = [];
        }
        return res.json({ total: donantes.length });
    } catch (error) {
        return res.status(500).json({ error: "No se pudo obtener el total de donantes" });
    }
});

// API para registrar solicitantes
app.post("/api/solicitantes", authorization.soloAdmin, async (req, res) => {
    try {
        const { cedula, nombre, telefono, email, tipo_ayuda, descripcion, direccion, urgente } = req.body;

        if (!cedula || !nombre || !telefono || !email || !tipo_ayuda || !descripcion || !direccion ) {
            return res.status(400).json({ status: "Error", message: "Faltan datos" });
        }
        const fs = await import('fs/promises');
        const path = await import('path');
        const solicitantesPath = path.join(process.cwd(), "app", "data", "solicitantes.json");
        let solicitantes = [];
        try {
            const data = await fs.readFile(solicitantesPath, "utf-8");
            solicitantes = JSON.parse(data);
        } catch (err) {
            solicitantes = [];
        }

    // Estad de la solicitud se inicia en pendiente
    const estado = "pendiente";
    // Agregar nuevo solicitante con fecha de creación
    const fecha_creacion = new Date().toISOString().replace('T', ' ').substring(0, 19);
    solicitantes.push({ cedula, nombre, telefono, email, tipo_ayuda, descripcion, direccion, urgente, estado, fecha_creacion });
        await fs.writeFile(solicitantesPath, JSON.stringify(solicitantes, null, 2));
        return res.status(201).json({ status: "Ok", message: "Solicitante registrado correctamente", redirect: "/dashboard.html" });
    } catch (error) {
        console.error("Error en registro de solicitante:", error);
        return res.status(500).json({ status: "Error", message: "Error interno del servidor durante el registro" });
    }
});

// API para registrar donaciones
app.post("/api/donantes", authorization.soloAdmin, async (req, res) => {
    try {
        const { cedula, nombre, telefono, email, tipo_donacion, cantidad, disponibilidad, contactar } = req.body;

        if (!cedula || !nombre || !telefono || !email || !tipo_donacion || !cantidad || !disponibilidad ) {
            return res.status(400).json({ status: "Error", message: "Faltan datos" });
        }
        const fs = await import('fs/promises');
        const path = await import('path');
        const donantesPath = path.join(process.cwd(), "app", "data", "donantes.json");
        let donantes = [];
        try {
            const data = await fs.readFile(donantesPath, "utf-8");
            donantes = JSON.parse(data);
        } catch (err) {
            donantes = [];
        }

    // Agregar nuevo donante con fecha de creación
    const fecha_creacion = new Date().toISOString().replace('T', ' ').substring(0, 19);
    donantes.push({ cedula, nombre, telefono, email, tipo_donacion, cantidad, disponibilidad, contactar, fecha_creacion });
        await fs.writeFile(donantesPath, JSON.stringify(donantes, null, 2));
        return res.status(201).json({ status: "Ok", message: "Donación registrada correctamente", redirect: "/dashboard.html" });
    } catch (error) {
        console.error("Error en registro de donante:", error);
        return res.status(500).json({ status: "Error", message: "Error interno del servidor durante el registro" });
    }
});

// API para obtener las solicitudes recientes para el dashboard
app.get("/api/solicitantes_recientes", authorization.soloAdmin, async (req, res) => {
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const solicitantesPath = path.join(process.cwd(), "app", "data", "solicitantes.json");
        let solicitantes = [];
        try {
            const data = await fs.readFile(solicitantesPath, "utf-8");
            solicitantes = JSON.parse(data);
        } catch (err) {
            solicitantes = [];
        }
        // Solo los campos requeridos para el dashboard
        const recientes = solicitantes.map(s => ({
            tipo_ayuda: s.tipo_ayuda,
            descripcion: s.descripcion,
            direccion: s.direccion,
            nombre: s.nombre,
            fecha_creacion: s.fecha_creacion,
            estado: s.estado
        }));
        return res.json(recientes);
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Error al cargar las solicitudes recientes" });
    }
});