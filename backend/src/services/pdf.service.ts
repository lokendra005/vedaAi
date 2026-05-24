import PDFDocument from 'pdfkit';
import type { QuestionPaper } from '../types/questionPaper.js';

export function generatePdfBuffer(paper: QuestionPaper, meta?: {
  school?: string;
  className?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (meta?.school) {
      doc.fontSize(16).font('Helvetica-Bold').text(meta.school, { align: 'center' });
      doc.moveDown(0.3);
    }

    doc.fontSize(14).font('Helvetica-Bold').text(paper.title, { align: 'center' });
    doc.fontSize(11).font('Helvetica')
      .text(`Subject: ${paper.subject}`, { align: 'center' });
    if (meta?.className) {
      doc.text(`Class: ${meta.className}`, { align: 'center' });
    }
    doc.moveDown(0.5);
    doc.text(`Time Allowed: ${paper.duration}`);
    doc.text(`Maximum Marks: ${paper.totalMarks}`);
    doc.moveDown(0.5);
    doc.text('All questions are compulsory unless stated otherwise.');
    doc.moveDown(0.5);

    doc.text('Name: _____________________________');
    doc.text('Roll Number: ______________________');
    doc.text('Section: __________________________');
    doc.moveDown(1);

    let qNum = 1;
    for (const section of paper.sections) {
      doc.addPage({ margin: 50 });
      doc.fontSize(13).font('Helvetica-Bold').text(section.title);
      doc.fontSize(10).font('Helvetica-Oblique').text(section.instruction);
      doc.moveDown(0.5);

      for (const q of section.questions) {
        const diffLabel = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
        doc.fontSize(11).font('Helvetica-Bold')
          .text(`${qNum}. [${diffLabel}] ${q.question} [${q.marks} Marks]`);
        if (q.options && q.options.length > 0) {
          doc.fontSize(10).font('Helvetica');
          const labels = ['a', 'b', 'c', 'd', 'e', 'f'];
          q.options.forEach((opt, i) => {
            doc.text(`   (${labels[i]}) ${opt}`, { indent: 12 });
          });
        }
        doc.moveDown(0.5);
        qNum++;
      }
      doc.moveDown(0.5);
    }

    doc.fontSize(12).font('Helvetica-Bold').text('— End of Question Paper —', { align: 'center' });
    doc.end();
  });
}
