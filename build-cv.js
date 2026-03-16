const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Load Data
const data = require('./cv-data.json');
const doc = new PDFDocument({ margin: 0, size: 'A4' });
const stream = fs.createWriteStream(path.join(__dirname, 'CV.pdf'));

doc.pipe(stream);

// --- Configuration ---
const colors = {
  primary: '#2c3e50',    // Dark Blue
  secondary: '#34495e',  // Slate
  accent: '#3498db',     // Bright Blue
  text: '#333333',
  lightText: '#7f8c8d',
  sidebarBg: '#f4f6f7',
  white: '#ffffff'
};

const layout = {
  sidebarWidth: 220,
  padding: 40,
  mainLeft: 260
};

// --- Helpers ---
function drawSidebar() {
  // Background
  doc.fillColor(colors.sidebarBg).rect(0, 0, layout.sidebarWidth, doc.page.height);
  
  let y = layout.padding;
  const leftMargin = layout.padding;

  // Contact Info
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('CONTACT', leftMargin, y);
  y += 20;
  doc.font('Helvetica', 10).fillColor(colors.text);
  
  const contactLines = [
    `📞 ${data.header.phone}`,
    `✉️ ${data.header.email}`,
    `📍 ${data.header.location}`,
    `🔗 ${data.header.linkedin}`
  ];
  
  contactLines.forEach(line => {
    doc.text(line, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10, align: 'left' });
    y += 18;
  });

  y += 20;
  
  // Skills
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('SKILLS', leftMargin, y);
  y += 20;
  doc.font('Helvetica', 10).fillColor(colors.text);
  data.skills.forEach(skill => {
    doc.text(`• ${skill}`, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10, align: 'left' });
    y += 18;
  });

  y += 20;

  // Education
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('EDUCATION', leftMargin, y);
  y += 20;
  data.education.forEach(edu => {
    doc.font('Helvetica-Bold', 10).fillColor(colors.secondary).text(edu.institution, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10 });
    y += 14;
    doc.font('Helvetica', 10).fillColor(colors.text).text(edu.degree, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10 });
    y += 14;
    doc.font('Helvetica-Oblique', 9).fillColor(colors.lightText).text(edu.period, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10 });
    y += 20;
  });

  // Certifications
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('CERTIFICATIONS', leftMargin, y);
  y += 20;
  data.certifications.forEach(cert => {
    doc.font('Helvetica', 10).fillColor(colors.text).text(`• ${cert}`, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10 });
    y += 18;
  });

  // Languages
  y += 20;
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('LANGUAGES', leftMargin, y);
  y += 20;
  data.languages.forEach(lang => {
    doc.font('Helvetica', 10).fillColor(colors.text).text(`• ${lang}`, leftMargin, y, { width: layout.sidebarWidth - leftMargin - 10 });
    y += 18;
  });
}

function drawMainContent() {
  let y = layout.padding;
  const mainLeft = layout.mainLeft;
  const mainWidth = doc.page.width - mainLeft - layout.padding;

  // Header (Name & Title)
  doc.font('Helvetica-Bold', 28).fillColor(colors.primary).text(data.header.name.toUpperCase(), mainLeft, y, { width: mainWidth });
  y += 35;
  doc.font('Helvetica', 14).fillColor(colors.accent).text(data.header.title, mainLeft, y, { width: mainWidth });
  y += 40;

  // Summary
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('PROFILE', mainLeft, y);
  y += 20;
  doc.font('Helvetica', 10).fillColor(colors.text).text(data.summary, mainLeft, y, { width: mainWidth, lineGap: 4 });
  y += doc.heightOfString(data.summary, { width: mainWidth }) + 30;

  // Experience
  doc.font('Helvetica-Bold', 12).fillColor(colors.primary).text('EXPERIENCE', mainLeft, y);
  y += 20;

  data.experience.forEach((job, index) => {
    // Role
    doc.font('Helvetica-Bold', 12).fillColor(colors.secondary).text(job.role, mainLeft, y, { width: mainWidth });
    y += 18;
    
    // Company & Date
    doc.font('Helvetica', 10).fillColor(colors.accent).text(`${job.company} | ${job.period}`, mainLeft, y, { width: mainWidth });
    y += 15;

    // Details
    job.details.forEach(detail => {
      doc.font('Helvetica', 10).fillColor(colors.text).text(`• ${detail}`, mainLeft, y, { width: mainWidth, lineGap: 2 });
      y += 16;
    });

    if (index < data.experience.length - 1) {
      y += 15;
      // Separator Line
      doc.moveTo(mainLeft, y - 10).lineTo(mainLeft + mainWidth, y - 10).stroke(colors.sidebarBg);
      y += 10;
    }
  });
}

// --- Execution ---
drawSidebar();
drawMainContent();

doc.end();

stream.on('finish', () => {
  console.log('✅ Modern CV.pdf generated successfully.');
});
