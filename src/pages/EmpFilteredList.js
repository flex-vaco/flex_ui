import React, { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from "react-router-dom"
import axios from 'axios'
import Layout from "../components/Layout"
import EmployeeProfileCard from '../components/employee/EmploeeProfileCard'
import EmployeeProfileModal from '../components/employee/EmployeeProfileModal'
import $ from 'jquery';


function EmpFilteredList() {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const {technologies} = useLocation().state;
    const [selectedSecondarySkill, setSelectedSecondarySkill] = useState([]);
    const [empList, setEmpList] = useState([])
    const [empFilteredList, setEmpFilteredList] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedExp, setSelectedExp] = useState('');
    const [selectedAvailability, setSelectedAvailability] = useState('');
    const [techSkills, setTechSkills] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [empModalDetails, setEmpModalDetails] = useState({
        first_name: '',
        last_name: '',
        status: '',
        email: '',
        designation: '',
        primary_skills: '',
        secondary_skills: '',
        education: '',
        profile_information: '',
        total_work_experience_years: '',
        rate_per_hour: '',
        vaco_join_date: '',
        home_location_city: '',
        office_location_city: '',
        manager_name: '',
        manager_email: '',
        is_onsite: '',
        resume: '',
        profile_picture: '',
    })

    function openModal(empId) {
        axios.get(`/employees/${empId}`)
            .then(function (response) {
                setEmpModalDetails(response.data.employees[0])
            })
            .catch(function (error) {
              console.log(error);
            })
        setIsOpen(true);
      }

    $(document).ready(function () {
        $('[data-toggle="offcanvas"]').click(function () {
            console.log('canavas');
          $('.row-offcanvas').addClass('active')
        });
        $('[data-toggle="offcanvasclose"]').click(function () {
            console.log('canavas');
          $('.row-offcanvas').removeClass('active')
        });
    });

    useEffect(() => {
        resetSecondarySkillUI();
        setSelectedSecondarySkill([]);
        fetchTechSkills();
        fetchEmpList();
    }, [technologies])

    useEffect(() => {
        if (isInitialLoad) {
            return;
        }
        fetchEmpList();
    }, [selectedLocation, selectedExp, selectedSecondarySkill, selectedAvailability])

    const resetSecondarySkillUI = () => {

        let secondarySkillCheckboxes = document.querySelectorAll('input[type=checkbox]');
        for(var i = 0; i < secondarySkillCheckboxes.length; i++) {
            secondarySkillCheckboxes[i].checked = false;   
        }
    }

    const filterBySecondarySkill = (empList) => {
        let empFilteredList = empList;
            if (selectedSecondarySkill.length > 0) {
                empFilteredList = empList.filter((emp) => {
                    let found = false;

                    selectedSecondarySkill.forEach((secondarySkill) => {
                        if (emp.secondary_skills.trim().toLowerCase().indexOf(secondarySkill.trim().toLowerCase()) >= 0) {
                            found = true;
                            return;    
                        }
                    }) 
                    return found;     
                });
            }
            setEmpFilteredList(empFilteredList);
    }

    const handleTechSkillChange = (event) => {
        setSelectedSecondarySkill((prev) => {
            if (event.target.checked) {
                return [event.target.value, ...prev];
            }
            else {
                return prev.filter((skill) => {
                    return skill !== event.target.value
                });
            }
        });
    }


    const fetchTechSkills = () => {
        axios.get(`/application/getTechnologies`, {
            params: {
                skill: technologies ? technologies?.split(',') : null,
            }
            })
            .then(function (response) {
                setTechSkills(response.data.technologies);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    const fetchEmpList = () => {
        setIsLoading(true);
        axios.get(`employees/filter`, {
            params: {
                skill: technologies ? technologies?.split(',') : null,
                exp: selectedExp >= 0 ? selectedExp : null,
                location: selectedLocation,           
                availability: selectedAvailability >= 0 ? selectedAvailability : null
            }
        }
        )
            .then(function (response) {
                
                setIsInitialLoad(false);
                setEmpList(response.data.employees);
                filterBySecondarySkill(response.data.employees);
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }



    return (
        <Layout>
            <div className="row-offcanvas row-offcanvas-right container-fluid float-left">
            <div className="col-xs-6 col-sm-2 sidebar-offcanvas sidebar_background float-left" id="sidebar">
            <button type="button" className="btn btn-primary btn-xs btn-close-white p-0 visible-xs" data-toggle="offcanvasclose"><i className="bi bi-chevron-left"></i></button>
            <p><i className="bi bi-funnel-fill"></i> Filter</p>
            <div className="col-12 h-100">
                            <div className="small">
                                Skills
                            </div>
                            <div className="col-12 skill_height">
                    {techSkills.map((techSkill,key) => {
                        return(<div className="form-check pe-1" key={`formCheck-${key}`} >
                                    <input className="form-check-input" type="checkbox" key={key}    onChange={handleTechSkillChange} value={techSkill} id={`flexCheckDefault-${key}`}/>
                                    <label className="form-check-label" htmlFor={`flexCheckDefault-${key}`}>
                                         {techSkill}
                                    </label>
                                </div>)
                    })
                    }
                    </div>
                    <hr className="style12 mb-3"></hr>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input placeholder='search locations'
                                        onChange={(event)=>{setSelectedLocation(event.target.value)}}
                                        type="text"
                                        className="form-control"
                                        id="location"
                                        name="location"/>
                    </div>
                    <hr className="style12 mb-3"></hr>
                    <div className="form-group"> 
                            <label htmlFor="exp">Experience</label>
                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedExp === 5} onChange={(event)=>{setSelectedExp(5)}} name="flexRadioDefault" />
                                    upto 5 years
                                </label>
                                </div>
                            <div>
                            
                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedExp === 10} onChange={(event)=>{setSelectedExp(10)}} name="flexRadioDefault" />
                                    upto 10 years
                                </label>
                            </div>
                                                        
                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedExp === 30} onChange={(event)=>{setSelectedExp(30)}} name="flexRadioDefault" />
                                    Show All
                                </label>
                            </div>
                            <div></div>

                            
                        <input type="range" 
                                className='multi-range'
                                value={selectedExp ? selectedExp : -1}
                                min="-1" 
                                max="20" 
                                onChange={(event)=>{setSelectedExp(event.target.value)}}
                                id="exp"
                             />
                        <div className='text-left'>
                            {selectedExp > 0 &&  (<label>{selectedExp} years</label>)}
                            
                        </div>
                        </div>
                    </div>
                    <hr className="style12 mb-3"></hr>
                    <div className="form-group"> 
                            <label htmlFor="exp">Availability</label>
                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedAvailability === -99} onChange={(event)=>{setSelectedAvailability(-99)}} name="radioAvailability" />
                                    Show All
                                </label>
                            </div>

                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedAvailability === 10} onChange={(event)=>{setSelectedAvailability(10)}} name="radioAvailability" />
                                    10 Hours/Week
                                </label>
                            </div>

                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedAvailability === 20} onChange={(event)=>{setSelectedAvailability(20)}} name="radioAvailability" />
                                    20 Hours/Week
                                </label>
                                </div>
                            <div>
                            
                            <div className="form-check">
                                <label className="form-check-label">
                                <input className="form-check-input" type="radio" checked={selectedAvailability === 40} onChange={(event)=>{setSelectedAvailability(40)}} name="radioAvailability" />
                                    40 Hours/Week
                                </label>
                                </div>
                            <div></div>

                            
                        <input type="range" 
                                className='multi-range'
                                value={selectedAvailability ? selectedAvailability : 0}
                                min="0" 
                                max="40" 
                                onChange={(event)=>{setSelectedAvailability(event.target.value)}}
                                id="exp"
                             />
                        <div className='text-left'>
                            {selectedAvailability > 0 &&  (<label>{selectedAvailability} Hours</label>)}
                        </div>
                        </div>
                    </div>
                </div>
</div>
    <div className="col-xs-12 search_results col-sm-12 col-md-10 float-left col-12">
        <p className="pull-right visible-xs banner_background">
            <button type="button" className="btn btn-primary btn-xs" data-toggle="offcanvas"><i className="bi bi-sliders"></i></button>
            <h4 className="banner_header">Find Your Required Talent</h4>
        </p>
        <div className="col-xs-12 col-lg-12 mx-1">
            {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '5rem', height: '5rem', borderWidth: '0.4em' }}>
                        <span className="sr-only"></span>
                    </div>
                </div>
            ) : (
                (empFilteredList?.length > 0) ? empFilteredList.map((empDetails, key) => (
                    <EmployeeProfileCard 
                        availability={selectedAvailability}
                        handleProfileClick={openModal}
                        employee={empDetails}
                        key={key}
                    />
                )) : (
                    <div className="d-flex justify-content-center">
                        <h2><br/><br/><br/>Resources Not Found!</h2>
                    </div>
                )
            )}
                                        
        </div>
        <EmployeeProfileModal modelstatus={modalIsOpen} close={() => setIsOpen(false)} employee={empModalDetails}/>                            
    </div>
</div>
</Layout>
);
}

export default EmpFilteredList;