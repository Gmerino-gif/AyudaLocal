import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export let usuarios = [];

async function login(req, res) {
  try {
    const user = req.body.user;
    const password = req.body.password;
    
    if(!user || !password) {
      return res.status(400).send({status:"Error", message:"Los campos están incompletos"});
    }
    
    // Leer usuarios desde el archivo JSON
    const fs = await import('fs/promises');
    const path = await import('path');
    const usuariosPath = path.join(process.cwd(), "app", "data", "usuarios.json");

    try {
      const data = await fs.readFile(usuariosPath, "utf-8");
      usuarios = JSON.parse(data);
    } catch (err) {
      usuarios = [];
    }

    const usuarioARevisar = usuarios.find(usuario => usuario.user === user);
    if(!usuarioARevisar) {
      return res.status(400).send({status:"Error", message:"Error durante login"});
    }
    // const loginCorrecto = await bcryptjs.compare(password, usuarioARevisar.password);
    const loginCorrecto = usuarios.find(usuario => usuario.password === password);
    if(!loginCorrecto) {
      return res.status(400).send({status:"Error", message:"Error durante login"});
    }

    // Preparar datos del usuario para frontend (sin contraseña)
    const usuarioSinPassword = { ...usuarioARevisar };
    delete usuarioSinPassword.password;

    const token = jsonwebtoken.sign(
      {user: usuarioARevisar.user},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRATION || "1h"}
    );

    const cookieOption = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      path: "/"
    };
    
    res.cookie("jwt", token, cookieOption);
    res.send({
      status: "ok",
      message: "Usuario loggeado",
      redirect: "/dashboard.html",
      usuario: usuarioSinPassword
    });
    
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).send({status:"Error", message:"Error interno del servidor durante el login"});
  }
}

async function register(req, res) {
  try {
    const user = req.body.user;
    const password = req.body.password;
    const email = req.body.email;
    
    if(!user || !password || !email) {
      return res.status(400).send({status:"Error", message:"Los campos están incompletos"});
    }
    
    const usuarioARevisar = usuarios.find(usuario => usuario.user === user);
    if(usuarioARevisar) {
      return res.status(400).send({status:"Error", message:"Este usuario ya existe"});
    }
    
    const salt = await bcryptjs.genSalt(5);
    const hashPassword = await bcryptjs.hash(password, salt);
    const nuevoUsuario = {
      user, email, password: hashPassword
    };
    
    usuarios.push(nuevoUsuario);
    return res.status(201).send({status:"ok", message:`Usuario ${nuevoUsuario.user} agregado`, redirect:"/"});
    
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).send({status:"Error", message:"Error interno del servidor durante el registro"});
  }
}

export const methods = {
  login,
  register
};
