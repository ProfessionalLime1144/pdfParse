const express = require("express");
const PdfParse = require("pdf-parse");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const app = express();

app.listen(3000 || process.env.PORT, () => {
  console.log(`Connected to port ${process.env.PORT}.`);
});

app.get("/", async (req, res) => {
      // Fetch the PDF file as binary data
    try {
      // const url = "https://ocw.mit.edu/ans7870/9/9.00SC/MIT9_00SCF11_text.pdf";
      const url = "https://pdfco-test-files.s3.us-west-2.amazonaws.com/document-parser/sample-invoice.pdf"
      const response = await fetch(url);
      if (!response.ok) {
        console.log(url);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.arrayBuffer();

      // Convert binary data to text and then embed it
      const parsedData = await PdfParse(data);

      const text = parsedData.text;
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100
      });

      const docs = await splitter.createDocuments([text]);
      let arrayDocs = [];

      for (const doc of docs) {
        arrayDocs.push(doc.pageContent);
      }

      arrayDocs = arrayDocs.slice(0, 1500);
      // res.json({ arrayDocs });
      res.send(JSON.stringify(arrayDocs));
      console.log("Documents Created");
      
    } catch(err) {
      res.send(err);
      console.log(err);
    }
});
