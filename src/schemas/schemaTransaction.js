const joi = require("joi");

const schemaTransaction = joi.object({
  descricao: joi.string().required().messages({
    "any.required": "O campo descrição é obrigatório",
    "string.empty": "O campo descrição é obrigatório",
  }),
  valor: joi.number().positive().required().messages({
    "any.required": "O campo valor é obrigatório",
    "string.empty": "O campo valor é obrigatório",
    "number.base": "O campo valor precisa ser do tipo numérico",
    "number.positive": "O valor não pode ser negativo",
  }),
  data: joi.date().max("now").required().messages({
    "any.required": "O campo data é obrigatório",
    "string.empty": "O campo data é obrigatório",
    "date.base": "O campo data precisa conter uma data",
    "date.max": "Informe uma data válida",
  }),
  categoria_id: joi.number().integer().required().messages({
    "any.required": "O campo categoria é obrigatório",
    "string.empty": "O campo categoria é obrigatório",
    "number.base": "O campo categoria precisa ser do tipo numérico",
  }),
  tipo: joi.string().required().messages({
    "any.required": "O campo tipo é obrigatório",
    "string.empty": "O campo tipo é obrigatório",
  }),
});

module.exports = schemaTransaction;
