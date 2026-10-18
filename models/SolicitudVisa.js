
const mongoose = require("mongoose");

// Definimos la estructura de los datos de cada solicitud de visa.
const solicitudVisaSchema = new mongoose.Schema(
  {
    nombreCompleto: {
      type: String,
      required: true,
      trim: true
    },

    correoElectronico: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    tipoVisa: {
      type: String,
      required: true,
      enum: ["Turismo", "Negocios", "Estudios"]
    },

    estado: {
      type: String,
      enum: ["Pendiente", "En revisión", "Aprobada", "Rechazada"],
      default: "Pendiente"
    }
  },
  {
    timestamps: true
  }
);

// Exportamos el modelo para utilizarlo en los servicios web.
module.exports = mongoose.model("SolicitudVisa", solicitudVisaSchema);
