var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//======================================
//Obtener todos los Usuarios
//======================================
app.get('/', (req, res, next)=>{

	var desde = req.query.desde || 0;
	desde = Number(desde);

	Usuario.find({ }, 'nombre email img role google')
			.skip(desde)
			.limit(5)
		   	.exec(
			 (err, usuarios)=>{
				if(err){
					return res.status(500).json({
						ok: false,
						mensaje: 'Error cargando usarios!',
						errors: err
					});
				}
				Usuario.count({}, (err, conteo)=>{

					res.status(200).json({
						ok: true,
						usuarios: usuarios,
						total: conteo						
					});
				});		
			})
});

//======================================
//Actualizar un nuevo Usuario
//======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res)=>{

	var id = req.params.id;
	var body = req.body;

	Usuario.findById(id, (err, usuario)=>{

		if(err){			
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el Usuario',
				errors: err
			});
		}

		if(!usuario){

			return res.status(400).json({
				ok: false,
				mensaje: 'El usuario con el id: ' + id + ' no existe',
				errors: err
			});

		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save( (err, usuarioGuardado)=>{

			if(err){			
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar el Usuario',
					errors: err
				});
			}

			res.status(200).json({
				ok: true,
				usuario: usuarioGuardado
			});

		});


	});

});



//======================================
//Crear un nuevo Usuario
//======================================
app.post('/', (req, res)=>{
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		img: body.img,
		role: body.role
	});

	usuario.save( (err, usuarioGuardado)=>{
		if(err){
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al crear usuario!',
				errors: err
			});
		}
	
		res.status(201).json({
			ok: true,
			usuario: usuarioGuardado,
			usuarioToken: req.usuario
		});
	});
})

//======================================
//Borrar un Usuario por el ID
//======================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res)=>{

	var id = req.params.id;

	Usuario.findByIdAndRemove(id,(err, usuarioBorrado)=>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al borrar usuario!',
				errors: err
			});
		}

		if(!usuarioBorrado){
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un usuario con ese ID',
				errors: {message: 'No existe un usuario con ese ID'}
			});
		}
	
		res.status(200).json({
			ok: true,
			usuario: usuarioBorrado
		});
	});

})


module.exports = app;