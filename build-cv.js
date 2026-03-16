const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Load Data
const data = require('./cv-data.json');
const doc = new PDFDocument({ margin: 50, size: 'A4' });
const stream = fs.createWriteStream(path.join(__dirname, 'CV.pdf'));

doc.pipe(stream);

// --- Configuration ---
const colors = {
  primary: '#2c3e50',    // Dark Slate
  accent: '#2980b9',     // Strong Blue
  text: '#333333',       // Soft Black
  lightText: '#555555'   // Grey
};

// --- Helpers ---
function drawHeader() {
  // Name
  doc.font('Helvetica-Bold', 24).fillColor(colors.primary).text(data.header.name.toUpperCase(), { align: 'center' });
  
  // Title
  doc.moveDown(0.3);
  doc.font('Helvetica', 14).fillColor(colors.accent).text(data.header.title, { align: 'center' });
  
  // Contact Row
  doc.moveDown(0.5);
  doc.font('Helvetica', 10).fillColor(colors.text);
  const contactText = `${data.header.location}  |  ${data.header.phone}  |  ${data.header.email}  |  ${data.header.linkedin}`;
  doc.text(contactText, { align: 'center' });
  
  doc.moveDown(0.8);
  
  // Separator
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(colors.accent);
  doc.moveDown(0.5);
}

function drawSectionTitle(title) {
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text(title, { characterSpacing: 1 });
  doc.moveDown(0.2);
  // Small underline
  const width = doc.widthOfString(title);
  const x = doc.x - width; // Approximate, works for left align
  // Actually, let's just do a full width line for cleaner look
  doc.moveTo(50, doc.y - 5).lineTo(550, doc.y - 5).stroke(colors.lightText, { width: 0.5 });
  doc.moveDown(0.3);
}

function drawList(items, isBullet = true) {
  items.forEach(item => {
    const prefix = isBullet ? '• ' : '';
    doc.font('Helvetica', 10).fillColor(colors.text).text(prefix + item, { lineHeight: 1.4 });
  });
  doc.moveDown(0.2);
}

// --- Build ---

// 1. Header
drawHeader();

// 2. Profile
drawSectionTitle('PROFILE');
doc.font('Helvetica', 10).fillColor(colors.text).text(data.summary, { lineHeight: 1.4 });
doc.moveDown(0.5);

// 3. Skills
drawSectionTitle('SKILLS');
drawList(data.skills);
doc.moveDown(0.3);

// 4. Experience
drawSectionTitle('EXPERIENCE');
data.experience.forEach(job => {
  // Role
  doc.font('Helvetica-Bold', 11).fillColor(colors.primary).text(job.role);
  
  // Company | Period
  doc.font('Helvetica-Bold', 10).fillColor(colors.accent).text(`${job.company}  |  ${job.period}  |  ${job.location}`, { lineHeight: 1.2 });
  
  // Details
  doc.moveDown(0.1);
  job.details.forEach(detail => {
    doc.font('Helvetica', 10).fillColor(colors.text).text('• ' + detail, { lineHeight: 1.4, indent: 10 });
  });
  
  doc.moveDown(0.4);
});

// 5. Education
drawSectionTitle('EDUCATION');
data.education.forEach(edu => {
  doc.font('Helvetica-Bold', 11).fillColor(colors.primary).text(edu.degree);
  doc.font('Helvetica', 10).fillColor(colors.accent).text(`${edu.institution}  |  ${edu.period}`);
  if (edu.details) {
    doc.moveDown(0.1);
    doc.font('Helvetica', 10).fillColor(colors.text).text(edu.details);
  }
  doc.moveDown(0.3);
});

// 6. Certifications
drawSectionTitle('CERTIFICATIONS');
drawList(data.certifications);
doc.moveDown(0.3);

// 7. Languages
drawSectionTitle('LANGUAGES');
drawList(data.languages);

// Finalize
doc.end();

stream.on('finish', () => {
  console.log('✅ CV.pdf generated successfully with clean layout.');
});
