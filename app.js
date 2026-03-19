const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

let avaliacoes = [];

// HOME
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Ergo & Health</title>
        <style>
          body {
            font-family: Arial;
            padding: 30px;
            background: #f3f4f6;
          }
          .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 400px;
            margin: auto;
            text-align: center;
          }
          button {
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Ergo & Health</h1>
          <p>Avaliação ergonômica</p>

          <select id="metodo">
            <option value="RULA">RULA</option>
            <option value="REBA">REBA</option>
          </select>

          <br><br>

          <button onclick="avaliar()">Avaliar</button>

          <pre id="resultado"></pre>

          <br>

          <button onclick="gerarPDF()">Gerar Laudo</button>
        </div>

        <script>
          async function avaliar() {
            const metodo = document.getElementById("metodo").value;

            const res = await fetch("/avaliacoes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metodo })
            });

            const data = await res.json();

            document.getElementById("resultado").innerText =
              JSON.stringify(data, null, 2);
          }

          function gerarPDF() {
            window.open("/relatorio/0", "_blank");
          }
        </script>
      </body>
    </html>
  `);
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
