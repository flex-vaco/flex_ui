import React from 'react';

const TableFromJson = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }
  
  // Extract keys for table headers 
  const headers = Object.keys(data[0]);

  // console.log(headers)
  return (
    <div className="list-table-container">
    <table className="table list-table" id='TableFromJson'>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, cellIndex) => (
              <td key={cellIndex}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default TableFromJson;