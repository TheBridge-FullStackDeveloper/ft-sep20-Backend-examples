/*
  Implementar la capa de backend (controlador)
  necesaria para servir preguntas y respuestas
  a una aplicación frontend de Q&A
*/

// 1) Importar dependencias
const express = require('express');
const bodyParser = require('body-parser');

// 2) Configuración inicial
const server = express();
const listenPort = 8080;

// Folder with my frontend app
const staticFilesPath = express.static(__dirname + '/public');
server.use(staticFilesPath);

// JSON support
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// -------------- API REST --------------

server.get('/loadImage', (req, res) => {

  // JSON response
  res.send({ src: 'img/atlasV.jpg' });
});

// ...

// -------------- START SERVER --------------

server.listen(listenPort, () => console.log(`Server started listening on ${listenPort}`));
