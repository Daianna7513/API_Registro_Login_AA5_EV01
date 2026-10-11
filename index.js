
const express = require("express");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

// Conectamos la API con la base de datos MongoDB.
mongoose.connect("mongodb://127.0.0.1:27017/api_registro_login")
    .then(() => {
        console.log("Conexión exitosa con MongoDB");
    })
    .catch((error) => {
        console.error("Error al conectar con MongoDB:", error.message);
    });


// Creamos la aplicación utilizando Express.
const app = express();

// Permitimos que la API reciba información en formato JSON.
app.use(express.json());

// Definimos el puerto donde funcionará el servicio web.
const PORT = 3000;

// Ruta inicial para comprobar que la API funciona.
app.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la API de registro e inicio de sesión"
    });
});


 // Servicio web para registrar nuevos usuarios.
app.post("/registro", async (req, res) => {
    try {
        // Recibimos el usuario y la contraseña enviados a la API.
        const { usuario, contrasena } = req.body;

        // Verificamos que ambos campos sean textos válidos.
        if (
            typeof usuario !== "string" ||
            typeof contrasena !== "string" ||
            usuario.trim().length < 3 ||
            contrasena.length < 8
        ) {
            return res.status(400).json({
                mensaje: "El usuario debe tener mínimo 3 caracteres y la contraseña mínimo 8."
            });
        }

        // Comprobamos que el usuario no esté registrado.
        const existente = await Usuario.findOne({
            usuario: usuario.trim()
        });

        if (existente) {
            return res.status(409).json({
                mensaje: "El usuario ya se encuentra registrado."
            });
        }

        // Protegemos la contraseña mediante un hash.
        const contrasenaProtegida = await bcrypt.hash(contrasena, 10);

        // Guardamos el nuevo usuario en MongoDB.
        const nuevoUsuario = new Usuario({
            usuario: usuario.trim(),
            contrasena: contrasenaProtegida
        });

        await nuevoUsuario.save();

        // Confirmamos que el registro fue exitoso.
        return res.status(201).json({
            mensaje: "Usuario registrado satisfactoriamente."
        });

    } catch (error) {
        // Controlamos errores inesperados del servidor.
        console.error("Error en el registro:", error.message);

        return res.status(500).json({
            mensaje: "Error al registrar el usuario."
        });
    }
});

 // Servicio web para iniciar sesión.
app.post("/login", async (req, res) => {
    try {
        // Recibimos el usuario y la contraseña.
        const { usuario, contrasena } = req.body || {};

        // Validamos que los campos estén completos.
        if (
            typeof usuario !== "string" ||
            typeof contrasena !== "string" ||
            !usuario.trim() ||
            !contrasena
        ) {
            return res.status(400).json({
                mensaje: "Debe ingresar usuario y contraseña."
            });
        }

        // Buscamos el usuario registrado en MongoDB.
        const usuarioEncontrado = await Usuario.findOne({
            usuario: usuario.trim()
        });

        // Si el usuario no existe, rechazamos la autenticación.
        if (!usuarioEncontrado) {
            return res.status(401).json({
                mensaje: "Error en la autenticación."
            });
        }

        // Comparamos la contraseña con el hash almacenado.
        const contrasenaCorrecta = await bcrypt.compare(
            contrasena,
            usuarioEncontrado.contrasena
        );

        // Si la contraseña es incorrecta, devolvemos un error.
        if (!contrasenaCorrecta) {
            return res.status(401).json({
                mensaje: "Error en la autenticación."
            });
        }

        // Confirmamos que la autenticación fue correcta.
        return res.status(200).json({
            mensaje: "Autenticación satisfactoria."
        });

    } catch (error) {
        // Controlamos posibles errores del servidor.
        console.error("Error en el inicio de sesión:", error.message);

        return res.status(500).json({
            mensaje: "Error interno del servidor."
        });
    }
});
// Iniciamos el servidor.
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
