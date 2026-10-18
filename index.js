
const express = require("express");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
const SolicitudVisa = require("./models/SolicitudVisa");

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
// Servicio web para registrar solicitudes de visa.
app.post("/solicitudes", async (req, res) => {
    try {
        const { nombreCompleto, correoElectronico, tipoVisa } = req.body || {};

        // Verificamos que todos los campos estén completos.
        if (
            typeof nombreCompleto !== "string" ||
            typeof correoElectronico !== "string" ||
            typeof tipoVisa !== "string" ||
            !nombreCompleto.trim() ||
            !correoElectronico.trim() ||
            !tipoVisa.trim()
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios."
            });
        }

        // Guardamos la solicitud en MongoDB.
        const nuevaSolicitud = new SolicitudVisa({
            nombreCompleto: nombreCompleto.trim(),
            correoElectronico: correoElectronico.trim(),
            tipoVisa
        });

        await nuevaSolicitud.save();

        return res.status(201).json({
            mensaje: "Solicitud de visa registrada satisfactoriamente.",
            solicitud: nuevaSolicitud
        });

    } catch (error) {
        console.error("Error al registrar la solicitud:", error.message);

        return res.status(500).json({
            mensaje: "Error al registrar la solicitud de visa."
        });
    }
});
// Servicio web para consultar todas las solicitudes de visa.
app.get("/solicitudes", async (req, res) => {
    try {
        // Consultamos las solicitudes almacenadas en MongoDB.
        const solicitudes = await SolicitudVisa.find();

        return res.status(200).json({
            mensaje: "Solicitudes consultadas satisfactoriamente.",
            total: solicitudes.length,
            solicitudes: solicitudes
        });

    } catch (error) {
        console.error("Error al consultar las solicitudes:", error.message);

        return res.status(500).json({
            mensaje: "Error al consultar las solicitudes de visa."
        });
    }
});


// Servicio para consultar una solicitud de visa por su ID.
app.get("/solicitudes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Verificamos que el ID tenga un formato válido.
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: "El identificador de la solicitud no es válido."
            });
        }

        // Buscamos la solicitud en MongoDB.
        const solicitud = await SolicitudVisa.findById(id);

        if (!solicitud) {
            return res.status(404).json({
                mensaje: "No se encontró la solicitud de visa."
            });
        }

        return res.status(200).json({
            mensaje: "Solicitud consultada satisfactoriamente.",
            solicitud: solicitud
        });

    } catch (error) {
        console.error("Error al consultar la solicitud:", error.message);

        return res.status(500).json({
            mensaje: "Error interno al consultar la solicitud."
        });
    }
});
// Servicio web para actualizar una solicitud de visa por su ID.
app.put("/solicitudes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCompleto, correoElectronico, tipoVisa, estado } = req.body || {};

        // Verificamos que el identificador sea válido.
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: "El identificador de la solicitud no es válido."
            });
        }

        // Validamos los datos recibidos.
        if (
            typeof nombreCompleto !== "string" ||
            !nombreCompleto.trim() ||
            typeof correoElectronico !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico.trim()) ||
            !["Turismo", "Negocios", "Estudios"].includes(tipoVisa) ||
            !["Pendiente", "En revisión", "Aprobada", "Rechazada"].includes(estado)
        ) {
            return res.status(400).json({
                mensaje: "Los datos de la solicitud no son válidos o están incompletos."
            });
        }

        // Actualizamos la información en MongoDB.
        const solicitudActualizada = await SolicitudVisa.findByIdAndUpdate(
            id,
            {
                nombreCompleto: nombreCompleto.trim(),
                correoElectronico: correoElectronico.trim().toLowerCase(),
                tipoVisa,
                estado
            },
            { new: true, runValidators: true }
        );

        if (!solicitudActualizada) {
            return res.status(404).json({
                mensaje: "No se encontró la solicitud de visa."
            });
        }

        return res.status(200).json({
            mensaje: "Solicitud de visa actualizada satisfactoriamente.",
            solicitud: solicitudActualizada
        });

    } catch (error) {
        console.error("Error al actualizar la solicitud:", error.message);

        return res.status(500).json({
            mensaje: "Error al actualizar la solicitud de visa."
        });
    }
});
// Servicio web para eliminar una solicitud de visa por su ID.
app.delete("/solicitudes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Verificamos que el identificador sea válido.
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: "El identificador de la solicitud no es válido."
            });
        }

        // Buscamos y eliminamos la solicitud de MongoDB.
        const solicitudEliminada = await SolicitudVisa.findByIdAndDelete(id);

        // Verificamos si la solicitud existía.
        if (!solicitudEliminada) {
            return res.status(404).json({
                mensaje: "No se encontró la solicitud de visa."
            });
        }

        // Confirmamos que la solicitud fue eliminada.
        return res.status(200).json({
            mensaje: "Solicitud de visa eliminada satisfactoriamente.",
            solicitud: solicitudEliminada
        });

    } catch (error) {
        console.error("Error al eliminar la solicitud:", error.message);

        return res.status(500).json({
            mensaje: "Error al eliminar la solicitud de visa."
        });
    }
});
// Iniciamos el servidor.
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
