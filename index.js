// index.js

const express = require('express');
const multer = require('multer');
const azure = require('azure-storage');
const fs = require('fs');

const app = express();

// Konfiguroi Azure Blob Storage
const blobService = azure.createBlobService(
  'joni',
  'pVv3GCIahis2GWgRWH4lO0Ihrydnv/3oYByyjHHkFnHXqG8HLztA3prlPUZ+QJnXVc2aiwu5F5/v+AStwu2yeA=='
);

// Määritä multer tiedostojen tallentamiseen
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Tallennetaan tiedostot uploads-kansioon väliaikaisesti
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Palvele etusivu
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Käsittelijä tiedoston lähetykselle
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const blobName = req.file.originalname;

  // Lataa tiedosto Blob Storageen
  blobService.createBlockBlobFromLocalFile(
    'testi',
    blobName,
    filePath,
    (error, result, response) => {
      if (!error) {
        // Poista väliaikainen tiedosto
        fs.unlinkSync(filePath);
        res.send('Tiedosto ladattu onnistuneesti Blob Storageen.');
      } else {
        res.status(500).send('Virhe tiedoston lataamisessa Blob Storageen.');
      }
    }
  );
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
