import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import * as Utils from "../../lib/Utils";
import Layout from "../../components/Layout"
import TimeEntryWidget from "../../components/TimeEntryWidget";
import APP_CONSTANTS from "../../appConstants";
import * as APP_FUNCTIONS from "../../lib/AppFunctions";

function ApproveEmpTimesheet() {
    const [project_id, setprojectId] = useState(useParams().project_id);
    const [emp_id, setempId] = useState(useParams().emp_id);
    const [userIsApprover, setUserIsApptover] = useState(APP_FUNCTIONS.activeUserRole === APP_CONSTANTS.USER_ROLES.MANAGER);
    const [userIsProducer, setUserIsProducer] = useState(APP_FUNCTIONS.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER);
    const [isSaving, setIsSaving] = useState(false);
    const [managerEmail, setManagerEmail] = useState(JSON.parse(localStorage.getItem("user"))?.email);
    const [empTimesheets, setEmpTimesheets] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [taskHours, setTaskHours] = useState(0);
    const [taskOvertime, setTaskOvertime] = useState(0);
    const [taskBenchHrs, setTaskBenchHrs] = useState(0);
    const [taskPTO, setTaskPTO] = useState(0);
    const [timesheetId, setTimesheetId] = useState([]);
    const [btnTitle, setBtnTitle] = useState();
    const navigate = useNavigate();
    const [timesheetIds,setTimesheetIds] = useState([]);

    const [isStatus, setIsStatus] = useState();
    const [isRejectStatus, setIsRejectStatus] = useState();
    const [btnRejectTitle, setBtnRejectTitle] = useState();

    const handleCheck = (e, selectedId) => {
      var timesheetIds_array = [...timesheetIds];
      if (e.target.checked) {
        timesheetIds_array = [...timesheetIds, selectedId];
      } else {
        timesheetIds_array.splice(timesheetIds.indexOf(selectedId), 1);
      }
      setTimesheetIds(timesheetIds_array);
      
    };
    const handleCheckAllChange = (e) => {
      if (e.target.checked) {
        const allTimesheets = empTimesheets.map((c) => c.timesheet_id);
        setTimesheetIds(allTimesheets);
      } else {
        setTimesheetIds([]);
      }
    };
    useEffect(() => {
        if(userIsApprover) {
          setIsStatus('APPROVED');
          setIsRejectStatus('REJECTED');
          setBtnTitle('APPROVE');
          setBtnRejectTitle('REJECT');
        }
        
        if(userIsProducer) {
          setIsStatus('ACCEPTED');
          setIsRejectStatus('REJECTED');
          setBtnTitle('ACCEPT');
          setBtnRejectTitle('REJECT');
        }

        if(userIsApprover || userIsProducer) {
          fetchEmpPendingTimesheet();
        } else {
          return;
        }
    }, [managerEmail]);

    const fetchEmpPendingTimesheet = () => {
        axios
            .post(`timesheets/empPendingTimesheet`, { params: { emp_id: emp_id, project_id: project_id } })
            .then(function (response) {
                setEmpTimesheets(response.data?.timesheets);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const handleSubmit = (e) => {
      const status = e.target.name;
      const submitData = {
        status: status,
        emp_id: emp_id,
        project_id: project_id,
        timesheet_id: timesheetIds,
      };
      axios
      .post("timesheets/change_status_supervisior", submitData)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: `Timesheet ${status}!`,
          showConfirmButton: false,
          timer: 3000
        })
        navigate("/approveTimesheet");
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Failed to Submit Timesheet!",
          text: err.response.data.message,
          showConfirmButton: true,
        });
      });
    }
   
    return (
        <Layout>
          <div className="container-fluid">

            <div className="card w-auto">
              <div className="card-body table-responsive">
                <table className="table table-hover">
                  <thead className="bg-light">
                    <tr>
                    <th style={{width:"2%"}}>
                      <div className="form-check checkbox-xl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAll"
                          checked={timesheetIds.length === empTimesheets.length}
                          onChange={handleCheckAllChange}
                        />
                      </div>

                    </th>
                      <th style={{width:"8%"}}>Date</th>
                      <th style={{width:"12%"}}>Employee - Project</th>
                      <th style={{width:"58%"}}>Enter/Edit Task Details</th>
                      <th style={{width:"5%"}}>Project</th>
                      <th style={{width:"5%"}}>Overtime</th>
                      <th style={{width:"5%"}}>Bench</th>
                      <th style={{width:"5%"}}>Time-off</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empTimesheets.map((empTimesheet, key) => {
                    
                      return (
                        <tr key={key}>
                          <td>
                            <div className="form-check checkbox-xl">
                              <input 
                                className="form-check-input" 
                                type='checkbox' 
                                name="timesheet_selected" 
                                value={empTimesheet.timesheet_id} 
                                checked={timesheetIds.includes(empTimesheet.timesheet_id)}
                                onChange={(e) => handleCheck(e, empTimesheet.timesheet_id)}>
                              </input>
                            </div>
                          </td>
                          <td>
                            {Utils.formatDateYYYYMMDD(empTimesheet.timesheet_date)}
                          </td>
                          <td>
                          {empTimesheet.first_name} {empTimesheet.last_name} <br/>
                          {empTimesheet.project_name}
                          </td>
                          <td>
                            <input
                                onChange={(event)=>{setTaskName(event.target.value)}}
                                value={empTimesheet.task}
                                placeholder="Enter Task"
                                type="text"
                                className="form-control"
                                id={`task_name_${empTimesheet.timesheet_id}`}
                                name="task_name"
                            />
                          </td>
                          <td>
                            <input
                                onChange={(event)=>{setTaskHours(event.target.value)}}
                                value={empTimesheet.hours_per_day}
                                type="number"
                                placeholder="0"
                                className="form-control"
                                id={`task_hrs_${empTimesheet.timesheet_id}`}
                                name="hours"
                            />
                          </td>
                          <td>
                            <input
                                onChange={(event)=>{setTaskOvertime(event.target.value)}}
                                value={empTimesheet.overtime}
                                type="number"
                                placeholder="0"
                                className="form-control"
                                id={`task_ot_${empTimesheet.timesheet_id}`}
                                name="overtime"
                            />
                          </td>
                          <td>
                            <input
                                onChange={(event)=>{setTaskBenchHrs(event.target.value)}}
                                value={empTimesheet.bench_hours}
                                type="number"
                                placeholder="0"
                                className="form-control"
                                id={`task_bench_${empTimesheet.timesheet_id}`}
                                name="bench_hours"
                            />
                          </td>
                          <td>
                            <input
                                onChange={(event)=>{setTaskPTO(event.target.value)}}
                                value={empTimesheet.time_off}
                                type="number"
                                placeholder="0"
                                className="form-control"
                                id={`task_pto_${empTimesheet.timesheet_id}`}
                                name="time_off"
                            />
                          </td>
                        </tr>
                      );
                        
                    })}
                  </tbody>
                </table>
                <div hidden={!emp_id}  className="form-group col-md-6 align-items-center float-end">
                    <button 
                       
                        disabled={isSaving}
                        onClick={(event)=>{handleSubmit(event)}} 
                        type="submit"
                        name={isStatus}
                        className="btn btn-outline-info me-3 float-end">
                        {btnTitle}
                    </button>
                    <button 
                        
                        disabled={isSaving}
                        onClick={(event)=>{handleSubmit(event)}} 
                        type="submit"
                        name={isRejectStatus}
                        className="btn btn-outline-danger me-3 float-end">
                        {btnRejectTitle}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      );
}

export default ApproveEmpTimesheet;