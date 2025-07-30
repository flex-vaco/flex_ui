import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import EmployeeProfileModal from '../components/employee/EmployeeProfileModal'
import * as AppFunc from "../lib/AppFunctions";
import APP_CONSTANTS from "../appConstants";

function EmpProjAlocList() {
    const  [empProjAlocList, setEmpProjAlocList] = useState([])
    const  [searchKeys, setSearchKeys] = useState([]);
    const [inputType, setInputType] = useState("text");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [empModalDetails, setEmpModalDetails] = useState({});
    const hasReadOnlyAccess = useState(AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER);
    const navigate = useNavigate(); 

    const handleAddButtonClick = () => {
      navigate("/empProjCreate");
    }

    useEffect(() => {
        fetchEmpProjAlocList()
    }, [])
    const url = "empPrjAloc";
    const fetchEmpProjAlocList = () => {
        axios.get(`/${url}`)
        .then(function (response) {
          setEmpProjAlocList(response.data.empProjAlloc);
          setFilteredList(response.data.empProjAlloc);
          setSearchKeys(Object.keys(response?.data?.empProjAlloc[0]))
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const handleDelete = (emp_proj_aloc_id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {
                axios.get(`/${url}/delete/${emp_proj_aloc_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Allocation deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchEmpProjAlocList();
                })
                .catch(function (error) {
                    Swal.fire({
                         icon: 'error',
                        title: 'An Error Occured!',
                        text: error,
                        showConfirmButton: false,
                        timer: 1500
                    })
                });
            }
          })
    };

    const [filteredList, setFilteredList] = useState(empProjAlocList);
    const [searchKey, setSearchKey] = useState("");

    const handleSearch = (event) => {
      event.stopPropagation();
     if (!searchKey || searchKey === "-select-") {
        Swal.fire({
          title: 'Select Search Key ',
          text: "Please select a key to search!",
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
        const searchValue = event.target.value?.toString().toLowerCase();
        let dbVal = "";
        const fList = empProjAlocList.filter((item) => {
          if (searchKey.includes("date")) {
            dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`]).toString();
          } else {
            dbVal = item[`${searchKey}`]?.toString().toLowerCase();
          }
          return dbVal?.includes(searchValue);
        });
        setFilteredList(fList);
      }
    };

    const handleSearchKeyChange = (event) => {
      event.stopPropagation();
      if (event.target.value === "-select-"){
        document.getElementById("search-value").value = "";
      } else {
        setSearchKey(event.target.value);
      }
      
      (event.target.value.includes("date")) ? setInputType("date") : setInputType("text");
    };

    const handleSearchRefreshClick = () => {
      window.location.reload(true);
    };
    const searchKeysToIgnore = ["emp_id","project_id","emp_proj_aloc_id","empDetails", "projectDetails"];

    const openEmpDetailsModal = (empId) => {
      axios.get(`/employees/${empId}`)
        .then((response) => {
          setEmpModalDetails(response.data.employees[0])
        })
        .catch((error) => {
          console.log(error);
        })
      setIsOpen(true);
    }
    
    return (
      <Layout>
        <div className="container-fluid">
          <div className="card w-auto">
            <div className="card-header">
              <div className="row">
                <div className="col input-group">
                  <span className="input-group-text"><i className="bi bi-search text-gray"></i></span>
                    <select style={{width:"35%"}} name="searchKey" id="searchKey" onChange={handleSearchKeyChange}> 
                      <option value="-select-"> -- Select Key -- </option>
                      {searchKeys.map((k) => (!searchKeysToIgnore.includes(k)) ? <option value={k}>{k.toLocaleUpperCase()}</option> : "")}
                    </select>
                    <input style={{width:"35%"}} className="ms-2" id="search-value" type={inputType} placeholder=" Type a value" onChange={handleSearch} />
                    <span 
                    onClick={handleSearchRefreshClick}
                    hidden={modalIsOpen}
                    className="btn btn-outline-primary btn-small">
                    <i className="bi bi-arrow-counterclockwise"></i>
                  </span>
                </div>
                <div className="col text-center">
                  <h4>Allocation List</h4>
                </div>
                <div className="col">
                  <button 
                    type="button"
                    hidden={hasReadOnlyAccess}
                    onClick={handleAddButtonClick}
                    className="btn btn-outline-primary float-end">
                    ADD <i className="bi bi-plus-square"></i> 
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-hover">
                <thead className="bg-light">
                  <tr>
                    <th hidden={hasReadOnlyAccess}>Action</th>
                    <th>Project Name</th>
                    <th>Resource Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Work Location</th>
                    <th>Hours per Day</th>
                    <th>Rate Per Hour (USD)</th>
                    <th>Shift Start Time</th>
                    <th>Shift End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((empProjAlloc, key) => {
                    return (
                      <tr key={key}>
                        <td hidden={hasReadOnlyAccess}>
                          <button
                            onClick={() => handleDelete(empProjAlloc.emp_proj_aloc_id)}
                            className="btn btn-outline-danger mx-1"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <Link
                            className="btn btn-outline-success mx-1 edit_icon"
                            to={`/empProjEdit/${empProjAlloc.emp_proj_aloc_id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        </td>
                        <td>
                          <Link
                            to={`/projectShow/${empProjAlloc.projectDetails.project_id}`}
                          >
                            {empProjAlloc.projectDetails.project_name}
                          </Link>
                        </td>
                        <td>
                          <a href='#' id={key} key={key}  onClick={(e) => openEmpDetailsModal(empProjAlloc.empDetails.emp_id)}>
                            {empProjAlloc.empDetails.first_name}, 
                            {empProjAlloc.empDetails.last_name}
                          </a>
                        </td>
                        <td>{Utils.formatDateYYYYMMDD(empProjAlloc.start_date)}</td>
                        <td>{Utils.formatDateYYYYMMDD(empProjAlloc.end_date)}</td>
                        <td>{empProjAlloc.work_location}</td>
                        <td>{empProjAlloc.hours_per_day}</td>
                        <td>{empProjAlloc.rate_per_hour}</td>
                        <td>{empProjAlloc.shift_start_time}</td>
                        <td>{empProjAlloc.shift_end_time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <EmployeeProfileModal
                modelstatus={modalIsOpen}
                close={() => setIsOpen(false)}
                employee={empModalDetails}
                hideAddInListBtn={true}
                hideHireBtn={true}
              />
            </div>
          </div>
        </div>
      </Layout>
    );
}
  
export default EmpProjAlocList;