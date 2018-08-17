const axios = require("axios");
const db = require("../database/dbConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwtKey = require("../_secrets/keys").jwtKey;

const { authenticate } = require("./middlewares");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  // implement user registration

  let { username, password } = req.body;

  password = bcrypt.hashSync(password, 10);

  const token = jwt.sign({ data: username }, jwtKey, { expiresIn: "1h" });

  db("users")
    .insert({ username, password })
    .then(data => res.status(200).json({ token }))
    .catch(err => res.status(200).json(err));
}

function login(req, res) {
  // implement user login

  const { username, password } = req.body;

  db("users")
    .where({ username })
    .select("password")
    .then(data => {
      console.log(data);
      const hash = data[0].password;
      console.log(hash);

      !bcrypt.compareSync(password, hash)
        ? res.status(400).json({ err: "Invalid Credentials" })
        : res.status(200).json({ message: "Login successful!" });
    })
    .catch(err => res.status(400).json(err));
}

function getJokes(req, res) {
  axios
    .get(
      "https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten"
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
