const express = require("express");
const {
  registerUser,
  login,
  detailUser,
  updateUser,
  listCategories,
} = require("../controllers/users");
const {
  listTransactions,
  detailTransaction,
  postTransaction,
  updateTransaction,
  deleteTransaction,
  bankStatement,
} = require("../controllers/transactions");
const verifyLogin = require("../middlewares/autentication");
const validateReqBody = require("../middlewares/validateReqBody");
const schemaTransaction = require("../schemas/schemaTransaction");
const schemaUser = require("../schemas/schemaUser");

const router = express();

router.post("/signup", validateReqBody(schemaUser), registerUser);
router.post("/login", login);

router.use(verifyLogin);

router.get("/user", detailUser);
router.put("/user", validateReqBody(schemaUser), updateUser);

router.get("/categories", listCategories);

router.get("/transactions", listTransactions);
router.get("/transactions/:id", detailTransaction);
router.post(
  "/transaction",
  validateReqBody(schemaTransaction),
  postTransaction
);
router.put(
  "/transaction/:id",
  validateReqBody(schemaTransaction),
  updateTransaction
);
router.get("/transaction/bankstatement", bankStatement);
router.delete("/transaction/:id", deleteTransaction);

module.exports = router;
