const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const base64 = require("base-64");
const crypto = require("crypto");
const { parse } = require("path");

//Variables globales
// const SECRET = crypto.randomBytes(2048).toString("hex");
const SECRET = "a71055aead06d48b1ac125ce02f49a73";

//Inicialición de express
const PORT = 8080;
const server = express();

//Middlewares
server.use(cors());
server.use(bodyParser.json());
server.use(cookieParser());

//Funciones
function parseBase64(base64String) {
    const parsedString = base64String.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_").toString("base64");
    return parsedString;
}
function encodeBase64(string) {
    const encodedString = base64.encode(string);
    const parsedString = parseBase64(encodedString);
    return parsedString;
}

function decodeBase64(base64String) {
    const decodedString = base64.decode(base64String);
    return decodedString;
}

function hash(string) {
    const hashedString = parseBase64(crypto.createHmac("sha256", SECRET).update(string).digest("base64"));
    return hashedString;
}

function generateJWT(Payload) {
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };
    const base64Header = encodeBase64(JSON.stringify(header));
    const base64Payload = encodeBase64(JSON.stringify(Payload));
    const signature = parseBase64(hash(`${base64Header}.${base64Payload}`));

    const JWT = `${base64Header}.${base64Payload}.${signature}`;
    return JWT;
}

function verifyJWT(jwt) {
    const [header, payload, signature] = jwt.split(".");
    if (header && payload && signature) {
        const expectedSignature = parseBase64(hash(`${header}.${payload}`));
        if (expectedSignature === signature)
            return true;
    }
    console.log("No")
    return false;
}

function getJWTInfo(jwt) {
    const payload = jwt.split(".")[1];
    if (payload) {
        try {
            const data = JSON.parse(decodeBase64(payload));
            return data;
        }
        catch (e) {
            return null;
        }
    }
    return null;
}
//Endpoints
server.get("/jwt", (req, res) => {
    const Payload = {
        "userName": "Miguel",
        "role": 0,
        "ip": req.ip
    };
    const JWT = generateJWT(Payload);
    //CODIFICAR 2 Veces base64
    console.log(JWT);
    res.cookie("jwt", JWT, { "httpOnly": true });
    res.send("Hola Mundo");
});

server.get("/verifyJWT", (req, res) => {
    const jwt = req.cookies.jwt;
    console.log(jwt);
    if (jwt) {
        if (verifyJWT(jwt))
            res.send(getJWTInfo(jwt));
        else {
            res.clearCookie("jwt");
            res.send("Sesión incorrecta");
        }
    }
    else
        res.send("No has iniciado sesión")
})

//Iniciar el servidor
server.listen(PORT, () => console.log("http://localhost:" + PORT));