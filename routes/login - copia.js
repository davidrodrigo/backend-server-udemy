var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CADUCIDAD_TOKEN = require('../config/config').CADUCIDAD_TOKEN;

var app = express();

var Usuario = require('../models/usuario');

//Google Sign-In
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
// const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// =====================================================================
// Autenticación Google
// =====================================================================
app.post('/google', async (req, res) => {
    let token = req.body.token;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    }).catch(e => {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido',
            err: e
        });
    })
 
    const googleUser = ticket.getPayload();
 
    /* res.status(200).json({
        ok: true,
        ticket: googleUser,
        email: googleUser.email
    }) */
 
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                // console.log('No existe usuario');
 
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();
            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: CADUCIDAD_TOKEN });
                //var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas
 
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            });
        }
    });
});
 



// =====================================================================
// Autenticación normal
// =====================================================================
app.post('/', (req, res)=>{

	var body = req.body;

	Usuario.findOne({email: body.email}, (err, usuarioDB)=>{

		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar usuario!',
				errors: err
			});
		}

		if(!usuarioDB){
			return res.status(400).json({
				ok: false,
				mensaje: 'Nombre o usuario incorrecto - email',
				errors: err
			});
		}

		if(!bcrypt.compareSync(body.password, usuarioDB.password)){
			return res.status(400).json({
				ok: false,
				mensaje: 'Nombre o usuario incorrecto - password',
				errors: err
			});
		}

		//Crear un token!!!
		usuarioDB.password = ':)';

		var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); //4 Horas

		res.status(200).json({
			ok: true,
			usuario: usuarioDB,
			token: token,
			id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
		});

	});	

});

function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo : 'ProgressBar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'RxJs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Médicos', url: '/medicos' }
          ]
        }
    ];

    if( ROLE === 'ADMIN_ROLE' ){

        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });

    }

    return menu;

}


module.exports = app;