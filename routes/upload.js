var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next)=>{

	var tipo = req.params.tipo;
	var id = req.params.id;

	//tipos de coleccion
	var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

	if(tiposValidos.indexOf(tipo)<0){
		return res.status(400).json({
			ok:false,
			mensaje: 'Tipo de colección no es válida',
			errors: {message: 'Debe seleccionar una tipo ' + tiposValidos.join(', ')}
		});		
	}


	if(!req.files){
		return res.status(400).json({
			ok:false,
			mensaje: 'No seleccionó ningún archivo',
			errors: {message: 'Debe seleccionar una imagen'}
		});		
	}

	// Obtener nombre del archivo
	var archivo = req.files.imagen;
	var nombreCortado =  archivo.name.split('.');
	var extensionArchivo = nombreCortado[nombreCortado.length - 1];

	// Sólo estas extensiones son aceptadas
	var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if(extensionesValidas.indexOf(extensionArchivo)< 0){
		return res.status(400).json({
			ok:false,
			mensaje: 'La extensión del archivo no es válida',
			errors: {message: 'Debe seleccionar una imagen en formato ' + extensionesValidas.join(', ')}
		});		
	}

	// Nombre de archivo personalizado -> id de usuario y un numero random, por ejemplo: 13854113485454-123.png
	var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`; //Usamos como número random los milisegundos de la fecha, de ahí la función

	//Mover el archivo del temporal a un path
	var path = `./uploads/${tipo}/${nombreArchivo}`;

	archivo.mv(path, err =>{
		if(err){
			return res.status(500).json({
				ok:false,
				mensaje: 'Error al mover archivo',
				errors: err
			});	
		}

		subirPorTipo(tipo, id, nombreArchivo, res);

	})

	
});

function subirPorTipo(tipo, id, nombreArchivo, res){
	if(tipo === 'usuarios'){
		Usuario.findById(id, (err, usuario)=>{

			//Validamos si el id existe
			if(!usuario){
				return res.status(400).json({
					ok: false,
					mensaje: 'Usuario no existe',
					errors: {message: 'Usuario no existe'}
				});
			}

			var pathViejo = 'uploads/usuarios/' + usuario.img;

			// Si existe elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			usuario.img = nombreArchivo;

			usuario.save((err, usuarioActualizado)=>{

				usuarioActualizado.password = ':)';

				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de usuario actualizada',
					usuario: usuarioActualizado
				});

			})

		});
	}

	if(tipo === 'medicos'){
		Medico.findById(id, (err, medico)=>{

			//Validamos si el id existe
			if(!medicoActualizado){
				return res.status(400).json({
					ok: false,
					mensaje: 'Médico no existe',
					errors: {message: 'Médico no existe'}
				});
			}

			var pathViejo = 'uploads/medicos/' + medico.img;

			// Si existe elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			medico.img = nombreArchivo;

			medico.save((err, medicoActualizado)=>{

				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de medico actualizada',
					usuario: medicoActualizado
				});

			})

		});
		
	}

	if(tipo === 'hospitales'){
		Hospital.findById(id, (err, hospital)=>{

			//Validamos si el id existe
			if(!hospital){
				return res.status(400).json({
					ok: false,
					mensaje: 'Hospital no existe',
					errors: {message: 'Hospital no existe'}
				});
			}

			var pathViejo = 'uploads/hospitales/' + hospital.img;

			// Si existe elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			hospital.img = nombreArchivo;

			hospital.save((err, hospitalActualizado)=>{

				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de hospital actualizada',
					usuario: hospitalActualizado
				});

			})

		});
	}
}

module.exports = app;