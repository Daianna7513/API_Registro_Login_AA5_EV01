
const mongoose = require("mongoose");

// Definimos la estructura de los usuarios en la base de datos.
const usuarioSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    contrasena: {
        type: String,
        required: true
    }
});

// Creamos el modelo que permitirá guardar y consultar usuarios.
module.exports = mongoose.model("Usuario", usuarioSchema);
