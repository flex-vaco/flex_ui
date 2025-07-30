import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import EmployeeProfileModal from '../components/employee/EmployeeProfileModal'

function EmpList() {
    const [empList, setEmpList] = useState([]);
    const navigate = useNavigate();
    const [inputType, setInputType] = useState("text");
    const [filteredList, setFilteredList] = useState(empList);
    const [searchKey, setSearchKey] = useState("");
    const [searchKeys, setSearchKeys] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [empModalDetails, setEmpModalDetails] = useState({})

    const handleAddButtonClick = () => {
      navigate("/empCreate");
    }

    useEffect(() => {
        fetchEmpList()
    }, [])

  const openModal = (empId) => {
    axios.get(`/employees/${empId}`)
      .then((response) => {
        setEmpModalDetails(response.data.employees[0])
      })
      .catch((error) => {
        console.log(error);
      })
    setIsOpen(true);
  }

    const fetchEmpList = () => {
        axios.get('/employees')
        .then(function (response) {
          setEmpList(response.data.employees);
          setFilteredList(response.data.employees);
          setSearchKeys(Object.keys(response?.data?.employees[0]))
        })
        .catch(function (error) {
          console.log(error);
        })
    }
  
    const handleDelete = (emp_id) => {
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
                axios.get(`/employees/delete/${emp_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Resource deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchEmpList()
                })
                .catch(function (error) {
                    Swal.fire({
                         icon: 'error',
                        title: 'An Error Occured!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                });
            }
          })
    };

    const handleSearch = (event) => {
      event.stopPropagation();
     if (!searchKey || searchKey === "-select-") {
        Swal.fire({
          title: 'Select Search Key ',
          text: "Please select a key and then type value!",
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
        const searchValue = event.target.value?.toString().toLowerCase();
        let dbVal = "";
        const fList = empList.filter((item) => {
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
  
    const searchKeysToIgnore = [
      "emp_id",
      "project_id",
      "emp_proj_aloc_id",
      "empDetails",
      "projectDetails", 
      "profile_picture",
      "resume",
      "employment_type",
      "profile_information",
      "resume",
      "education",
      "manager_email"
    ]

    return (
      <Layout>
        <div className="container-fluid">
          <div className="card w-auto">
            <div className="card-header">
              <div className="row">
                <div className="col input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search text-gray"></i>
                  </span>
                  <select
                    style={{ width: "35%" }}
                    name="searchKey"
                    id="search-key"
                    onChange={handleSearchKeyChange}
                  >
                    <option value="-select-"> -- Search Key -- </option>
                    {searchKeys.map((k) =>
                      !searchKeysToIgnore.includes(k) ? (
                        <option value={k}>{k.toLocaleUpperCase()}</option>
                      ) : (
                        ""
                      )
                    )}
                  </select>
                  <input
                    style={{ width: "35%" }}
                    className="ms-1"
                    id="search-value"
                    type={inputType}
                    placeholder=" Type a value"
                    onChange={handleSearch}
                  />
                  <span
                    onClick={handleSearchRefreshClick}
                    hidden={modalIsOpen}
                    className="btn btn-outline-primary btn-small"
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                  </span>
                </div>
                <div className="col text-center">
                  <h4>Resource List</h4>
                </div>
                <div className="col">
                  <button
                    type="button"
                    onClick={handleAddButtonClick}
                    className="btn btn-outline-primary float-end"
                  >
                    ADD <i className="bi bi-plus-square"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-hover">
                <thead className="bg-light">
                  <tr>
                    <th>Action</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Primary Skills</th>
                    <th>Secondary Skills</th>
                    <th>Status</th>
                    <th>Exp.(yrs.)</th>
                    <th>Rate/hr</th>
                    <th>Vaco Join Date</th>
                    <th>Home Location</th>
                    <th>Office Location</th>
                    <th>Manager</th>
                    <th>Manager Email</th>
                    <th>On Site</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((empDetails, key) => {
                    return (
                      <tr
                        key={key}
                        onClick={(e) => openModal(empDetails.emp_id)}
                      >
                        <td>
                          <button
                            onClick={() => handleDelete(empDetails.emp_id)}
                            className="btn btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <Link
                            className="btn btn-outline-success edit_icon"
                            to={`/empEdit/${empDetails.emp_id}`}
                          >
                            <i className="bi bi-pencil" font-size="2rem;"></i>
                          </Link>
                        </td>
                        <td>
                          {empDetails.first_name}, {empDetails.last_name}
                        </td>
                        <td>{empDetails.email}</td>
                        <td>{empDetails.designation}</td>
                        <td>{empDetails.primary_skills}</td>
                        <td>{empDetails.secondary_skills}</td>
                        <td>{empDetails.status}</td>
                        <td>{empDetails.total_work_experience_years}</td>
                        <td>{empDetails.rate_per_hour}</td>
                        <td>
                          {Utils.formatDateYYYYMMDD(empDetails.vaco_join_date)}
                        </td>
                        <td>{empDetails.home_location_city}</td>
                        <td>{empDetails.office_location_city}</td>
                        <td>{empDetails.manager_name}</td>
                        <td>{empDetails.manager_email}</td>
                        <td>{empDetails.is_onsite ? "YES" : "NO"}</td>
                        <td>
                          <a
                            href={
                              empDetails.resume
                                ? `${process.env.REACT_APP_API_BASE_URL}/uploads/resume/${empDetails.resume}`
                                : null
                            }
                            target="_blank" rel="noreferrer"
                          >
                            <i className="bi bi-person-lines-fill"></i>
                          </a>
                        </td>
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
  
export default EmpList;