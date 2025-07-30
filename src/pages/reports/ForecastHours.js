import React,{ useState, useEffect} from 'react';
import axios from 'axios';
import Layout from "../../components/Layout";
import * as Utils from "../../lib/Utils";
import MUIDataTable from "mui-datatables";

function ForecastHours() {
    const  [columns , setColumnsConfigs] = useState([])
    const  [data , setColumnsData] = useState([])

    const getMondays = (startDate, endDate) => {
    const mondays = [];
      
      // Set the start date to the first Monday on or after the provided start date
      startDate = new Date(startDate.getTime());
      startDate.setDate(startDate.getDate() + (8 - startDate.getDay()) % 7);
    
      // Iterate over each Monday between the start and end dates
      while (startDate < endDate) {
        var monday = new Date(startDate.getTime());
        mondays.push(Utils.formatDateYYYYMMDD(monday));
        startDate.setDate(startDate.getDate() + 7);
      }
      return mondays;
    }
    
    useEffect(() => {
        fetchforecastHours()
    }, [])
    
    const url = "reports/forecastHours";

    const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        let filterStartDate = startDate.getFullYear() + "-" + (startDate.getMonth()+1) + "-" + startDate.getDate();

        const futureMonth = today.getMonth() + 2;
        const endDate = new Date(today.getFullYear(), futureMonth + 1, 0);
        let filterEndDate = endDate.getFullYear() + "-" + (endDate.getMonth()+1) + "-" + endDate.getDate();
        const  [filterStart , setFilterStart] = useState(Utils.formatDateYYYYMMDD(filterStartDate));
        const  [filterEnd , setFilterEnd] = useState(Utils.formatDateYYYYMMDD(filterEndDate));
    
    const fetchforecastHours = () => {
        axios.post(`/${url}`, {
          startDateFilter : filterStart,
          endDateFilter: filterEnd
        })
        .then(function (response) {
          var mondays = getMondays(new Date(response.data.finalDates[0]['startDate']), new Date(response.data.finalDates[0]['endDate']));
          let columnsConfigs = [
            { name: 'Client',
            options: {
              filter: true,
              customFilterListOptions: { render: v => `Client: ${v}` },
              
           }},
            { name: 'Project',
              options: {
                filter: true,
                customFilterListOptions: { render: v => `Project: ${v}` },
               
              }},
            { name: 'Skill',
              options: {
                filter: true,
                customFilterListOptions: { render: v => `Skill: ${v}` },
                
            }},
            { name: 'Name',
            options: {
              filter: true,
              customFilterListOptions: { render: v => `Name: ${v}` },
            }},
          ];
          mondays.forEach((monday, index, array) => { 
            const obj ={ name: Utils.formatDateDDMMNAME(monday),
            options: {
              filter: false,
            } };
            columnsConfigs.push(obj);
          })
          
          setColumnsConfigs(columnsConfigs);
          
          var forecastDetails = response.data.empForecastResults;
          if(forecastDetails.length > 0) {
          const data = [];

          forecastDetails.forEach((forecastDetail, idx) => {
            const weeks = forecastDetail.weeksStarting.split(",");
            const empHours = forecastDetail.forecast.split(",");
            // our object array
            let obj3 = [];

            let my_object = [];
            my_object.push(forecastDetail.clientDetails.name) ;
            my_object.push(forecastDetail.projectDetails.project_name) ;
            my_object.push(forecastDetail.empDetails.primary_skills);
            my_object.push(forecastDetail.empDetails.first_name+','+forecastDetail.empDetails.last_name);
            

            mondays.forEach((monday, index, array) => { 

              if(weeks.indexOf(monday) !== -1)  
              {  
                var indexvalue = weeks.indexOf(monday);
                my_object.push(empHours[indexvalue]);
              }   
              else  
              {  
                my_object.push('-')
              }  
            })
            
            obj3.push(my_object);
            data.push(obj3[0]);
          });
          setColumnsData(data);
        } else{
          const data = [];
          setColumnsData(data);
        }
          
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const options = {
      filter: true,
      onFilterChange: (changedColumn, filterList) => {
        console.log(changedColumn, filterList);
      },
      filterType: 'dropdown',
      responsive: 'vertical',
      rowsPerPage: 10,
      selectableRows: false,
      downloadOptions: {
        filename: 'tableDownload.csv',
        separator: ',',
        filterOptions: {
          useDisplayedColumnsOnly: true | true,
          useDisplayedRowsOnly: true | true
        }
      },
      print: false
    };
    return (
      <Layout>
        <div className="container-fluid">
        <h4 className="text-center report_title mt-3 mb-3">Forecast Hours</h4>
        <div className="col-12 col-lg-12 position_filter float-left mt-3 mb-3">
              <div className='col-4 col-lg-2 float-left pe-3'>
                <label>Start Date</label><input type="date" id="start"  className="form-control" name="trip-start" onChange={(event)=>{setFilterStart(event.target.value)}} value={filterStart} / >
              
              </div>
              <div className='col-4 col-lg-2 float-left pe-3'>
              <label>End Date</label><input type="date" id="end" name="trip-end"  className="form-control" onChange={(event)=>{setFilterEnd(event.target.value)}} value={filterEnd} / >
           
              </div>
              <div className='col-4 col-lg-2 float-left report_button'>
              <button 
                                onClick={fetchforecastHours} 
                                type="submit"
                                className="btn btn-outline-primary mt-3 me-3">
                               Get Report
                            </button> 
              </div>
               
            </div>
            
              

            <div className="card-body report_body">
              
              <MUIDataTable data={data} columns={columns} options={options} />

          </div>
        </div>
      </Layout>
    );
}
  
export default ForecastHours;