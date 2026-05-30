import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => {
  console.error("Error:", errData.parserError);
});

pdfParser.on("pdfParser_dataReady", pdfData => {
  console.log("PDF graphics parsed successfully.");
  const page = pdfData.Pages[0];
  
  // page.Fills and page.Lines contain the drawing commands
  console.log(`Number of Fills: ${page.Fills ? page.Fills.length : 0}`);
  console.log(`Number of Lines: ${page.Lines ? page.Lines.length : 0}`);
  
  // Let's analyze the lines and boxes in the area of y=14 to y=19
  // Fills are usually rectangles
  if (page.Fills) {
    const relevantFills = page.Fills
      .filter(f => f.y >= 14 && f.y <= 19)
      .map(f => `Fill: x=${f.x.toFixed(2)}, y=${f.y.toFixed(2)}, w=${f.w.toFixed(2)}, h=${f.h.toFixed(2)}`);
    console.log("=== Fills in y=[14, 19] ===");
    console.log(relevantFills.join('\n'));
  }
  
  if (page.Lines) {
    const relevantLines = page.Lines
      .filter(l => l.y >= 14 && l.y <= 19)
      .map(l => `Line: x=${l.x.toFixed(2)}, y=${l.y.toFixed(2)}, w=${l.w.toFixed(2)}, h=${l.h.toFixed(2)}`);
    console.log("=== Lines in y=[14, 19] ===");
    console.log(relevantLines.slice(0, 20).join('\n'));
  }
});

pdfParser.loadPDF("./frm_guia_servico_1.pdf");
