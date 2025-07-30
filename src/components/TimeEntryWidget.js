import React, { useState, useEffect } from "react";
import axios from 'axios';
import { userIsEmployee, userIsProducer, userIsManager } from "../lib/AppFunctions";

function TimeEntryWidget(props) {
  const [taskName, setTaskName] = useState('');
  const [taskHours, setTaskHours] = useState(0);
  const [taskOvertime, setTaskOvertime] = useState(0);
  const [taskBenchHrs, setTaskBenchHrs] = useState(0);
  const [taskPTO, setTaskPTO] = useState(0);

    const [timesheetData, setTimesheetData] = useState([]);
    const [weekEndBGColor] = useState(props.isWeekend ? "bg-light bg-gradient" : "");
    const [labelFont] = useState(props.isWeekend ? "text-muted" : "fw-bold");

    const tempTimesheetId = useState(`temp_${props.empAlloc.project_id}_${props.tsDate}`)
    const fetchTimesheets = () => {
      axios
        .post(`/timesheets/by_allocation`, {
          givenDate: props.tsDate,
          projectId: props.empAlloc.project_id,
          empId: props.empAlloc.emp_id,
        })
        .then(function (response) {
          setTimesheetData(response.data?.timesheetsByAllocation[0]);
          setTaskName(response.data?.timesheetsByAllocation[0]?.task || '');
          setTaskHours(response.data?.timesheetsByAllocation[0]?.hours_per_day || 0);
          setTaskOvertime(response.data?.timesheetsByAllocation[0]?.overtime || 0);
          setTaskBenchHrs(response.data?.timesheetsByAllocation[0]?.bench_hours || 0);
          setTaskPTO(response.data?.timesheetsByAllocation[0]?.time_off || 0);
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    useEffect(() => {
        fetchTimesheets();
    }, [props.tsDate, props.empAlloc.project_id, props.empAlloc.emp_id])


  const handleChange = (e) => {
    e.preventDefault();
    const taskNameEl = document.getElementById(`task_name_${tempTimesheetId}`);
    const taskHoursEl = document.getElementById(`task_hrs_${tempTimesheetId}`);
    const taskOvertimeEl = document.getElementById(`task_ot_${tempTimesheetId}`);
    const taskBenchHrsEl = document.getElementById(`task_bench_${tempTimesheetId}`);
    const taskPTOEl = document.getElementById(`task_pto_${tempTimesheetId}`);

    if (taskNameEl.value && taskHoursEl.value) {
      if((taskNameEl.value !== timesheetData?.task) || (taskHoursEl.value !== timesheetData?.hours_per_day)){
        const data = {
          timesheet_id: timesheetData?.timesheet_id || tempTimesheetId,
          emp_id: props.empAlloc.emp_id,
          project_id: props.empAlloc.project_id,
          manager_email: props.empAlloc.manager_email,
          timesheet_date: props.tsDate,
          hours_per_day: taskHoursEl.valueAsNumber,
          overtime: taskOvertimeEl.valueAsNumber,
          bench_hours: taskBenchHrsEl.valueAsNumber,
          time_off: taskPTOEl.valueAsNumber,
          timesheet_status: timesheetData?.timesheet_status || "ENTERED",
          task: taskNameEl.value,
          comments: {
              emp:  "test",
              supr: "ok"
          }
        };
  
        props.tsData(data);
      }
    }
  };

  const badgeColor = (sts)=>{
    switch (sts) {
      case "SUBMITTED":
        return "bg-info"
      case "APPROVED":
      case "ACCEPTED":
        return "bg-success"
      case "REJECTED":
      case "REWORK":
        return "bg-danger"
      default:
        return "bg-light"
    } 
  }

  const readOnlyAccess = (tskStatus) => {
    if (userIsEmployee()) {
      return (['APPROVED', 'ACCEPTED', 'CANCELLED'].includes(tskStatus));
    } else if (userIsManager()) {
      return (['ACCEPTED', 'CANCELLED'].includes(tskStatus));
    } else if (userIsProducer()) {
      return true;
    }
  }

  return (
    <div className="time-entry-widget">
      <form id={tempTimesheetId} className="row">
        <div className="form-group col-md-8 mb-2">
          <label htmlFor="task_name">
            <span className={`${labelFont}`}> {props.empAlloc.project_name} </span>
            <span className={`badge ${badgeColor(timesheetData?.timesheet_status)}`}>{timesheetData?.timesheet_status}</span>
          </label>
          <input
            onBlur={(event) => {
              handleChange(event);
            }}
            onChange={(event)=>{setTaskName(event.target.value)}}
            value={taskName}
            placeholder="Enter Task"
            type="text"
            className={`form-control ${weekEndBGColor}`}
            id={`task_name_${tempTimesheetId}`}
            name="task_name"
            readOnly={readOnlyAccess(timesheetData?.timesheet_status)}
          />
        </div>
        <div className="form-group col-md-1 mb-2">
          <label htmlFor="hours" className={`${labelFont}`}>
            Project
            <span>
              {" "}
              {` (${props.empAlloc.hours_per_day})`}
            </span>
          </label>
          <input
            onBlur={(event) => {
              handleChange(event);
            }}
            onChange={(event)=>{setTaskHours(event.target.value)}}
            value={taskHours}
            type="number"
            placeholder="0"
            className={`form-control ${weekEndBGColor}`}
            min={0}
            max={props.empAlloc.hours_per_day}
            id={`task_hrs_${tempTimesheetId}`}
            name="hours"
            readOnly={readOnlyAccess(timesheetData?.timesheet_status)}
          />
        </div>
        <div className="form-group col-md-1 mb-2">
          <label htmlFor="overtime" className={`${labelFont}`}>
            Overtime
          </label>
          <input
            onBlur={(event) => {
              handleChange(event);
            }}
            onChange={(event)=>{setTaskOvertime(event.target.value)}}
            value={taskOvertime}
            type="number"
            placeholder="0"
            className={`form-control ${weekEndBGColor}`}
            min={0}
            max={8}
            id={`task_ot_${tempTimesheetId}`}
            name="overtime"
            readOnly={readOnlyAccess(timesheetData?.timesheet_status)}
          />
        </div>
        <div className="form-group col-md-1 mb-2">
          <label htmlFor="benchHrs" className={`${labelFont}`}>
            Bench
          </label>
          <input
            onBlur={(event) => {
              handleChange(event);
            }}
            onChange={(event)=>{setTaskBenchHrs(event.target.value)}}
            value={taskBenchHrs}
            type="number"
            placeholder="0"
            className={`form-control ${weekEndBGColor}`}
            min={0}
            max={8}
            id={`task_bench_${tempTimesheetId}`}
            name="benchHrs"
            readOnly={readOnlyAccess(timesheetData?.timesheet_status)}
          />
        </div>
        <div className="form-group col-md-1 mb-2">
          <label htmlFor="PTO" className={`${labelFont}`}>
            Time Off
          </label>
          <input
            onBlur={(event) => {
              handleChange(event);
            }}
            onChange={(event)=>{setTaskPTO(event.target.value)}}
            value={taskPTO}
            type="number"
            placeholder="0"
            className={`form-control ${weekEndBGColor}`}
            min={0}
            max={8}
            id={`task_pto_${tempTimesheetId}`}
            name="PTO"
            readOnly={readOnlyAccess(timesheetData?.timesheet_status)}
          />
        </div>
      </form>
    </div>
  );
}

export default TimeEntryWidget;
