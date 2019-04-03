// Módulos
var mongo = require('mongodb');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var swig = require('swig');
var app = express();
var crypto = require('crypto');
var expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

var fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        next();
    } else {
        console.log("va a : "+req.session.destino);
        res.redirect("/identificarse");
    }
});
//Aplicar router UsuarioSession
app.use("/canciones/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);
//routerAudios
var routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    var path = require('path');
    var idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones( {
        _id : mongo.ObjectID(idCancion)
    }, function (canciones) {
        if(req.session.usuario && canciones[0].autor == req.session.usuario ){
            next();
        } else {
            res.redirect("/tienda");
        }
    })
});
//Aplicar routerAudios
app.use("/audios/",routerAudios);
// Variables
app.set('port', 8081);
app.set('db',"mongodb://admin:sdi@tiendamusica-shard-00-00-l4it7.mongodb.net:27017,tiendamusica-shard-00-01-l4it7.mongodb.net:27017,tiendamusica-shard-00-02-l4it7.mongodb.net:27017/test?ssl=true&replicaSet=tiendaMusica-shard-0&authSource=admin&retryWrites=true");
app.set('clave','abcdefg');
app.set('crypto',crypto);
//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig, gestorBD); // (app, param1, param2, etc.)

//routerUsuarioAutor
var routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    var path = require('path');
    var id = path.basename(req.originalUrl);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(id) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);
app.get('/', function (req, res) {
    res.redirect('/tienda');
})
// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});