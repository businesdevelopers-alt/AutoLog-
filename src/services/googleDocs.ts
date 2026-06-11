export interface DocsExportData {
  title: string;
  startDate: string;
  endDate: string;
  vehicleName: string;
  totalOps: number;
  totalSpent: number;
  dailyAvg: string;
  rows: Array<{
    vehicle: string;
    date: string;
    type: string;
    details: string;
    amount: number;
  }>;
}

export const createAndExportToDocs = async (
  accessToken: string,
  exportData: DocsExportData
): Promise<{ documentId: string; documentUrl: string }> => {
  // 1. Create a blank document
  const title = `${exportData.title} - (${exportData.startDate} - ${exportData.endDate})`;
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Doc');
  }

  const document = await createRes.json();
  const documentId = document.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // 2. Build our structured text and track chunk styling ranges
  const chunks: Array<{
    text: string;
    style: 'title' | 'subtitle' | 'section' | 'item_title' | 'item_body' | 'normal';
  }> = [];

  chunks.push({
    text: "أوتو كير - تقرير الصيانة والمصاريف التفصيلي للسيارات\n\n",
    style: 'title'
  });

  chunks.push({
    text: `📅 الفترة: من ${exportData.startDate} إلى ${exportData.endDate}\n` +
          `🚗 السيارة المحددة: ${exportData.vehicleName}\n` +
          `✍️ تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n\n`,
    style: 'subtitle'
  });

  chunks.push({
    text: "==================================================\n\n",
    style: 'normal'
  });

  chunks.push({
    text: "📊 ملخص التقرير المالي والعمليات\n\n",
    style: 'section'
  });

  chunks.push({
    text: `  • عدد العمليات المسجلة: ${exportData.totalOps} عمليات مفعّلة\n` +
          `  • إجمالي النفقات والمصاريف: ${exportData.totalSpent.toLocaleString('ar-SA')} ر.س\n` +
          `  • متوسط الاستهلاك اليومي: ${exportData.dailyAvg} ر.س / يوم\n\n`,
    style: 'normal'
  });

  chunks.push({
    text: "==================================================\n\n",
    style: 'normal'
  });

  chunks.push({
    text: "🚗 سجل العمليات والتقارير التفصيلية\n\n",
    style: 'section'
  });

  if (exportData.rows.length === 0) {
    chunks.push({
      text: "  لا توجد عمليات مسجلة متوافقة مع شروط التصفية المحددة.\n\n",
      style: 'normal'
    });
  } else {
    exportData.rows.forEach((row, idx) => {
      chunks.push({
        text: `  ${idx + 1}. [${row.date}] ${row.vehicle} — ${row.type}\n`,
        style: 'item_title'
      });
      chunks.push({
        text: `     المبلغ المستهلك: ${row.amount} ر.س\n` +
              `     التفاصيل والبيانات: ${row.details}\n\n`,
        style: 'item_body'
      });
    });
  }

  chunks.push({
    text: "==================================================\n\n" +
          "تم إنشاء وتصدير هذا التقرير تلقائياً بواسطة نظام أوتو كير لإدارة المركبات.\n",
    style: 'subtitle'
  });

  // Combine into a single text body
  let fullText = "";
  const styleRanges: Array<{
    start: number;
    end: number;
    style: 'title' | 'subtitle' | 'section' | 'item_title' | 'item_body' | 'normal';
  }> = [];

  let currentIndex = 1; // Google Docs index starts at 1
  for (const chunk of chunks) {
    const textLen = chunk.text.length;
    if (textLen > 0) {
      styleRanges.push({
        start: currentIndex,
        end: currentIndex + textLen,
        style: chunk.style
      });
      fullText += chunk.text;
      currentIndex += textLen;
    }
  }

  // 3. First request: Insert all the text at index 1
  const insertTextRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: fullText,
            location: { index: 1 }
          }
        }
      ]
    })
  });

  if (!insertTextRes.ok) {
    const err = await insertTextRes.json();
    throw new Error(err.error?.message || 'Failed to insert text into Google Doc');
  }

  // 4. Second request: Apply text styling and paragraph alignment (Arabic RTL Support)
  const formattingRequests: any[] = [];

  // Make the entire document right-to-left (RTL) for Arabic language
  formattingRequests.push({
    updateParagraphStyle: {
      paragraphStyle: {
        direction: 'RIGHT_TO_LEFT'
      },
      fields: 'direction',
      range: {
        startIndex: 1,
        endIndex: currentIndex
      }
    }
  });

  // Apply stylistic overrides based on our chunk types
  for (const range of styleRanges) {
    const textStyle: any = {};
    let fields = "";

    if (range.style === 'title') {
      textStyle.bold = true;
      textStyle.fontSize = { size: 20, unit: 'PT' };
      textStyle.foregroundColor = {
        color: { rgbColor: { red: 0.09, green: 0.54, blue: 0.36 } } // Deep Green
      };
      fields = "bold,fontSize,foregroundColor";
    } else if (range.style === 'subtitle') {
      textStyle.italic = true;
      textStyle.fontSize = { size: 10, unit: 'PT' };
      textStyle.foregroundColor = {
        color: { rgbColor: { red: 0.45, green: 0.46, blue: 0.48 } } // Gray
      };
      fields = "italic,fontSize,foregroundColor";
    } else if (range.style === 'section') {
      textStyle.bold = true;
      textStyle.fontSize = { size: 14, unit: 'PT' };
      textStyle.foregroundColor = {
        color: { rgbColor: { red: 0.20, green: 0.65, blue: 0.40 } } // Main Green
      };
      fields = "bold,fontSize,foregroundColor";
    } else if (range.style === 'item_title') {
      textStyle.bold = true;
      textStyle.fontSize = { size: 11, unit: 'PT' };
      textStyle.foregroundColor = {
        color: { rgbColor: { red: 0.12, green: 0.12, blue: 0.14 } } // Charcoal Dark
      };
      fields = "bold,fontSize,foregroundColor";
    } else if (range.style === 'item_body') {
      textStyle.fontSize = { size: 10, unit: 'PT' };
      textStyle.foregroundColor = {
        color: { rgbColor: { red: 0.35, green: 0.36, blue: 0.38 } } // Slim Gray
      };
      fields = "fontSize,foregroundColor";
    } else if (range.style === 'normal') {
      textStyle.fontSize = { size: 11, unit: 'PT' };
      fields = "fontSize";
    }

    if (fields) {
      formattingRequests.push({
        updateTextStyle: {
          textStyle,
          fields,
          range: {
            startIndex: range.start,
            endIndex: range.end
          }
        }
      });
    }
  }

  // Execute formatting batch update
  const formatRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: formattingRequests
    })
  });

  if (!formatRes.ok) {
    const err = await formatRes.json();
    console.error('Formatting error:', err);
    // Ignore formatting errors so user at least gets the document
  }

  return { documentId, documentUrl };
};
