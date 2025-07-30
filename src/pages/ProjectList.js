import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import * as AppFunc from "../lib/AppFunctions";
import APP_CONSTANTS from "../appConstants";

function ProjectList() {
    const [projectList, setProjectList] = useState([]);
    const hasReadOnlyAccess = useState(AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER);

    const navigate = useNavigate();

    const handleAddButtonClick = () => {
      navigate("/projectCreate");
    }

    useEffect(() => {
        fetchProjectList()
    }, [])
  
    const fetchProjectList = () => {
        axios.get('/projects')
        .then(function (response) {
          setProjectList(response.data.projects);
          setFilteredList(response.data.projects);
          setSearchKeys(Object.keys(response?.data?.projects[0]))

        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const handleDelete = (project_id) => {
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
                axios.get(`/projects/delete/${project_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Project deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchProjectList()
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

  const [filteredList, setFilteredList] = useState(projectList);
  const [searchKey, setSearchKey] = useState("");
  const  [inputType, setInputType] = useState("text");
  const  [searchKeys, setSearchKeys] = useState([])

  const handleSearch = (event) => {
    event.stopPropagation();
    const searchValue = event.target.value.toString().toLowerCase();
    let dbVal = "";
    const fList = projectList.filter((item) => {
      if (searchKey.includes("date")) {
        dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`]).toString();
      } else {
        dbVal = item[`${searchKey}`].toString().toLowerCase();
      }
      return dbVal.includes(searchValue);
    });
    setFilteredList(fList);
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

  const handleExcelExport = () => {
    Utils.exportHTMLTableToExcel('projectListTable', 'Project List', ["Action"])
  };

  const searchKeysToIgnore = ["project_id", "client_id","clientDetails"];

    return (
      <Layout>
        <div className="container-fluid">
          <div className="card w-auto">
          <div className="text-align-left mt-2 mb-2 ms-3">
              <button
                type="button"
                onClick={handleExcelExport}
                className="btn btn-sm btn-outline-info float-start"
              >
                EXCEL <i className="bi bi-filetype-xls"></i>
              </button>
            </div>
            <div className="card-header">
              <div className="row">
              <div className="col input-group">
                  <span className="input-group-text"><i className="bi bi-search text-gray"></i></span>
                    <select style={{width:"35%"}} name="searchKey" id="search-key"  onChange={handleSearchKeyChange}> 
                      <option value="-select-"> -- Search Key -- </option>
                      {searchKeys.map((k) => (!searchKeysToIgnore.includes(k)) ? <option value={k}>{k.toLocaleUpperCase()}</option> : "")}
                    </select>
                    <input style={{width:"35%"}} className="ms-1" id="search-value" type={inputType} placeholder=" Type a value" onChange={handleSearch} />
                      <span 
                      onClick={handleSearchRefreshClick}
                      className="btn btn-outline-primary btn-small">
                      <i className="bi bi-arrow-counterclockwise"></i>
                    </span>
                </div>
                <div className="col text-center">
                  <h4>Project List</h4>
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
              <table className="table table-hover" id='projectListTable'>
                <thead className="bg-light">
                  <tr>
                    <th hidden={hasReadOnlyAccess}>Action</th>
                    <th>Client Name</th>
                    <th>Project Name</th>
                    <th>Project Location</th>
                    <th>Contact Person</th>
                    <th>Contact Email</th>
                    <th>Contact Phone</th>
                    <th>Start Date</th>
                    <th>Expected End Date</th>
                    <th>Actual End Date</th>
                    <th>Project Status</th>
                    <th>Technologies Involved</th>
                    <th>Head Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((projectDetails, key) => {
                    return (
                      <tr key={key}>
                        <td hidden={hasReadOnlyAccess}>
                          <button
                            onClick={() => handleDelete(projectDetails.project_id)}
                            className="btn btn-outline-danger mx-1"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <Link
                            className="btn btn-outline-success mx-1 edit_icon"
                            to={`/projectEdit/${projectDetails.project_id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        </td>
                        <td>
                          <Link
                            to={`/clientShow/${projectDetails.clientDetails.client_id}`}
                          >
                            {projectDetails.clientDetails.name}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to={`/projectShow/${projectDetails.project_id}`}
                          >
                            {projectDetails.project_name}
                          </Link>
                        </td>
                        
                        <td>{projectDetails.project_location}</td>

                        <td>{projectDetails.contact_person}</td>
                        <td>{projectDetails.contact_email}</td>
                        <td>{projectDetails.contact_phone}</td>
                        <td>{Utils.formatDateYYYYMMDD(projectDetails.start_date)}</td>
                        <td>{Utils.formatDateYYYYMMDD(projectDetails.expected_end_date)}</td>
                        <td>{Utils.formatDateYYYYMMDD(projectDetails.actual_end_date)}</td>
                        <td>{projectDetails.status}</td>
                        <td>{projectDetails.technologies_required}</td>
                        <td>{projectDetails.head_count}</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    );
}
  
export default ProjectList;