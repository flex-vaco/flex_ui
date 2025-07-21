import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import * as AppFunc from "../lib/AppFunctions";

function EmpEdit() {
    const [emp_id, setId] = useState(useParams().id)
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [primary_skills, setPrimarySkills] = useState('');
    const [secondary_skills, setSecondarySkills] = useState('');
    const [education, setEducation] = useState('');
    const [profile_information, setProfileInformation] = useState('');
    const [total_work_experience_years, setTotWorkExp] = useState('');
    const [rate_per_hour, setRatePerHour] = useState('');
    const [home_location_city, setHomeLocCity] = useState('');
    const [office_location_city, setOfficeLocCity] = useState('-select-');
    const [designation, setDesignation] = useState('');
    const [status, setStatus] = useState('');
    const [manager_name, setManagerName] = useState('');
    const [manager_email, setManagerEmail] = useState('');
    const [vaco_join_date, setVacoJoinDate] = useState('');
    const [email, setEmail] = useState('');
    const [is_onsite, setIsOnsite] = useState(false);
    const [employment_type, setSelectedEmpType] = useState('Full-time');
    const [resumeFileName, setResumeFileName] = useState('');
    const [profilePicFileName, setProfilePicFileName] = useState('');
    const [selected_resume, setSelectedResume] = useState(null);
    const [profile_picture, setSelectedProfilePicture] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const [manager_id, setSelectedManager] = useState("-select-");
    const [managerList, setManagerList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    
    // New fields from create form
    const [functional_focus, setFunctionalFocus] = useState('-select-');
    const [vaco_division, setVacoDivision] = useState('-select-');
    const [core_skillset, setCoreSkillset] = useState([]);
    const [revenue_company_size, setRevenueCompanySize] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [software_erp_experience, setSoftwareErpExperience] = useState([]);
    const [hours_preference, setHoursPreference] = useState('40.00');

    // Options for new fields
    const functionalFocusOptions = ['A/F', 'HR', 'Technology', 'Marketing', 'Operations'];
    const vacoDivisionOptions = ['VR', 'VS', 'VT'];
    const coreSkillsetOptions = ['Java', 'React', 'Node', 'Python', 'Angular'];
    const revenueCompanySizeOptions = ['<$10M', '$10M-$100M', '$100M-$1B', '$1B+'];
    const industriesOptions = ['Healthcare', 'Finance', 'Retail', 'Technology', 'Manufacturing'];
    const softwareErpExperienceOptions = ['SAP', 'Oracle', 'Dynamics', 'NetSuite', 'QuickBooks'];

    useEffect(() => {
        const configs = {
            headers: {
              "Content-Type": "application/json",
            },
        };
        const datas = {
            role: 'manager',
        };
  
        axios.post('/users/getUserByRole', datas, configs)
        .then(function (response) {
          setManagerList(response.data.users);
        })
        .catch(function (error) {
          console.log(error);
        })
    }, [locationList]);

    useEffect(() => {
        fetchLocationList();
    }, []);

    const handleManagerChange = (event) => {
        const selectedManagerId = event.target.value;
        setSelectedManager(selectedManagerId);

        const selectedManagerDetails = managerList.find((manager) => manager.user_id == selectedManagerId);
        if (selectedManagerDetails) {
            setManagerName(`${selectedManagerDetails.first_name} ${selectedManagerDetails.last_name}`);
            setManagerEmail(selectedManagerDetails.email);
        } else {
            setManagerName('');
            setManagerEmail('');
        }
    };

    const fetchLocationList = () => {
        axios.get('/officeLocation')
        .then(function (response) {
          setLocationList(response.data.locations);
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const httpConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
    
    useEffect(() => {
        axios.get(`/employees/${emp_id}`)
        .then(function (response) {
            let empDetails = response.data.employees[0];
            setFirstName(empDetails.first_name);
            setLastName(empDetails.last_name);
            setPrimarySkills(empDetails.primary_skills);
            setSecondarySkills(empDetails.secondary_skills);
            setEducation(empDetails.education);
            setProfileInformation(empDetails.profile_information);
            setTotWorkExp(empDetails.total_work_experience_years);
            setRatePerHour(empDetails.rate_per_hour);
            setVacoJoinDate(Utils.formatDateYYYYMMDD(empDetails.vaco_join_date));
            setHomeLocCity(empDetails.home_location_city);
            setOfficeLocCity(empDetails.office_location_city);
            setDesignation(empDetails.designation);
            setStatus(empDetails.status);
            setEmail(empDetails.email);
            setIsOnsite(empDetails.is_onsite);
            setSelectedEmpType(empDetails.employment_type);
            setResumeFileName(empDetails.resume);
            setProfilePicFileName(empDetails.profile_picture);
            
            // Set new fields from response
            setFunctionalFocus(empDetails.functional_focus_area || '-select-');
            setVacoDivision(empDetails.highspring_division || '-select-');
            setCoreSkillset(empDetails.primary_skills ? empDetails.primary_skills.split(',') : []);
            setRevenueCompanySize(empDetails.max_company_revenue_size ? empDetails.max_company_revenue_size.split(',') : []);
            setIndustries(empDetails.industries_experience ? empDetails.industries_experience.split(',') : []);
            setSoftwareErpExperience(empDetails.erp_software_experience ? empDetails.erp_software_experience.split(',') : []);
            setHoursPreference(empDetails.max_work_hours_prefered || '40.00');

            const selectedManagerDetails = managerList.find((manager) => manager.email === empDetails.manager_email);
            if (selectedManagerDetails) {
                setSelectedManager(selectedManagerDetails.user_id);
                setManagerName(`${selectedManagerDetails.first_name} ${selectedManagerDetails.last_name}`);
                setManagerEmail(selectedManagerDetails.email);
            } else {
                setManagerName('');
                setManagerEmail('');
            }
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
        })
          
    }, [managerList])
  
    const handleEmpTypeChange = (event) => {
        setSelectedEmpType(event.target.value);
    }
    
    let statusOptions = '';
    const getStatusOptions = () => {
        const validStatuses = ['Active', 'Inactive'];
        validStatuses.forEach(s => {
            statusOptions = statusOptions+`<option value=${s}>${s}</option> `
        });
    }

    const handleResumeChange = (e) => {
        if (AppFunc.validateUploadFile(e.target.files[0], "resume")) {
            setSelectedResume(e.target.files[0]);
        } else {
            document.getElementById("resume").value = null;
        }
    };
    
    const handleProfileChange = (e) => {
        if (AppFunc.validateUploadFile(e.target.files[0], "image")) {
            setSelectedProfilePicture(e.target.files[0]);
        } else {
            document.getElementById("profile_picture").value = null;
        }    
    };

    getStatusOptions();
    const handleSave = () => {
        setIsSaving(true);
        var onSite = Number(is_onsite);
        const data = new FormData();
        data.append('first_name', first_name);
        data.append('last_name', last_name);
        data.append('status', status);
        data.append('email', email);
        data.append('designation', designation);
        data.append('primary_skills', primary_skills);
        data.append('secondary_skills', secondary_skills);
        data.append('education', education);
        data.append('profile_information', profile_information);
        data.append('total_work_experience_years', total_work_experience_years);
        data.append('rate_per_hour', rate_per_hour);
        data.append('vaco_join_date', vaco_join_date);
        data.append('home_location_city', home_location_city);
        data.append('office_location_city', office_location_city);
        data.append('manager_name', manager_name);
        data.append('manager_email', manager_email);
        data.append('manager_id', manager_id);
        data.append('is_onsite', onSite);
        data.append('employment_type', employment_type);
        data.append('profile_pic_file_name', profilePicFileName);
        data.append('resume_file_name', resumeFileName);
        
        // Add new fields to FormData
        data.append('functional_focus_area', functional_focus);
        data.append('highspring_division', vaco_division);
        data.append('primary_skills', core_skillset.join(','));
        data.append('max_company_revenue_size', revenue_company_size.join(','));
        data.append('industries_experience', industries.join(','));
        data.append('erp_software_experience', software_erp_experience.join(','));  
        data.append('max_work_hours_prefered', hours_preference);
        
        if(selected_resume) data.append('resume', selected_resume);
        if(profile_picture) data.append('profile_picture', profile_picture);

        axios.post(`/employees/update/${emp_id}`, data, {config:httpConfig})
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Employee updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/employees");
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
                        <h4 className="text-center">Edit Resource Details</h4>
                    </div>
                    <div className="card-body">
                        <form className="row g-3 align-items-center">
                            <div className="form-group col-md-6">
                                <label htmlFor="first_name">First Name</label>
                                <input 
                                    onChange={(event)=>{setFirstName(event.target.value)}}
                                    value={first_name}
                                    type="text"
                                    className="form-control"
                                    id="first_name"
                                    name="first_name"/>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="last_name">Last Name</label>
                                <input 
                                    onChange={(event)=>{setLastName(event.target.value)}}
                                    value={last_name}
                                    type="text"
                                    className="form-control"
                                    id="last_name"
                                    name="last_name"/>
                            </div>
                            <div className="form-group col-md-4">
                                <label htmlFor="email">Email ID</label>
                                <input 
                                    onChange={(event)=>{setEmail(event.target.value)}}
                                    value={email}
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"/>
                            </div>
                            <div className="form-group col-md-4">
                                <label htmlFor="total_work_experience_years">Total Experience</label>
                                <input 
                                    onChange={(event)=>{setTotWorkExp(event.target.value)}}
                                    value={total_work_experience_years}
                                    type="number"
                                    className="form-control"
                                    id="total_work_experience_years"
                                    name="total_work_experience_years"/>
                            </div>
                            <div className="form-group col-md-4">
                                <label htmlFor="rate_per_hour">Rate Per Hour (USD)</label>
                                <input 
                                    onChange={(event)=>{setRatePerHour(event.target.value)}}
                                    value={rate_per_hour}
                                    type="number"
                                    className="form-control"
                                    id="rate_per_hour"
                                    name="rate_per_hour"/>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="primary_skills">Primary Skills (use comma to seperate skills)</label>
                                <textarea 
                                    value={primary_skills}
                                    onChange={(event)=>{setPrimarySkills(event.target.value)}}
                                    className="form-control"
                                    id="primary_skills"
                                    rows="3"
                                    name="primary_skills"></textarea>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="secondary_skills">Secondary Skills (use comma to seperate skills)</label>
                                <textarea 
                                    value={secondary_skills}
                                    onChange={(event)=>{setSecondarySkills(event.target.value)}}
                                    className="form-control"
                                    id="secondary_skills"
                                    rows="3"
                                    name="secondary_skills"></textarea>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="education">Education</label>
                                <textarea 
                                    value={education}
                                    onChange={(event)=>{setEducation(event.target.value)}}
                                    className="form-control"
                                    id="education"
                                    rows="3"
                                    name="education"></textarea>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="profile_information">Profile Information</label>
                                <textarea 
                                    value={profile_information}
                                    onChange={(event)=>{setProfileInformation(event.target.value)}}
                                    className="form-control"
                                    id="profile_information"
                                    rows="3"
                                    name="profile_information"></textarea>
                            </div>
                            <div className="form-group col-md-3">
                                <label htmlFor="designation">Designation</label>
                                <input 
                                    onChange={(event)=>{setDesignation(event.target.value)}}
                                    value={designation}
                                    type="text"
                                    className="form-control"
                                    id="designation"
                                    name="designation"/>
                            </div>
                            <div className="form-group col-md-2">
                                <label htmlFor="resume">Employment Type</label><br/>
                                
                                <label htmlFor="employment_type" className="radio_emptype">
                                <input
                                    type="radio"
                                    value="Full-time"
                                    className="form-check-input"
                                    checked={employment_type === 'Full-time'}
                                    name="employment_type"
                                    onChange={handleEmpTypeChange}
                                />
                                <small className="fw-bold">  Full Time</small>
                                </label>

                                <label htmlFor="employment_type" className="radio_emptype">
                                <input
                                    type="radio"
                                    value="Part-time"
                                    className="form-check-input"
                                    checked={employment_type === 'Part-time'}
                                    name="employment_type"
                                    onChange={handleEmpTypeChange}
                                />
                                <small className="fw-bold">  Part Time</small>
                                </label>
                            </div>
                            <div className="form-group col-md-3">
                                <label htmlFor="vaco_join_date">Joining Date at Vaco</label>
                                <input 
                                    onChange={(event)=>{setVacoJoinDate(event.target.value)}}
                                    value={vaco_join_date}
                                    type="date"
                                    className="form-control"
                                    id="vaco_join_date"
                                    name="vaco_join_date"/>
                            </div>
                            <div className="form-group col-md-2 align-items-center">
                                <label htmlFor="is_onsite">Is working On-site?</label><br/>
                                <input 
                                    type="checkbox"
                                    checked={is_onsite}
                                    className="form-check-input"
                                    id="is_onsite"
                                    name="is_onsite"
                                    onChange={()=>{setIsOnsite(!is_onsite)}}
                                    />
                            </div>
                            <div className="form-group col-md-2">
                                <label htmlFor="status">Status</label>
                                <select name="status" id="status" className="form-control" value={status} onChange={(event)=>{setStatus(event.target.value)}}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="home_location_city">Home Location City</label>
                                <input 
                                    onChange={(event)=>{setHomeLocCity(event.target.value)}}
                                    value={home_location_city}
                                    type="text"
                                    className="form-control"
                                    id="home_location_city"
                                    name="home_location_city"/>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="office_location_city">Office Location City</label>
                                <select name="office_location_city" id="office_location_city" value={office_location_city} className="form-control" onChange={(event)=>{setOfficeLocCity(event.target.value)}}> 
                                    <option value="-select-" > -- Select Location -- </option>
                                    {locationList.map((location) => <option key={location.office_location_city} value={location.office_location_city}>{location.office_location_city}</option>)}    
                                </select>
                            </div>
                            
                            {/* New Fields */}
                            <div className="form-group col-md-4">
                                <label htmlFor="functional_focus">Functional Focus</label>
                                <select
                                    id="functional_focus"
                                    className="form-control"
                                    value={functional_focus}
                                    onChange={(e) => setFunctionalFocus(e.target.value)}
                                >
                                    <option value="-select-">-- Select Functional Focus --</option>
                                    {functionalFocusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group col-md-4">
                                <label htmlFor="vaco_division">Vaco Division</label>
                                <select
                                    id="vaco_division"
                                    className="form-control"
                                    value={vaco_division}
                                    onChange={(e) => setVacoDivision(e.target.value)}
                                >
                                    <option value="-select-">-- Select Division --</option>
                                    {vacoDivisionOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group col-md-4">
                                <label htmlFor="core_skillset">Core Skillset (Top 3)</label>
                                <select
                                    id="core_skillset"
                                    multiple
                                    className="form-control"
                                    value={core_skillset}
                                    onChange={(e) => setCoreSkillset(Array.from(e.target.selectedOptions, option => option.value))}
                                >
                                    {coreSkillsetOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group col-md-4">
                                <label htmlFor="revenue_company_size">Revenue / Company Size Experience</label>
                                <select
                                    id="revenue_company_size"
                                    multiple
                                    className="form-control"
                                    value={revenue_company_size}
                                    onChange={(e) => setRevenueCompanySize(Array.from(e.target.selectedOptions, option => option.value))}
                                >
                                    {revenueCompanySizeOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group col-md-4">
                                <label htmlFor="industries">Industries (Top 3)</label>
                                <select
                                    id="industries"
                                    multiple
                                    className="form-control"
                                    value={industries}
                                    onChange={(e) => setIndustries(Array.from(e.target.selectedOptions, option => option.value))}
                                >
                                    {industriesOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group col-md-4">
                                <label htmlFor="software_erp_experience">Software / ERP Experience</label>
                                <select
                                    id="software_erp_experience"
                                    multiple
                                    className="form-control"
                                    value={software_erp_experience}
                                    onChange={(e) => setSoftwareErpExperience(Array.from(e.target.selectedOptions, option => option.value))}
                                >
                                    {softwareErpExperienceOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group col-md-6">
                                <label htmlFor="hours_preference">Hours Preference</label>
                                <select
                                    id="hours_preference"
                                    className="form-control"
                                    value={hours_preference}
                                    onChange={(e) => setHoursPreference(e.target.value)}
                                >
                                    <option value="40.00">40 hours</option>
                                    <option value="45.00">Open to Excess Hours (&gt; 40)</option>
                                </select>
                            </div>
                            
                            <div className="form-group col-md-6">
                                <label htmlFor="manager_name">Manager Name</label>
                                <select name="managerId" id="managerId" value={manager_id} className="form-control" onChange={handleManagerChange}> 
                                    <option value="-select-" > -- Select Manager -- </option>
                                    {managerList.map((manager) => <option key={manager.user_id} value={manager.user_id}>{manager.first_name}, {manager.last_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="manager_email">Manager Email</label>
                                <input 
                                    onChange={(event)=>{setManagerEmail(event.target.value)}}
                                    value={manager_email}
                                    type="email"
                                    className="form-control"
                                    id="manager_email"
                                    name="manager_email"
                                    readOnly
                                    />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="resume">Resume</label>
                                <div className="input-group">
                                <span style={{width:"35%"}} className="input-group-text fw-bold">{resumeFileName}</span>

                                    <input
                                    id="resume"
                                    type="file"
                                    name="resume"
                                    className="form-control"
                                    onChange={handleResumeChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="profile_picture">Profile Picture</label>
                                <div className="input-group">
                                <span style={{width:"35%"}} className="input-group-text fw-bold">{profilePicFileName}</span>
                                    <input
                                    id="profile_picture"
                                    type="file"
                                    name="profile_picture"
                                    className="form-control"
                                    onChange={handleProfileChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group col-md-6 align-items-center">
                                <Link 
                                    to="/employees"
                                    disabled={isSaving}
                                    className="btn btn-outline-light mt-3 me-3">
                                    Cancel
                                </Link>
                                <button 
                                    disabled={isSaving}
                                    onClick={handleSave} 
                                    type="button"
                                    className="btn btn-outline-info mt-3">
                                    Update Resource
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default EmpEdit;