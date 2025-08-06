import React, {useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import EmployeeProfileCard from '../components/employee/EmploeeProfileCard'
import * as APP_FUNCTIONS from "../lib/AppFunctions";
import "./FormStyles.css"

function HireResource() {
    const loc = useLocation();
    const employee = loc.state.employee;
    const [project_name, setProjectName] = useState('');
    const [work_location, setWorkLocation] = useState('Remote');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const [shift_start_time, setShiftStartTime] = useState('');
    const [shift_end_time, setShiftEndTime] = useState('');
    const [comments, setComments] = useState('');
    const [hours_per_week, setHoursPerWeek] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const [modalIsOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(false);
    }

    const handleCancel = () => {
        navigate("/home");
    }

    const handleWorkLocChange = (event) => {
        setWorkLocation(event.target.value);
    }

    const handleSave = () => {
        if(!APP_FUNCTIONS.validateForm(document.querySelectorAll('.needs-validation'))) return;
        
        setIsSaving(true);
        const config = {
          headers: {
            "Content-Length": 0,
            "Content-Type": "application/json",
          },
          responseType: "text",
        };
        const data = {
          project_name: project_name,
          emp_id: employee.emp_id,
          work_location: work_location,
          start_date: start_date,
          end_date: end_date,
          shift_start_time: shift_start_time,
          shift_end_time: shift_end_time,
          hours_per_week: hours_per_week,
          comments: comments,
          hiring_status: "enquired",
          employeeDetails: employee
        };
        axios.post('/hirings/add', data, config)
          .then((response) => {
            Swal.fire({
                icon: 'success',
                title: 'Request Successful!',
                text: 'Resource Manager will get back to you!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/home");
            setIsSaving(false);
            // Reset form
            setProjectName('');
            setWorkLocation('Remote');
            setStartDate('');
            setEndDate('');
            setShiftStartTime('');
            setShiftEndTime('');
            setComments('');
            setHoursPerWeek('');
          })
          .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occurred!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false)
          });
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">
                            Send Booking Query for {employee.first_name} {employee.last_name}
                        </h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>

                            <div className="form-section">
                                <h3 className="form-section-title">Project Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="project_name" className="form-label">
                                            Project Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setProjectName(event.target.value)}}
                                            value={project_name}
                                            type="text"
                                            className="form-control"
                                            id="project_name"
                                            name="project_name"
                                            placeholder="Enter project name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="hours_per_week" className="form-label required-field">
                                            Hours per Week
                                        </label>
                                        <input 
                                            onChange={(event)=>{setHoursPerWeek(event.target.value)}}
                                            value={hours_per_week}
                                            type="number"
                                            className="form-control needs-validation"
                                            id="hours_per_week"
                                            name="hours_per_week"
                                            placeholder="Enter hours per week"
                                            min="1"
                                            max="40"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Work Location</label>
                                        <div className="radio-group">
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    value="Remote"
                                                    checked={work_location === 'Remote'}
                                                    name="work_location"
                                                    onChange={handleWorkLocChange}
                                                />
                                                <span>Remote</span>
                                            </label>
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    value="Office"
                                                    checked={work_location === 'Office'}
                                                    name="work_location"
                                                    onChange={handleWorkLocChange}
                                                />
                                                <span>Office</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Project Timeline</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="start_date" className="form-label required-field">
                                            Start Date
                                        </label>
                                        <input 
                                            onChange={(event)=>{setStartDate(event.target.value)}}
                                            value={start_date}
                                            type="date"
                                            className="form-date needs-validation"
                                            id="start_date"
                                            name="start_date"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="end_date" className="form-label required-field">
                                            End Date
                                        </label>
                                        <input 
                                            onChange={(event)=>{setEndDate(event.target.value)}}
                                            value={end_date}
                                            type="date"
                                            className="form-date needs-validation"
                                            id="end_date"
                                            name="end_date"
                                            required
                                        />
                                    </div>
                                </div>
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

                            <div className="form-section">
                                <h3 className="form-section-title">Additional Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="comments" className="form-label">
                                        Comments
                                    </label>
                                    <textarea 
                                        value={comments}
                                        onChange={(event)=>{setComments(event.target.value)}}
                                        className="form-textarea"
                                        id="comments"
                                        name="comments"
                                        placeholder="Enter any additional comments or requirements"
                                        rows="4"
                                    ></textarea>
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
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        
                        <p className="form-note">
                            Submitting will raise a request for someone from the team to get in touch with you.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default HireResource;