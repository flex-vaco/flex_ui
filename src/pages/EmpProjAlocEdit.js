import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
 
function EmpProjAlocEdit() {
    const emp_proj_aloc_id = useState(useParams().id)
    const [emp_id, setEmpId] = useState('');
    const [project_id, setProjectId] = useState('');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const [work_location, setWorkLocation] = useState('');
    const [hours_per_day, setHoursPerDay] = useState('');
    const [rate_per_hour, setRatePerHour] = useState('');
    const [shift_start_time, setShiftStartTime] = useState('');
    const [shift_end_time, setShiftEndTime] = useState('');

    const [isSaving, setIsSaving] = useState(false)

    const  [empList, setEmpList] = useState([])
    const  [projectList, setProjectList] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/empPrjAloc/${emp_proj_aloc_id}`)
        .then(function (response) {
            setEmpId(response.data?.empProjAlloc?.empDetails?.emp_id);
            setProjectId(response.data?.empProjAlloc?.projectDetails?.project_id);
            setStartDate(Utils.formatDateYYYYMMDD(response.data?.empProjAlloc?.start_date));
            setEndDate(Utils.formatDateYYYYMMDD(response.data?.empProjAlloc?.end_date));
            setWorkLocation(response.data?.empProjAlloc?.work_location);
            setHoursPerDay(response.data?.empProjAlloc?.hours_per_day);
            setRatePerHour(response.data?.empProjAlloc?.rate_per_hour);
            setShiftStartTime(response.data?.empProjAlloc?.shift_start_time);
            setShiftEndTime(response.data?.empProjAlloc?.shift_end_time);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
        });
        fetchEmpList();
        fetchProjList();
    }, [emp_proj_aloc_id])
  
    const fetchEmpList = () => {
        axios.get('/employees')
        .then(function (response) {
          setEmpList(response.data.employees);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const fetchProjList = () => {
        axios.get('/projects')
        .then(function (response) {
          setProjectList(response.data.projects);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const handleEmpChange = (e) => {
        if(e.target.value === "-select-"){
            Swal.fire({
                icon: 'warning',
                title: 'Resource Name is required!',
                showConfirmButton: true
            })
        }
        setEmpId(e.target.value)
    }
    const handleProjectChange = (e) => {
        if(e.target.value === "-select-"){
            Swal.fire({
                icon: 'warning',
                title: 'Project Name is required!',
                showConfirmButton: true
            })
        }
        setProjectId(e.target.value)
    }


    const handleSave = () => {
        setIsSaving(true);
        axios.post(`/empPrjAloc/update/${emp_proj_aloc_id}`, {
            emp_id: emp_id,
            project_id: project_id,
            start_date: start_date,
            end_date : end_date,
            work_location : work_location,
            hours_per_day :hours_per_day,
            shift_start_time : shift_start_time, // 'hh:mi:ss',
            shift_end_time : shift_end_time,
            rate_per_hour : rate_per_hour
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/empProjList");
            window.location.reload(true);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false)
        });
    }
  
    return (
        <Layout>
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-center">Edit Allocation Details</h4>
                    </div>
                    <div className="card-body">
                    <form>
                            <div className="form-group">
                                <label htmlFor="employee">Resource Name</label>
                                <select name="employee" id="employee" className="form-control" onChange={handleEmpChange} > 
                                    {empList.map((emp, key) => {
                                        const sel = (emp.emp_id === emp_id) ? true : false;
                                        return <option key={key} value={emp.emp_id} selected={sel}>{emp.first_name}, {emp.last_name}</option>;
                                    })}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="project">Project</label>
                                <select name="project" id="project" className="form-control" onChange={handleProjectChange} > 
                                    {projectList.map((prj, key) => {
                                        const sel = (prj.project_id === project_id) ? true : false;
                                        return <option key={key} value={prj.project_id} selected={sel}>{prj.project_name}, {prj.project_location}</option>;
                                    })}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="start_date">Allocation Start Date</label>
                                <input 
                                    onChange={(event)=>{setStartDate(event.target.value)}}
                                    value={start_date}
                                    type="date"
                                    className="form-control"
                                    id="start_date"
                                    name="start_date"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="end_date">Allocation End Date</label>
                                <input 
                                    onChange={(event)=>{setEndDate(event.target.value)}}
                                    value={end_date}
                                    type="date"
                                    className="form-control"
                                    id="end_date"
                                    name="end_date"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="work_location">Work Location</label>
                                <input 
                                    onChange={(event)=>{setWorkLocation(event.target.value)}}
                                    value={work_location}
                                    type="text"
                                    className="form-control"
                                    id="work_location"
                                    name="work_location"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="hours_per_day">Hours per Day</label>
                                <input 
                                    onChange={(event)=>{setHoursPerDay(event.target.value)}}
                                    value={hours_per_day}
                                    type="number"
                                    className="form-control"
                                    id="hours_per_day"
                                    name="hours_per_day"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="hours_per_day">Rate Per Hour (USD)</label>
                                <input 
                                    onChange={(event)=>{setRatePerHour(event.target.value)}}
                                    value={rate_per_hour}
                                    type="number"
                                    className="form-control"
                                    id="rate_per_hour"
                                    name="rate_per_hour"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="shift_start_time">Shift Start Time</label>
                                <input 
                                    onChange={(event)=>{setShiftStartTime(event.target.value)}}
                                    value={shift_start_time}
                                    type="time"
                                    className="form-control"
                                    id="shift_start_time"
                                    name="shift_start_time"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="shift_end_time">Shift End Time</label>
                                <input 
                                    onChange={(event)=>{setShiftEndTime(event.target.value)}}
                                    value={shift_end_time}
                                    type="time"
                                    className="form-control"
                                    id="shift_end_time"
                                    name="shift_end_time"/>
                            </div>
                            <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="submit"
                                className="btn btn-outline-info mt-3">
                                Update
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default EmpProjAlocEdit;