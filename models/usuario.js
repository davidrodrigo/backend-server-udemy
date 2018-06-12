var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usuarioSchema  = new Schema({
	nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
	email: { type: String, unique:true, required: [true, 'El email es obligatorio'] },
	password: { type: String, required: false },
	img: { type: String, required: [true, 'El nombre es obligatorio'] },
	role: { type: String, required: true, default: 'USER_ROLE' }
});

module.exports = mongoose.model('usuario', usuarioSchema);