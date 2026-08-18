const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../../../M-SCHOLAR_COMPLETE_TECHNICAL_SPECIFICATION.txt");
const dest = path.join(__dirname, "../public/M-SCHOLAR_COMPLETE_TECHNICAL_SPECIFICATION.txt");

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log("Copied technical specification to public/");
