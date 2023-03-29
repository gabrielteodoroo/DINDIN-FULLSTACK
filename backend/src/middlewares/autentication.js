const jwt = require("jsonwebtoken");
const knex = require("../conection");
const jwtPassword = require("../jwtPassword");

const verifyLogin = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      res.status(401).json({ message: "Não autorizado" });
    }

    const token = authorization.split(" ")[1];

    const { id } = jwt.verify(token, jwtPassword);

    const userExists = await knex("usuarios").where({ id });
    if (!userExists) {
      return res.status(401).json({ mensagem: "Não autorizado." });
    }

    const { senha, ...user } = userExists[0];

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Não autorizado." });
  }
};

module.exports = verifyLogin;
