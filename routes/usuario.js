var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

//======================================
//Obtener todos los Usuarios
//======================================
app.get('/', (req, res, next)=>{
	Usuario.find({ }, 'nombre email img role')
		   .exec(
			 (err, usuarios)=>{
				if(err){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error cargando usarios!',
						errors: err
					});
				}
				res.status(200).json({
					ok: true,
					usuarios: usuarios
				});
			})
});

//======================================
//Crear un nuevo Usuario
//======================================
app.post('/', (req, res)=>{
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: body.password,
		img: body.img,
		role: body.role
	});

	usuario.save( (err, usuarioGuardado)=>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al crear usuario!',
				errors: err
			});
		}
	})

	res.status(200).json({
		ok: true,
		body: body
	});
});

module.exports = app;