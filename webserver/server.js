// 1) Load http package
const http = require('http');

// 2) Load listen port
const listenPort = 8888;

// 3) Create http server
const server = http.createServer((request, response) => {
  const headers = {
    'Access-Control-Allow-Origin': '*'
  };
  
  // Home
  if (request.url === "/") {
    response.writeHead(200, headers);
    /*
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/html'
    })
    */;
    response.write('<h1>Welcome to my home</h1>');
  }

  else // Halloween
  if (request.url === "/hw") {
    response.writeHead(200, { ...headers, 'Content-Type': 'text/html' });
    response.write('<h2>Happy Halloween!!!!!</h2>');
  }

  else // getJSON
  if (request.url === "/getJSON") {
    let objeto = { vuelta: 56 };

    response.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    response.write(JSON.stringify(objeto));
  }

  // Not found
  else {
    response.writeHead(200, { ...headers, 'Content-Type': 'text/html' });
    response.write('<h1>Not found</h1>');
  }

  response.end();
});

// 4) Start server
server.listen(listenPort);
console.log(`Server started listening on ${listenPort}`);