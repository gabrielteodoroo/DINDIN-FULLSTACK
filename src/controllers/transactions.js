const knex = require("../conection");

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
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const bankStatement = async (req, res) => {
  try {
    const transactions = await knex("transacoes").where({
      usuario_id: req.user.id,
    });
    if (transactions.length < 1) {
      res.status(400).json({ message: "Nenhuma transação encontrada" });
    }

    const entrada = await knex("transacoes").sum("valor").where({
      usuario_id: req.user.id,
      tipo: "entrada",
    });

    const saida = await knex("transacoes").sum("valor").where({
      usuario_id: req.user.id,
      tipo: "saida",
    });

    const userStatement = {
      entrada: parseInt(entrada[0].sum),
      saida: parseInt(saida[0].sum),
    };

    return res.status(200).json(userStatement);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = {
  listTransactions,
  detailTransaction,
  postTransaction,
  updateTransaction,
  deleteTransaction,
  bankStatement,
};
