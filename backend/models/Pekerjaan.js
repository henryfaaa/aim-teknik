const mongoose = require("mongoose");

const pekerjaanSchema = new mongoose.Schema({
  tanggal: String,
  kodeToko: String,
  namaToko: String,
  noComplain: String,
  deskripsi: String,
  harga: Number,
  status: { type: String, default: "Belum" }, // pencairan
  sudahOpname: { type: Boolean, default: false },
  foto: [String], // array URL base64 atau link
});

module.exports = mongoose.model("Pekerjaan", pekerjaanSchema);
