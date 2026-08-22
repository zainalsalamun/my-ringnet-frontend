export type ExcelColumn = {
  header: string;
  key: string;
  type?: "string" | "number" | "currency";
  width?: number;
};

export type ExcelExportOptions = {
  title?: string;
  filename: string;
  sheetName?: string;
  columns: ExcelColumn[];
  data: Record<string, any>[];
  includeSummaryRow?: boolean;
};

function escapeXml(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateExcelXml({
  title,
  sheetName = "Laporan",
  columns,
  data,
  includeSummaryRow = true,
}: ExcelExportOptions): string {
  const safeData = Array.isArray(data) ? data : [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>MyRingNet</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>PT Ring Media Nusantara</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="sTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="16" ss:Bold="1" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="sSubtitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="sHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sCellString">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="sCellNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#334155"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="sCellCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#334155"/>
   <NumberFormat ss:Format="&quot;Rp &quot;#,##0"/>
  </Style>
  <Style ss:ID="sTotalLabel">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;Rp &quot;#,##0"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table ss:DefaultRowHeight="20">
`;

  columns.forEach((col) => {
    const w = col.width || (col.type === "currency" ? 120 : 150);
    xml += `   <Column ss:AutoFitWidth="0" ss:Width="${w}"/>\n`;
  });

  if (title) {
    xml += `   <Row ss:Height="26">\n`;
    xml += `    <Cell ss:StyleID="sTitle"><Data ss:Type="String">${escapeXml(title)}</Data></Cell>\n`;
    xml += `   </Row>\n`;
    xml += `   <Row ss:Height="18">\n`;
    xml += `    <Cell ss:StyleID="sSubtitle"><Data ss:Type="String">Digenerate pada: ${new Date().toLocaleString("id-ID")}</Data></Cell>\n`;
    xml += `   </Row>\n`;
    xml += `   <Row ss:Height="10"></Row>\n`;
  }

  // Header row
  xml += `   <Row ss:Height="24">\n`;
  columns.forEach((col) => {
    xml += `    <Cell ss:StyleID="sHeader"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Data rows
  safeData.forEach((item) => {
    xml += `   <Row ss:Height="20">\n`;
    columns.forEach((col) => {
      const rawVal = item[col.key];
      if (col.type === "currency" || col.type === "number") {
        const num = Number(rawVal) || 0;
        const style = col.type === "currency" ? "sCellCurrency" : "sCellNumber";
        xml += `    <Cell ss:StyleID="${style}"><Data ss:Type="Number">${num}</Data></Cell>\n`;
      } else {
        xml += `    <Cell ss:StyleID="sCellString"><Data ss:Type="String">${escapeXml(rawVal ?? "-")}</Data></Cell>\n`;
      }
    });
    xml += `   </Row>\n`;
  });

  // Summary Row
  if (includeSummaryRow && safeData.length > 0) {
    xml += `   <Row ss:Height="22">\n`;
    let firstNumericFound = false;

    columns.forEach((col, colIndex) => {
      if (col.type === "currency" || col.type === "number") {
        const sum = safeData.reduce((acc, row) => acc + (Number(row[col.key]) || 0), 0);
        const style = col.type === "currency" ? "sTotalCurrency" : "sTotalLabel";
        xml += `    <Cell ss:StyleID="${style}"><Data ss:Type="Number">${sum}</Data></Cell>\n`;
        firstNumericFound = true;
      } else {
        if (!firstNumericFound && colIndex === 0) {
          xml += `    <Cell ss:StyleID="sTotalLabel"><Data ss:Type="String">TOTAL</Data></Cell>\n`;
        } else {
          xml += `    <Cell ss:StyleID="sTotalLabel"><Data ss:Type="String"></Data></Cell>\n`;
        }
      }
    });
    xml += `   </Row>\n`;
  }

  xml += `  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
   </PageSetup>
   <FitToPage/>
   <Print>
    <ValidPrinterInfo/>
    <PaperSizeIndex>9</PaperSizeIndex>
    <HorizontalResolution>600</HorizontalResolution>
    <VerticalResolution>600</VerticalResolution>
   </Print>
   <Selected/>
   <Panes>
    <Pane>
     <Number>3</Number>
     <ActiveRow>1</ActiveRow>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  return xml;
}

export function downloadExcelFile(options: ExcelExportOptions) {
  const xml = generateExcelXml(options);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = options.filename.endsWith(".xls") ? options.filename : `${options.filename}.xls`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
