// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();


//Rutas
app.get('/', (req, res, next)=>{
	res.status(200).json({
		ok: true,
		mensaje: 'Petición realizada correctamente'
	});
});

//Conexión a la Base de Datos
mongoose.connection.openUri('mongodb://localhost:19000/hospitalDB', ( err, res )=>{
	if(err) throw err;
	console.log('Base de Datos: \x1b[32m%s\x1b[0m' ,'online');
})

//Escuchar peticiones
app.listen(3000, ()=>{
	console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m' ,'online');
});

