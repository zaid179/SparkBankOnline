const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("nodemon");
//const alert = require('alert');

// db definition
const connection = mysql.createConnection({
  host: "sql6.freemysqlhosting.net",
  user: "sql6506673",
  password: "r7Ch15zIIX",
  database: "sql6506673",
  port: 3306
});

// db connection
connection.connect(function () {
  console.log("MySql connected.....");
});
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//here goes the code

const t = "Transfer Money";
let cust = [];
let email = [];
let cash = [];
let his = [];
let his1 = [];
let his2 = [];

connection.query("SELECT * from Transfers", function (err, result) {
  result.forEach((element) => {
    his.push(element.sender);
    his1.push(element.receiver);
    his2.push(element.cash);
  });
  // console.log(result);
});

connection.query("select * from Customers", function (err, result) {
  if (err) throw err;
  result.forEach((element) => {
    let name = element.name;
    let ema = element.email;
    let balance = element.AccountBalance;
    cust.push(name);
    email.push(ema);
    cash.push(balance);
  });
  // console.log(result);
});

// home page
app.get("/", function (req, res) {
  let sql = "select * from Customers;";
  cust = [];
  email = [];
  cash = [];
  connection.query(sql, function (err, result) {
    if (err) throw err;
    result.forEach((element) => {
      let name = element.name;
      let ema = element.email;
      let balance = element.AccountBalance;
      cust.push(name);
      email.push(ema);
      cash.push(balance);
    });
  });

  res.render("home");
});

app.get("/Reset", function (req, res) {
  connection.query("UPDATE Customers SET AccountBalance=1000");
  res.redirect("/");
});

//view all customers page get
app.get("/viewall", function (req, res) {
  res.render("viewall", { name: cust, mail: email, bal: cash });
});

// transfer page get and post
app.get("/transfer", function (req, res) {
  res.render("transfer", { transfer: t });
});

app.post("/transfer", function (req, res) {
  let sender = req.body.sender;
  let receiver = req.body.receiver;
  let amount = Number(req.body.amount);
  let ssql = "select * from Customers where name = " + '"' + sender + '"';
  let sbalance = 0;
  connection.query(ssql, function (err, result) {
    result.forEach((element) => {
      if (sender === element.name) {
        let cur = Number(element.AccountBalance);
        sbalance = Number(cur - amount);
        console.log(cur);
        console.log(sbalance);
      }
    });
  });

  let rsql = "select * from Customers where name = ?";
  let rbalance = 0;
  connection.query(rsql, [receiver], function (err, result) {
    result.forEach((element) => {
      if (receiver === element.name) {
        let cur = Number(element.AccountBalance);
        rbalance = amount + cur;
        console.log(cur);
        console.log(rbalance);
      }
    });
  });
  //just update sbalance and rbalance tomorrow
  setTimeout(() => {
    let upcust1 = "update Customers set AccountBalance = ? where name = ?";
    connection.query(upcust1, [sbalance, sender], function (
      err,
      result,
      fields
    ) {
      if (err) throw err;
      console.log("sender balance updated");
    });

    let upcust2 = `update Customers set AccountBalance = ? where name = ?`;
    connection.query(upcust2, [rbalance, receiver], function (
      err,
      result,
      fields
    ) {
      if (err) throw err;
      console.log("receiver balance updated");
    });
    // his.push(sender);
    // his1.push(receiver);
    // his2.push(amount);
  }, 3000);

  setTimeout(() => {
    let trans = "insert into Transfers values(?,?,?)";
    connection.query(trans, [sender, receiver, amount], function (err, result) {
      if (err) throw err;
      console.log("transferred succesfully");
    });
  }, 3000);
  setTimeout(() => {
    his = [];
    his1 = [];
    his2 = [];

    connection.query("select * from Transfers", function (err, result) {
      result.forEach((element) => {
        his.push(element.sender);
        his1.push(element.receiver);
        his2.push(element.cash);
      });
    });
  }, 4000);

  console.log(sender);
  console.log(receiver);
  console.log(amount);
  res.redirect("/transfer");
});

// history display
app.get("/history", function (req, res) {
  setTimeout(() => {
    res.render("history", { sen: his, rec: his1, amo: his2 });
  }, 2000);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started:3000");
});

// let tb = 'delete from Transfers where cash = ?';
// let ca = 15;
// connection.connect()
// connection.query(tb,[ca], function(err,res) {
//     if (err) throw err;
//     console.log("done");
// })
