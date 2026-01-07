const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { sha3_512 } = require("js-sha3");

const app = express();
app.use(cors());
app.use(express.json());

const PW_HASH = fs.readFileSync("./pw.txt", "utf8").trim();
const ORDERS_FILE = "./orders.json";

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, "[]");
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/panel", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "panel.html"));
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (sha3_512(password) === PW_HASH) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

app.post("/api/order", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));

  orders.push({
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    time: new Date().toLocaleString("id-ID"),
    game: req.body.game,
    username: req.body.username,
    gameId: req.body.gameId,
    server: req.body.server,
    diamond: req.body.diamond,
    harga: req.body.harga,
    metode: req.body.metode,
    email: req.body.email
  });

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.get("/api/orders", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders);
});

app.delete("/api/orders/:id", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  orders.splice(req.params.id, 1);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.listen(80, () => {
  console.log("Server jalan di http://localhost");
});
