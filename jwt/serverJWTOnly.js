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

function hash(string, key = SECRET) {
    const hashedString = parseBase64(crypto.createHmac("sha256", key).update(string).digest("base64"));
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

function encryptPassword(string, salt = crypto.randomBytes(128).toString("hex")) {
    let saltedPassword = hash(salt + string + salt, SECRET);
    return { password: saltedPassword, salt };
}

function verifyPassword(string, realPassword) {
    return encryptPassword(string, realPassword.salt).password === realPassword.password;

}

/*
REGISTER -> recibo un correo y una contraseña
ALMACENAMIENTO -> encripto la contraseña y la guardo en la base de datos junto a la sal

VERIFICAR -> Dada una contraseña compararla con su homologa en la DB

*/

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
    res.send({ "msg": "JWT was sent as httpOnly cookie" });
});

server.get("/verifyJWT", (req, res) => {
    const jwt = req.cookies.jwt;
    console.log(jwt);
    if (jwt) {
        if (verifyJWT(jwt))
            res.send(getJWTInfo(jwt));
        else {
            res.clearCookie("jwt");
            res.send({ msg: "invalid session" });
        }
    }
    else
        res.send({ msg: "No session found" })
});

server.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        console.log("password:", encryptPassword(password));
        let JWT = generateJWT({ username, ip: req.ip });
        res.cookie("jwt", JWT, { httpOnly: true });
        res.send({ msg: "User has been saved" });
    }
    else {
        res.send({ msg: "No password was sent" });
    }
})

server.get("/login", (req, res) => {
    const { username, password } = req.body;
    let JWT = req.cookies.jwt;
    //As I don't save the username and password, here is the username. Password: "[123]"
    let realPassword = {
        password: '6crhWD9TbuXbIAMCe3ZWIFlpcd4NeTxW9QgFIItR2TU',
        salt: 'fb156ca6e32b6d986ab6a31f2935d8aed2560d3714f89bc53e1f29738a044d93a9a8a124e5095fffd234fc86bb567264eaa46e5ea9a7ae212f2244df5f23c1743e1e27de7d5a6c9b01056be81db8e27fb6de820e33a2f257bced9ebfad51e6e65d0f6fc5d8414be9ad2887728cf4136b4cde29fdb62571e9e02f9f9ce65e6fde'
    };

    if (JWT) {
        if (verifyJWT(jwt))
            res.send(getJWTInfo(jwt));
        else {
            res.clearCookie("jwt");
            res.send({ msg: "invalid session" });
        }
    }
    else {
        if (verifyPassword(password, realPassword)) {
            res.cookie("jwt", JWT, { "httpOnly": true });
            res.send({ msg: "JWT was sent as httpOnly cookie" });
        }
        else {
            res.send({ msg: "Incorrect username of password" });
        }
    }
})

//Iniciar el servidor
server.listen(PORT, () => console.log("http://localhost:" + PORT));