const knex = require("../conection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtPassword = require("../jwtPassword");
const { valid } = require("joi");

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
    console.log(error);
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
    res.status(500).json({ message: "Erro interno do servidor." });
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

const listTransactions = async (req, res) => {
  try {
    const transactions = await knex("transacoes").where({
      usuario_id: req.user.id,
    });
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const detailTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const validTransaction = await knex("transacoes")
      .where({
        id,
        usuario_id: req.user.id,
      })
      .returning("*");

    if (validTransaction.length === 0) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    return res.status(200).json(validTransaction[0]);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const postTransaction = async (req, res) => {
  try {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    const findCategorie = await knex("categorias").where({ id: categoria_id });

    if (findCategorie.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res
        .status(400)
        .json({ message: "O campo tipo só pode ser entrada ou saída" });
    }

    const transaction = {
      descricao,
      valor,
      data,
      categoria_id,
      tipo,
      usuario_id: req.user.id,
    };

    const newTransaction = await knex("transacoes")
      .insert(transaction)
      .returning("*");

    return res.status(201).json(newTransaction[0]);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    const validTransaction = await knex("transacoes").where({
      id,
      usuario_id: req.user.id,
    });

    if (validTransaction.length === 0) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    const findCategorie = await knex("categorias").where({ id: categoria_id });

    if (findCategorie.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res
        .status(400)
        .json({ message: "O campo tipo só pode ser entrada ou saída" });
    }

    const updatedTransaction = {
      descricao,
      valor,
      data,
      categoria_id,
      tipo,
      usuario_id: req.user.id,
    };

    const update = await knex("transacoes")
      .where({ id })
      .update(updatedTransaction)
      .returning("*");

    return res.status(201).json(update[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const validTransaction = await knex("transacoes").where({
    id,
    usuario_id: req.user.id,
  });

  if (validTransaction.length === 0) {
    return res.status(404).json({ message: "Transação não encontrada" });
  }

  const deleteTransaction = await knex("transacoes").where({ id }).del();

  return res.status(200).json();
};

module.exports = {
  registerUser,
  login,
  detailUser,
  updateUser,
  listCategories,
  listTransactions,
  detailTransaction,
  postTransaction,
  updateTransaction,
  deleteTransaction,
};
