const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

let avaliacoes = [];

// HOME
app.get("/", (req, res) => {
  res.send("🚀 Ergo & Health ONLINE");
});

// AVALIAÇÃO
app.post("/avaliacoes", (req, res) => {
  const { metodo } = req.body;

  let score = metodo === "RULA" ? 5 : 7;

  let classificacao =
    score >= 6 ? "Risco Alto" : "Risco Médio";

  const avaliacao = {
    metodo,
    score,
    classificacao,
    angulos: {
      braco: 30,
      tronco: 15,
      pescoco: 10
    }
  };

  avaliacoes.push(avaliacao);

  res.json(avaliacao);
});

// PDF
app.get("/relatorio/:id", (req, res) => {
  const a = avaliacoes[req.params.id];

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(16).text("ERGO & HEALTH", { align: "center" });
  doc.moveDown();

  doc.text(`Método: ${a.metodo}`);
  doc.text(`Score: ${a.score}`);
  doc.text(`Classificação: ${a.classificacao}`);

  doc.moveDown();

  doc.text("Ângulos:");
  doc.text(`Braço: ${a.angulos.braco}°`);
  doc.text(`Tronco: ${a.angulos.tronco}°`);
  doc.text(`Pescoço: ${a.angulos.pescoco}°`);

  doc.end();
});

app.listen(3000, () => console.log("Servidor rodando"));
