import React, { useState } from "react";
import * as XLSX from "xlsx";

const App = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const downloadConvertedJsonFile = async () => {
    try {
      const json = await convertExcelToJson(file);
      Object.keys(json).forEach((lang) => {
        downloadFile(json[lang], lang.toLowerCase());
      });
    } catch (e) {
      alert(e);
    }
  };

  const convertExcelToJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetNames = workbook.SheetNames;
          const jsonResults = {};

          for (const sheetName of sheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            const langs = Object.keys(rows[0]).slice(1);

            for (let i = 0; i < langs.length; i++) {
              const currentLang = langs[i];
              jsonResults[currentLang] = {};

              for (const row of rows) {
                const key = row["KEY"];
                const value = row[currentLang];
                jsonResults[currentLang][key] = value;
              }
            }
          }
          resolve(jsonResults);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => {
        // 파일 읽기 오류 발생 시 reject
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const downloadFile = (json, fileName) => {
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="text-center">
      <div className="contents">
        <h1>Online I18n Json Maker</h1>
        <h2>Easily convert your sheet to json for i18n.js.</h2>
        <div>
          <a href="/Sample.xlsx" download="Sample.xlsx">
            Download Sample File
          </a>
        </div>
        <div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            id="file-upload"
          />
        </div>
        <div>
          <button onClick={downloadConvertedJsonFile}>
            Donwload JSON File
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
