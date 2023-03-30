const knex = require("../conection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtPassword = require("../jwtPassword");

const registerUser = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const validateEmail = await knex("usuarios").where({ email });

    if (validateEmail.length > 0) {
      return res.status(400).json({ message: "O email já existe." });
    }

    const encryptedPassword = await bcrypt.hash(senha, 10);

    const newUser = {
      nome,
      email,
      senha: encryptedPassword,
    };

    const newUserQuery = await knex("usuarios")
      .insert(newUser)
      .returning(["id", "nome", "email"]);

    res.status(201).json(newUserQuery[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail ou senha inválidos" });
    }

    const findUser = await knex("usuarios").where({ email });
    if (findUser.length === 0) {
      return res.status(400).json({ message: "E-mail ou senha inválida." });
    }

    const { senha: userPassword, ...user } = findUser[0];

    const correctPassword = await bcrypt.compare(senha, userPassword);
    if (!correctPassword) {
      return res.status(400).json({ message: "E-mail ou senha inválida." });
    }

    const token = jwt.sign({ id: user.id }, jwtPassword, {
      expiresIn: "8h",
    });

    return res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const detailUser = async (req, res) => {
  try {
    const id = req.user.id;
    const infoUser = await knex("usuarios")
      .where({ id })
      .select("id", "nome", "email");

    if (infoUser.length === 0) {
      return res.status(401).json({
        message:
          "Para acessar este recurso um token de autenticação válido deve ser enviado.",
      });
    }

    return res.status(200).json(infoUser[0]);
  } catch (error) {
    return res.status(500).json({ menssage: "Erro interno do servidor" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const findEmail = await knex("usuarios").where({ email });

    if (findEmail.length > 0) {
      return res.status(400).json({
        message:
          "O e-mail informado já está sendo utilizado por outro usuário.",
      });
    }

    const encryptedPassword = await bcrypt.hash(senha, 10);

    const user = {
      nome,
      email,
      senha: encryptedPassword,
    };

    const update = await knex("usuarios")
      .where({ id: req.user.id })
      .update(user);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const listCategories = async (req, res) => {
  try {
    const categories = await knex("categorias");
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

module.exports = {
  registerUser,
  login,
  detailUser,
  updateUser,
  listCategories,
};
