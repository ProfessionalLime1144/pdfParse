const express = require("express");
const PdfParse = require("pdf-parse");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const app = express();

app.listen(3000 || process.env.PORT, () => {
  console.log(`Connected to port ${process.env.PORT}.`);
});

app.get("/", async (req, res) => {
  console.log("Creating Documents...");
  let url = req.get("url") || "https://mag.wcoomd.org/uploads/2018/05/blank.pdf";
  if (!url.startsWith("https:")) {
    url = "https:" + url;
  };
  try {
    // Fetch the PDF file as binary data
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(url);
      res.json({ error: `HTTP error! Status: ${response.status}` });
    };
    const data = await response.arrayBuffer();

    // Convert binary data to text and then embed it
    const parsedData = await PdfParse(data);
    
    const text = parsedData.text;
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100
    });

    const docs = await splitter.createDocuments([text]);
    let arrayDocs = [];

    // Replace double to single quotes
    for (const doc of docs) {
      arrayDocs.push(doc.pageContent.replace(/[“„”]/g, "'"));
    };
    
    arrayDocs = arrayDocs.slice(0, 1500);
    
    // Replace double to single quotes
    arrayDocs = arrayDocs.map(index => index.replace(/"/g, "'"));
    res.json(arrayDocs);
    
    console.log("Documents Created.");
    
  } catch(err) {
    res.json({ error: err });
    console.log(err);
  };
});
