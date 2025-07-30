import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout";
import APP_CONSTANTS from "../../appConstants";
import * as APP_FUNCTIONS from "../../lib/AppFunctions";
import EmployeeProfileModal from '../../components/employee/EmployeeProfileModal'

function ApproveTimesheetList() {
    const managerEmail = useState(JSON.parse(localStorage.getItem("user"))?.email);
    const userIsApprover = useState(APP_FUNCTIONS.activeUserRole === APP_CONSTANTS.USER_ROLES.MANAGER); 
    const userIsProducer = useState(APP_FUNCTIONS.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER); 
    const [empList, setEmpList] = useState([]);
    const [pageTitle, setPageTitle] = useState();
    const [empModalDetails, setEmpModalDetails] = useState({})
    const [modalIsOpen, setIsOpen] = useState(false);

    const fetchManagerEmployees = (managerEmail) => {
        axios
          .get(`timesheets/approvependingemployees`, {
            params: { manager_email: managerEmail },
          })
          .then(function (response) {
            setEmpList(response.data?.employees);
            console.log(response.data?.employees);
          })
          .catch(function (error) {
            console.log(error);
          });
      };
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
    
      useEffect(() => {
        if(userIsApprover || userIsProducer) {
          fetchManagerEmployees(managerEmail);
        } else {
          return;
        }
        if(userIsApprover) {
          setPageTitle('Pending for Approval');
        } 
        else if(userIsProducer) {
          setPageTitle('Pending for Acceptence');
        }
        
      }, [managerEmail]);
    
      return (
        <Layout>
          <div className="container-fluid">
          <h4 className='text-center'>{pageTitle}</h4>
            <div className="card w-auto">
              <div className="card-body table-responsive">
                <table className="table table-hover">
                  <thead className="bg-light">
                    <tr>
                      <th>Action</th>
                      <th>Employee Name</th>
                      <th>Project Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empList.map((empDetail, key) => {
                      return (
                        <tr key={key}>
                          <td>
                            <Link
                              className="btn btn-outline-success mx-1 edit_icon"
                              to={`/approveEmpTimesheet/${empDetail.project_id}/${empDetail.emp_id}`}
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                          </td>
                          <td>
                              <a href="#"
                               onClick={(e) => openModal(empDetail.emp_id)}
                              >
                                {empDetail.first_name} {empDetail.last_name}
                              </a>
                          </td>
                          <td>
                            <Link
                              to={`/projectShow/${empDetail.project_id}`}
                            >
                              {empDetail.project_name}
                            </Link>
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

export default ApproveTimesheetList;