import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import "./FormStyles.css"
 
function EmpProjAlocEdit() {
    const { id } = useParams();
    const [emp_id, setEmpId] = useState('');
    const [project_id, setProjectId] = useState('');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const [work_location, setWorkLocation] = useState('');
    const [hours_per_day, setHoursPerDay] = useState('');
    const [bill_rate_per_hour, setBillRatePerHour] = useState('');
    const [shift_start_time, setShiftStartTime] = useState('');
    const [shift_end_time, setShiftEndTime] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [empList, setEmpList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/empPrjAloc/${id}`)
        .then(function (response) {
            setEmpId(response.data?.empProjAlloc?.empDetails?.emp_id);
            setProjectId(response.data?.empProjAlloc?.projectDetails?.project_id);
            setStartDate(Utils.formatDateYYYYMMDD(response.data?.empProjAlloc?.start_date));
            setEndDate(Utils.formatDateYYYYMMDD(response.data?.empProjAlloc?.end_date));
            setWorkLocation(response.data?.empProjAlloc?.work_location);
            setHoursPerDay(response.data?.empProjAlloc?.hours_per_day);
            setBillRatePerHour(response.data?.empProjAlloc?.bill_rate_per_hour);
            setShiftStartTime(response.data?.empProjAlloc?.shift_start_time);
            setShiftEndTime(response.data?.empProjAlloc?.shift_end_time);
            setIsLoading(false);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsLoading(false);
        });
        fetchEmpList();
        fetchProjList();
    }, [id])
  
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
        if (emp_id === '' || emp_id === '-select-') {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a resource!',
                showConfirmButton: true
            })
            return;
        }

        if (project_id === '' || project_id === '-select-') {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a project!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        axios.post(`/empPrjAloc/update/${id}`, {
            emp_id: emp_id,
            project_id: project_id,
            start_date: start_date,
            end_date : end_date,
            work_location : work_location,
            hours_per_day :hours_per_day,
            shift_start_time : shift_start_time, // 'hh:mi:ss',
            shift_end_time : shift_end_time,
            bill_rate_per_hour : bill_rate_per_hour
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Allocation updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/empProjList");
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

    const handleCancel = () => {
        navigate("/empProjList");
    }

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Allocation Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading allocation details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Edit Allocation Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Resource & Project Selection</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="employee" className="form-label required-field">
                                            Resource Name
                                        </label>
                                        <select 
                                            name="employee" 
                                            id="employee" 
                                            className="form-select" 
                                            onChange={handleEmpChange}
                                            value={emp_id}
                                            required
                                        > 
                                            {empList.map((emp, key) => (
                                                <option key={key} value={emp.emp_id}>
                                                    {emp.first_name} {emp.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="project" className="form-label required-field">
                                            Project
                                        </label>
                                        <select 
                                            name="project" 
                                            id="project" 
                                            className="form-select" 
                                            onChange={handleProjectChange}
                                            value={project_id}
                                            required
                                        > 
                                            {projectList.map((prj, key) => (
                                                <option key={key} value={prj.project_id}>
                                                    {prj.project_name}, {prj.project_location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Allocation Period</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="start_date" className="form-label required-field">
                                            Allocation Start Date
                                        </label>
                                        <input 
                                            onChange={(event)=>{setStartDate(event.target.value)}}
                                            value={start_date}
                                            type="date"
                                            className="form-date"
                                            id="start_date"
                                            name="start_date"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="end_date" className="form-label">
                                            Allocation End Date
                                        </label>
                                        <input 
                                            onChange={(event)=>{setEndDate(event.target.value)}}
                                            value={end_date}
                                            type="date"
                                            className="form-date"
                                            id="end_date"
                                            name="end_date"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Work Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="work_location" className="form-label">
                                            Work Location
                                        </label>
                                        <input 
                                            onChange={(event)=>{setWorkLocation(event.target.value)}}
                                            value={work_location}
                                            type="text"
                                            className="form-control"
                                            id="work_location"
                                            name="work_location"
                                            placeholder="Enter work location"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="hours_per_day" className="form-label">
                                            Hours per Day
                                        </label>
                                        <input 
                                            onChange={(event)=>{setHoursPerDay(event.target.value)}}
                                            value={hours_per_day}
                                            type="number"
                                            className="form-control"
                                            id="hours_per_day"
                                            name="hours_per_day"
                                            placeholder="Enter hours per day"
                                            min="1"
                                            max="24"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="bill_rate_per_hour" className="form-label">
                                            Cost Per Hour (USD)
                                        </label>
                                        <input 
                                            onChange={(event)=>{setBillRatePerHour(event.target.value)}}
                                            value={bill_rate_per_hour}
                                            type="number"
                                            className="form-control"
                                            id="bill_rate_per_hour"
                                            name="bill_rate_per_hour"
                                            placeholder="Enter Cost per hour"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        {/* Empty div for layout balance */}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Shift Schedule</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="shift_start_time" className="form-label">
                                            Shift Start Time
                                        </label>
                                        <input 
                                            onChange={(event)=>{setShiftStartTime(event.target.value)}}
                                            value={shift_start_time}
                                            type="time"
                                            className="form-control"
                                            id="shift_start_time"
                                            name="shift_start_time"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="shift_end_time" className="form-label">
                                            Shift End Time
                                        </label>
                                        <input 
                                            onChange={(event)=>{setShiftEndTime(event.target.value)}}
                                            value={shift_end_time}
                                            type="time"
                                            className="form-control"
                                            id="shift_end_time"
                                            name="shift_end_time"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button"
                                    onClick={handleCancel} 
                                    className="btn btn-outline"
                                    disabled={isSaving}
                                >
                                    <i className="bi bi-x-circle"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Update Allocation
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default EmpProjAlocEdit;