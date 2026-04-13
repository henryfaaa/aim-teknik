import { useState } from "react";

function UploadTTF() {
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("ttf", file);

    const res = await fetch("http://localhost:5000/api/ttf/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h2>Upload TTF (PDF)</h2>
      <input type="file" accept=".pdf" onChange={handleUpload} />
      {result && (
        <div>
          <p><strong>Jumlah Nomor BA:</strong> {result.jumlahBA}</p>
          <ul>
            {result.nomorBA.map((ba, idx) => (
              <li key={idx}>{ba}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UploadTTF;
