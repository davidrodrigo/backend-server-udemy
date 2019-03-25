var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
 

//======================================
//Verificar Token
//======================================
exports.verificaToken = function(req, res, next){

	var token = req.query.token;

	jwt.verify(token, SEED, (err, decoded)=>{

		if(err){
			return res.status(401).json({
				ok: false,
				mensaje: 'Token no válido',
				errors: err
			});
		}

		req.usuario = decoded.usuario;

		next();
		

	});

}

//======================================
//Verificar Admin
//======================================
exports.verificaADMIN_ROLE = function(req, res, next){

	var usuario = req.usuario;

	if(usuario.role === 'ADMIN_ROLE'){
		
		next();
		return;

	}else{

		return res.status(401).json({
				ok: false,
				mensaje: 'Token no válido - No es administrador',
				errors: {message: 'No es administrador'}
			});


	}

}

//======================================
//Verificar Admin o Mismo USuario
//======================================
exports.verificaADMIN_o_MismoUsuario = function(req, res, next){

	var usuario = req.usuario;
	var id = req.params.id;

	if(usuario.role === 'ADMIN_ROLE' || usuario._id === id){
		
		next();
		return;

	}else{

		return res.status(401).json({
				ok: false,
				mensaje: 'Token no válido - No es administrador ni es el mismo usuario',
				errors: {message: 'No es administrador'}
			});


	}

}