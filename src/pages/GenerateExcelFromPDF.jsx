import React, { useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";

// Konfigurasi PDFJS
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function GenerateExcelFromPDF() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      fullText += strings.join(" ") + "\n";
    }

    // ekstraksi manual
    const extracted = {
      tanggal: fullText.match(/Tanggal\s*:\s*(\d{2}\/\d{2}\/\d{4})/)?.[1] || "",
      kodeToko: fullText.match(/Kode\s*Toko\s*:\s*(\w+)/)?.[1] || "",
      namaToko: fullText.match(/Nama\s*Toko\s*:\s*(.+)/)?.[1]?.split("No CO")[0]?.trim() || "",
      noCo: fullText.match(/No\s*CO\s*:\s*(\w+)/)?.[1] || "",
      deskripsi: fullText.match(/Deskripsi\s*:\s*(.+)/)?.[1]?.split("Rp")[0]?.trim() || "",
      harga: fullText.match(/Rp\.*\s*([\d.,]+)/)?.[1]?.replaceAll(".", "").replace(",", "") || "0",
    };

    setResult(extracted);

    // Generate Excel
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Tanggal", "Kode Toko", "Nama Toko", "No CO", "Deskripsi", "Harga"],
      [extracted.tanggal, extracted.kodeToko, extracted.namaToko, extracted.noCo, extracted.deskripsi, Number(extracted.harga)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Opname");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `TTF-${extracted.kodeToko || "output"}.xlsx`);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Auto Generate Excel dari TTF (PDF)</h2>
      <input type="file" accept=".pdf" onChange={handleUpload} />
      {loading && <p className="mt-4">⏳ Sedang memproses...</p>}
      {result && !loading && (
        <div className="mt-4 text-sm">
          <p><b>Tanggal:</b> {result.tanggal}</p>
          <p><b>Kode Toko:</b> {result.kodeToko}</p>
          <p><b>Nama Toko:</b> {result.namaToko}</p>
          <p><b>No CO:</b> {result.noCo}</p>
          <p><b>Deskripsi:</b> {result.deskripsi}</p>
          <p><b>Harga:</b> Rp. {Number(result.harga).toLocaleString("id-ID")}</p>
        </div>
      )}
    </div>
  );
}
