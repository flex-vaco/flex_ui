import { useState } from 'react';
import * as XLSX from 'xlsx';
import TableFromJson from '../../components/TableFromJson'
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from '../../components/Layout'

function ImportTimesheet() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [headers,  setHeaders] = useState([]);
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
      setHeaders(Object.keys(formattedJson[0]));
    };

    reader.readAsBinaryString(file);
  }
};

  const validHeaders = [
    "Date",
    "Employee",
    "Customer",
    "Case_Task_Event",
    "Item",
    "Note",
    "Approval_Status",
    "Duration"
  ]

  const columnsMatch = (arr1, arr2) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    if (set1.size !== set2.size) return false;

    for (let val of set1) {
      if (!set2.has(val)) return false;
    }

    return true;
  }
  
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
    <Layout>
      <div className="list-page-container">
        <div className="list-page-card">
          {/* Header Section */}
          <div className="list-page-header">
            <h1 className="list-page-title">Import Timesheet Data</h1>
          </div>

          {/* Search Controls */}
          <div className="search-controls">
            <div className="search-row">
              <div className="search-input-group" style={{ flex: '0 1 auto', minWidth: '300px' }}>
                <input className="search-input" type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
              </div>
              <button className="excel-btn" disabled={!file} onClick={handleConvert}>
                <i className="bi bi-upload"></i>
                Import
              </button>
              <div className="action-buttons">
                <button className="add-btn" onClick={uploadToDB} disabled={!jsonData}>
                  <i className="bi bi-cloud-upload"></i>
                  Upload to Database
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          {jsonData && (
            (!columnsMatch(headers, validHeaders)) ?     
              <div className="list-table-container">
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: '8px', 
                    padding: '20px',
                    margin: '20px'
                  }}>
                    <h4 style={{ color: '#856404', marginBottom: '15px' }}>
                      <i className="bi bi-exclamation-triangle"></i> Invalid Column Headers
                    </h4>
                    <p style={{ color: '#856404', marginBottom: '15px' }}>
                      Please ensure your Excel file has the following column headers:
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '10px',
                      maxWidth: '600px',
                      margin: '0 auto'
                    }}>
                      {validHeaders.map((header, index) => (
                        <li key={index} style={{ 
                          background: '#fff', 
                          padding: '8px 12px', 
                          borderRadius: '4px', 
                          border: '1px solid #ffeaa7',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {header}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            :
              <div className="list-table-container">
                <div style={{ padding: '20px' }}>
                  <h4 style={{ 
                    color: '#072942', 
                    marginBottom: '20px', 
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    <i className="bi bi-table"></i> Data Preview for Import
                  </h4>
                  <TableFromJson data={JSON.parse(jsonData)} />
                </div>
              </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ImportTimesheet;
