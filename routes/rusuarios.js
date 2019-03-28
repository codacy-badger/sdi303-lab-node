module.exports = function(app, swig, gestorBD) {
    app.get("/usuarios", function(req, res) {
        var respuesta = "";
        if (req.query.nombre != null)
            respuesta += 'Nombre: ' + req.query.nombre + '<br>';
        if (typeof (req.query.autor) != "undefined")
            respuesta += 'Autor: ' + req.query.autor;
    });
};