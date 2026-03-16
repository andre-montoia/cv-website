const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Load Data
const data = require('./cv-data.json');
const doc = new PDFDocument({ margin: 0, size: 'A4' }); // Zero margin for full control
const stream = fs.createWriteStream(path.join(__dirname, 'CV.pdf'));

doc.pipe(stream);

// --- Configuration ---
const colors = {
  sidebarBg: '#2c3e50',    // Dark Blue-Grey
  sidebarText: '#ecf0f1',  // Light Grey/White
  accent: '#3498db',       // Bright Blue
  mainText: '#333333',     // Dark Grey
  lightText: '#7f8c8d',    // Light Grey
  white: '#ffffff'
};

const layout = {
  sidebarWidth: 230,
  padding: 40,
  mainLeft: 270
};

// --- Helper Functions ---

// Draw Sidebar Background & Content
function drawSidebar() {
  // 1. Background Rectangle
  doc.fillColor(colors.sidebarBg).rect(0, 0, layout.sidebarWidth, doc.page.height);

  let y = layout.padding;
  const leftMargin = 30; // Inside sidebar
  const contentWidth = layout.sidebarWidth - leftMargin - 10;

  // 2. Profile Picture (Optional)
  const imagePath = path.join(__dirname, 'image.png');
  if (fs.existsSync(imagePath)) {
    try {
      // Draw circular mask effect is hard in pure pdfkit, so we draw a square with rounded corners or just square
      // Center it in the sidebar
      const imgSize = 100;
      const imgX = (layout.sidebarWidth - imgSize) / 2;
      doc.image(imagePath, imgX, y, { width: imgSize, height: imgSize });
      y += imgSize + 25;
    } catch (e) {
      console.log('⚠️ Image not found or invalid, skipping...');
      y += 20;
    }
  } else {
    y += 20;
  }

  // Helper for Sidebar Sections
  const drawSection = (title, contentFn) => {
    doc.font('Helvetica-Bold', 12).fillColor(colors.accent).text(title.toUpperCase(), leftMargin, y, { tracking: 1 });
    y += 20;
    contentFn();
    y += 15; // Spacing after section
  };

  // 3. Contact Info
  drawSection('Contact', () => {
    doc.font('Helvetica', 9).fillColor(colors.sidebarText);
    const contacts = [
      `📞 ${data.header.phone}`,
      `✉️ ${data.header.email}`,
      `📍 ${data.header.location}`,
      `🔗 ${data.header.linkedin}`
    ];
    contacts.forEach(line => {
      doc.text(line, leftMargin, y, { width: contentWidth, align: 'left' });
      y += 16;
    });
    y -= 16; // Adjust back
  });

  y += 15;

  // 4. Skills
  drawSection('Skills', () => {
    doc.font('Helvetica', 9).fillColor(colors.sidebarText);
    data.skills.forEach(skill => {
      doc.text(`• ${skill}`, leftMargin, y, { width: contentWidth, align: 'left' });
      y += 16;
    });
    y -= 16;
  });

  y += 15;

  // 5. Education
  drawSection('Education', () => {
    data.education.forEach(edu => {
      doc.font('Helvetica-Bold', 10).fillColor(colors.white).text(edu.institution, leftMargin, y, { width: contentWidth });
      y += 14;
      doc.font('Helvetica', 9).fillColor(colors.sidebarText).text(edu.degree, leftMargin, y, { width: contentWidth });
      y += 14;
      doc.font('Helvetica-Oblique', 8).fillColor(colors.accent).text(edu.period, leftMargin, y, { width: contentWidth });
      y += 10;
    });
    y -= 10;
  });

  y += 15;

  // 6. Certifications
  drawSection('Certifications', () => {
    doc.font('Helvetica', 9).fillColor(colors.sidebarText);
    data.certifications.forEach(cert => {
      doc.text(`• ${cert}`, leftMargin, y, { width: contentWidth, align: 'left' });
      y += 16;
    });
    y -= 16;
  });

  y += 15;

  // 7. Languages
  drawSection('Languages', () => {
    doc.font('Helvetica', 9).fillColor(colors.sidebarText);
    data.languages.forEach(lang => {
      doc.text(`• ${lang}`, leftMargin, y, { width: contentWidth, align: 'left' });
      y += 16;
    });
    y -= 16;
  });
}

// Draw Main Content (Right Side)
function drawMainContent() {
  let y = layout.padding;
  const mainLeft = layout.mainLeft;
  const mainWidth = doc.page.width - mainLeft - layout.padding;

  // 1. Header (Name & Title)
  doc.font('Helvetica-Bold', 26).fillColor(colors.sidebarBg).text(data.header.name.toUpperCase(), mainLeft, y, { width: mainWidth });
  y += 35;
  doc.font('Helvetica', 14).fillColor(colors.accent).text(data.header.title, mainLeft, y, { width: mainWidth });
  y += 45;

  // 2. Profile
  doc.font('Helvetica-Bold', 12).fillColor(colors.sidebarBg).text('PROFILE');
  y = doc.y + 10;
  doc.font('Helvetica', 10).fillColor(colors.mainText).text(data.summary, mainLeft, y, { width: mainWidth, lineHeight: 1.5 });
  y = doc.y + 25;

  // 3. Experience
  doc.font('Helvetica-Bold', 12).fillColor(colors.sidebarBg).text('EXPERIENCE');
  y = doc.y + 10;
  
  data.experience.forEach((job, index) => {
    // Role
    doc.font('Helvetica-Bold', 11).fillColor(colors.mainText).text(job.role, mainLeft, y, { width: mainWidth });
    y += 18;
    
    // Company | Date
    doc.font('Helvetica-Bold', 10).fillColor(colors.accent).text(`${job.company}  |  ${job.period}`, mainLeft, y, { width: mainWidth });
    y += 15;

    // Details
    job.details.forEach(detail => {
      doc.font('Helvetica', 10).fillColor(colors.lightText).text(`• ${detail}`, mainLeft, y, { width: mainWidth, lineHeight: 1.4 });
      y += 16;
    });

    y += 10;
    // Separator Line
    if (index < data.experience.length - 1) {
      doc.moveTo(mainLeft, y).lineTo(mainLeft + mainWidth, y).stroke(colors.lightText, { width: 0.5, opacity: 0.3 });
      y += 15;
    }
  });
}

// --- Execution ---
// 1. Draw Sidebar First (Background)
drawSidebar();

// 2. Draw Main Content (Foreground)
drawMainContent();

doc.end();

stream.on('finish', () => {
  console.log('✅ Modern CV with Sidebar generated successfully.');
});
