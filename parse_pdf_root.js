import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => {
  console.error("Error:", errData.parserError);
});

pdfParser.on("pdfParser_dataReady", pdfData => {
  console.log("PDF parsed successfully.");
  const page = pdfData.Pages[0];
  const items = page.Texts.map(textObj => {
    const text = decodeURIComponent(textObj.R[0].T);
    return `[x=${textObj.x.toFixed(2)}, y=${textObj.y.toFixed(2)}, w=${textObj.w.toFixed(2)}] ${text}`;
  });
  
  const output = items.join('\n');
  fs.writeFileSync('./extracted_pdf_structure.txt', output);
  console.log("Wrote layout info to extracted_pdf_structure.txt");
});

pdfParser.loadPDF("./frm_guia_servico_1.pdf");
