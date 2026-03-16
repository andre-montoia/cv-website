const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Load data
const data = require('./cv-data.json');
const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream(path.join(__dirname, 'CV.pdf'));

doc.pipe(stream);

// --- Styles ---
const colors = {
  primary: '#2c3e50',
  secondary: '#34495e',
  accent: '#3498db',
  text: '#333333',
  lightText: '#555555'
};

const fonts = {
  normal: 'Helvetica',
  bold: 'Helvetica-Bold'
};

// --- Helpers ---
function drawSection(title) {
  doc.moveDown(0.5);
  doc.font(fonts.bold, 14).fillColor(colors.accent).text(title.toUpperCase());
  doc.moveTo(50, doc.y - 5).lineTo(550, doc.y - 5).stroke(colors.accent);
  doc.moveDown(0.3);
}

function drawList(items, indent = 0) {
  items.forEach(item => {
    doc.font(fonts.normal, 11).fillColor(colors.text).text('• ' + item, { indent: indent });
  });
}

// --- Header ---
doc.font(fonts.bold, 24).fillColor(colors.primary).text(data.header.name, { align: 'center' });
doc.moveDown(0.2);
doc.font(fonts.normal, 14).fillColor(colors.accent).text(data.header.title, { align: 'center' });
doc.moveDown(0.3);
doc.font(fonts.normal, 10).fillColor(colors.lightText).text(
  `${data.header.location} | ${data.header.phone} | ${data.header.email}`, 
  { align: 'center' }
);
doc.text(`${data.header.linkedin} | ${data.header.website}`, { align: 'center' });
doc.moveDown(0.5);

// --- Summary ---
drawSection('Professional Summary');
doc.font(fonts.normal, 11).fillColor(colors.text).text(data.summary);
doc.moveDown(0.3);

// --- Experience ---
drawSection('Professional Experience');
data.experience.forEach(job => {
  doc.font(fonts.bold, 12).fillColor(colors.primary).text(job.role);
  doc.font(fonts.normal, 11).fillColor(colors.secondary).text(`${job.company} | ${job.period} | ${job.location}`);
  doc.moveDown(0.2);
  drawList(job.details, 10);
  doc.moveDown(0.3);
});

// --- Education ---
drawSection('Education');
data.education.forEach(edu => {
  doc.font(fonts.bold, 12).fillColor(colors.primary).text(edu.degree);
  doc.font(fonts.normal, 11).fillColor(colors.secondary).text(`${edu.institution} | ${edu.period}`);
  doc.moveDown(0.1);
  doc.font(fonts.normal, 10).fillColor(colors.text).text(edu.details);
  doc.moveDown(0.3);
});

// --- Skills ---
drawSection('Core Skills');
drawList(data.skills);
doc.moveDown(0.3);

// --- Certifications ---
drawSection('Certifications');
drawList(data.certifications);
doc.moveDown(0.3);

// --- Languages ---
drawSection('Languages');
drawList(data.languages);

// Finalize
doc.end();
stream.on('finish', () => {
  console.log('✅ CV.pdf generated successfully.');
});
