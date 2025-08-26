import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import TableFromJson from '../../components/TableFromJson'
import Swal from 'sweetalert2'
import axios from 'axios'
import * as Utils from "../../lib/Utils";

function ImportTimesheet() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
const removeSpecialChars = (str) =>{
  return str.trim().replaceAll("/", "_").replace(" (Decimal)", "").replaceAll(" ", "_")
}
const handleConvert = () => {
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Use raw: true to preserve number types
      const json = XLSX.utils.sheet_to_json(worksheet, { raw: true });

      // Format only Date objects to readable strings
      const formattedJson = json.map(row =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (value instanceof Date) {
              // Format date to 'YYYY-MM-DD'
              return [removeSpecialChars(key), value.toISOString().split('T')[0]];
            }
            return [removeSpecialChars(key), value]; // Keep numbers and other types as-is
          })
        )
      );

      setJsonData(JSON.stringify(formattedJson, null, 2));
    };

    reader.readAsBinaryString(file);
  }
};

  const uploadToDB = async () => {
    Swal.showLoading();
    await axios
      .post(`/timesheets/import_timesheets`, JSON.parse(jsonData))
      .then((response) => {
        Swal.hideLoading();
        if (response.data?.errors?.length > 0) {
          console.error("API Errors... ", response.data?.errors)
          const { value: isConfirmed } = Swal.fire({
            icon: "error",
            title: `Process completed with ${response.data?.errors.length} errors`,
            text: "Please verify logs.",
            confirmButtonColor: "#be2c12ff",
            showConfirmButton: true
          });
          if (isConfirmed) {
            return;
          }
        } else {
            const { value: isConfirmed } = Swal.fire({
            icon: "success",
            title: response?.data?.message,
            text: `Inserted ${response?.data?.inserted}, Skipped ${response?.data?.skipped} out of Total ${response?.data?.total_entries} rows`,
            confirmButtonColor: "#0e4372",
            showConfirmButton: true
          });
          if (isConfirmed) {
            return;
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div>
      <h2>Export Timesheet Data</h2>

      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      <button onClick={handleConvert}>Import</button>
      <button onClick={uploadToDB}>Upload to Database</button>

      {jsonData && (
        // <div>
        //   <h3>JSON Output:</h3>
        //   <pre>{jsonData}</pre>
        // </div>
        <div>
            <h4>Data for Importing</h4>
            <TableFromJson data={JSON.parse(jsonData)} />
        </div>
      )}
    </div>
  );
}

export default ImportTimesheet;
