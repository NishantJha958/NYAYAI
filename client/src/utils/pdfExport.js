/**
 * Client-side PDF export utility for NYAYA legal drafts.
 * Formats a clean, high-resolution document ready for printing or saving as PDF.
 */
export function exportLegalDraftPdf({
  category = 'General Grievance',
  legalDraft = '',
  simplifiedExplanation = '',
  statutes = [],
  language = 'en',
  date = new Date().toLocaleDateString(),
}) {
  const isHindi = language === 'hi';
  const statutesHtml = (statutes || [])
    .map(
      (s) => `
      <div style="margin-bottom: 12px; padding: 10px 14px; background: #f8fafc; border-left: 4px solid #c9a227; border-radius: 4px;">
        <div style="font-weight: 700; font-size: 14px; color: #0f2744;">
          ${escapeHtml(s.act || '')} — Section ${escapeHtml(s.section || '')}
        </div>
        ${s.title ? `<div style="font-size: 13px; color: #475569; margin-top: 2px;">${escapeHtml(s.title)}</div>` : ''}
        ${s.relevance ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.4;">${escapeHtml(s.relevance)}</div>` : ''}
      </div>
    `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="${isHindi ? 'hi' : 'en'}">
<head>
  <meta charset="utf-8">
  <title>NYAYA Legal Notice — ${escapeHtml(category)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    
    @page {
      margin: 20mm;
      size: A4 portrait;
    }
    
    body {
      font-family: 'Inter', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      font-size: 13px;
    }

    .header {
      border-bottom: 2px solid #0f2744;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f2744;
    }

    .brand span {
      color: #c9a227;
      font-size: 16px;
      margin-left: 6px;
    }

    .meta {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }

    .badge {
      display: inline-block;
      background: #e2e8f0;
      color: #0f2744;
      font-weight: 600;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      margin-top: 4px;
    }

    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #0f2744;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .draft-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 20px;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.7;
      color: #0f172a;
    }

    .simple-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 16px;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.6;
      color: #166534;
      margin-top: 16px;
    }

    .disclaimer {
      margin-top: 36px;
      padding: 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      font-size: 11px;
      color: #991b1b;
      line-height: 1.5;
    }

    .disclaimer strong {
      font-weight: 700;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NYAYA <span>न्याय</span></div>
      <div style="font-size: 12px; color: #64748b;">AI Legal Empowerment Platform for Indian Citizens</div>
    </div>
    <div class="meta">
      <div>Generated: ${escapeHtml(date)}</div>
      <div class="badge">${escapeHtml(category)}</div>
    </div>
  </div>

  <h2>⚖️ ${isHindi ? 'औपचारिक कानूनी नोटिस' : 'Formal Legal Notice'}</h2>
  <div class="draft-box">${escapeHtml(legalDraft)}</div>

  ${
    simplifiedExplanation
      ? `
    <h2>📖 ${isHindi ? 'आसान व्याख्या' : 'Plain Language Summary'}</h2>
    <div class="simple-box">${escapeHtml(simplifiedExplanation)}</div>
  `
      : ''
  }

  ${
    statutes && statutes.length > 0
      ? `
    <h2>📚 ${isHindi ? 'संदर्भित भारतीय कानून एवं धाराएँ' : 'Referenced Indian Statutes'}</h2>
    <div>${statutesHtml}</div>
  `
      : ''
  }

  <div class="disclaimer">
    <strong>${isHindi ? 'महत्वपूर्ण सूचना / अस्वीकरण:' : 'IMPORTANT LEGAL DISCLAIMER:'}</strong>
    ${
      isHindi
        ? 'NYAYA केवल AI-सहायता प्राप्त कानूनी सूचना एवं प्रारूपण सहायता प्रदान करता है। यह किसी अधिकृत अधिवक्ता (Advocate) की सलाह का विकल्प नहीं है। किसी भी न्यायालयीन कार्रवाई या अंतिम निर्णय से पूर्व योग्य अधिवक्ता से परामर्श अवश्य करें।'
        : 'NYAYA provides AI-assisted legal information and drafting support. It is NOT a substitute for advice from a qualified advocate. Always consult a licensed legal professional before filing notices or initiating court proceedings.'
    }
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
