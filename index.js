const express = require("express");
const { Client, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

const app = express();
const port = 3000;

let qrCodeData = "";
let qrCode = "";

const client = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  },
});

// Promessa para aguardar a inicialização completa do cliente
const clientReadyPromise = new Promise((resolve, reject) => {
  client.on("authenticated", () => {
    console.log("Cliente autenticado!");
    resolve();
  });

  client.on("ready", () => {
    console.log("Cliente está pronto!");
    resolve();
  });

  client.initialize().catch((err) => {
    console.error("Erro ao inicializar cliente:", err);
    reject(err);
  });
});

client.on("qr", (qr) => {
  qrCode = qr;
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.log("Error generating QR Code:", err);
    } else {
      qrCodeData = url;
    }
  });
});

// Aguardar a inicialização do cliente antes de iniciar o servidor
clientReadyPromise.then(() => {
  app.use(express.static("public"));

  app.get("/qrcode", (req, res) => {
    res.send(qrCodeData ? qrCodeData : qrCode);
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Erro ao aguardar a inicialização do cliente:", err);
});
