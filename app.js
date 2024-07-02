const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single('image');

// Configuración de la base de datos
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE images (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT)");
});

// Configuración de Express
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/subir', (req, res) => {
    res.render('subir');
});

app.post('/subir', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send('Error al subir la imagen.');
        } else {
            db.run("INSERT INTO images (filename) VALUES (?)", [req.file.filename], (err) => {
                if (err) {
                    res.send('Error al guardar la imagen en la base de datos.');
                } else {
                    res.redirect('/fotos');
                }
            });
        }
    });
});

app.get('/fotos', (req, res) => {
    db.all("SELECT * FROM images", [], (err, rows) => {
        if (err) {
            res.send('Error al obtener las imágenes.');
        } else {
            res.render('fotos', { images: rows });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
