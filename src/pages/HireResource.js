import React, {useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import EmployeeProfileCard from '../components/employee/EmploeeProfileCard'
import * as APP_FUNCTIONS from "../lib/AppFunctions";

function HireResource() {
    const loc = useLocation();
    const employee = useState(loc.state.employee);
    const [project_name, setProjectName] = useState('');
    const [work_location, setWorkLocation] = useState('Remote');
    const [start_date, setStartDate] = useState(null);
    const [end_date, setEndDate] = useState(null);
    const [shift_start_time, setShiftStartTime] = useState('');
    const [shift_end_time, setShiftEndTime] = useState('');
    const [comments, setComments] = useState('');
    const [hours_per_week, setHoursPerWeek] = useState(null);
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const [modalIsOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(false);
    }
    const handleWorkLocChange = (event) => {
        setWorkLocation(event.target.value);
    }
    const handleSave = () => {
        if(!APP_FUNCTIONS.validateForm(document.querySelectorAll('.needs-validation'))) return;
        Swal.showLoading();
        setIsSaving(true);
        const config = {
          headers: {
            "Content-Type": "application/json",
          }
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
                title: 'Request Succesfull!',
                text: 'Resource Manager will get back to you!',
                showConfirmButton: true
            }).then(res=>{
                if(res.isConfirmed){
                    Swal.hideLoading();
                    navigate("/home");
                    setIsSaving(false);
                }
            })
          })
          .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 2000
            })
            setIsSaving(false)
          });
    }
  
    return (
        <Layout>
            <div className="container">
                <div className="card row">
                    <div className="card-header">
                        <h4 className="text-center">{`Send a booking query for ${employee.first_name} ${employee.last_name}`}</h4>
                    </div>
                    <div className="card-body">
                        <div className="col">
                        <EmployeeProfileCard availability={40} handleProfileClick={openModal} employee={employee} />
                        </div>
                        <div className="col">
                        <form className="row g-3 align-items-center">
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="project_name" className="col-sm-2 col-form-label fs-6">Project Name</label>
                                <div className="col-sm-10">
                                <input 
                                    onChange={(event)=>{setProjectName(event.target.value)}}
                                    value={project_name}
                                    type="text"
                                    className="form-control"
                                    id="project_name"
                                    name="project_name"/>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="start_date" className="col-sm-2 col-form-label fs-6">Start Date *</label>
                                <div className="col-sm-10">
                                <input 
                                    onChange={(event)=>{setStartDate(event.target.value)}}
                                    value={start_date}
                                    type="date"
                                    className="form-control needs-validation"
                                    id="start_date"
                                    name="start_date"
                                    required/>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="end_date" className="col-sm-2 col-form-label fs-6">End Date *</label>
                                <div className="col-sm-10">
                                <input 
                                    onChange={(event)=>{setEndDate(event.target.value)}}
                                    value={end_date}
                                    type="date"
                                    className="form-control needs-validation"
                                    id="end_date"
                                    name="end_date"
                                    required/>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="hours_per_week" className="col-sm-2 col-form-label fs-6">Hours per Week*</label>
                                <div className="col-sm-10">
                                <input 
                                    onChange={(event)=>{setHoursPerWeek(event.target.value)}}
                                    value={hours_per_week}
                                    type="number"
                                    className="form-control needs-validation"
                                    id="hours_per_week"
                                    name="hours_per_week"
                                    required/>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="work_location" className="col-sm-2 col-form-label fs-6">Location</label><br/>
                                <div className="col-sm-10">
                                <input
                                    type="radio"
                                    value="Remote"
                                    className="form-check-input"
                                    checked={work_location === 'Remote'}
                                    name="work_location"
                                    onChange={handleWorkLocChange}
                                />
                                <label className="radio_emptype fs-6">
                                    Remote
                                </label>
                                <input
                                    type="radio"
                                    value="Office"
                                    className="form-check-input"
                                    checked={work_location === 'Office'}
                                    name="work_location"
                                    onChange={handleWorkLocChange}
                                />
                                <label className="radio_emptype fs-6">
                                    Office
                                </label>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="shift_start_time" className="col-sm-2 col-form-label fs-6">Shift Start Time</label>
                                <div className="col-sm-10">
                                <input 
                                    onChange={(event)=>{setShiftStartTime(event.target.value)}}
                                    value={shift_start_time}
                                    type="time"
                                    className="form-control"
                                    id="shift_start_time"
                                    name="shift_start_time"/>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="shift_end_time" className="col-sm-2 col-form-label fs-6">Shift End Time</label>
                                <div className="col-sm-10">
                                <input 
                                    onChange={(event)=>{setShiftEndTime(event.target.value)}}
                                    value={shift_end_time}
                                    type="time"
                                    className="form-control"
                                    id="shift_end_time"
                                    name="shift_end_time"/>
                                </div>
                            </div>
                            <div className="form-group row mt-3 mb-2">
                                <label htmlFor="comments" className="col-sm-2 col-form-label fs-6">Comments</label>
                                <div className="col-sm-10">
                                <textarea 
                                    value={comments}
                                    onChange={(event)=>{setComments(event.target.value)}}
                                    className="form-control"
                                    id="comments"
                                    rows="3"
                                    name="comments"></textarea>
                                </div>
                            </div>
                            <div className="d-flex form-group justify-content-center">
                            <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="submit"
                                className="btn btn-outline-primary mt-3 me-3 float-middle">
                                Submit
                            </button>
                            </div>
                            <p className="d-flex form-group justify-content-center fs-6 fst-italic fw-lighter">
                                Submitting will raise a request for someone from the Vaco Binary team to get in touch with you.
                            </p>
                        </form>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
  
export default HireResource;