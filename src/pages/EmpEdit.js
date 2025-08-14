import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import * as AppFunc from "../lib/AppFunctions";
import "./FormStyles.css";

function EmpEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [secondary_skills, setSecondarySkills] = useState('');
    const [education, setEducation] = useState('');
    const [profile_information, setProfileInformation] = useState('');
    const [total_work_experience_years, setTotWorkExp] = useState('');
    const [cost_per_hour, setCostPerHour] = useState('');
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
    const [isLoading, setIsLoading] = useState(true);
    const [manager_id, setSelectedManager] = useState("-select-");
    const [managerList, setManagerList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    
    // New fields from create form
    const [functional_focus, setFunctionalFocus] = useState('-select-');
    const [vaco_division, setVacoDivision] = useState('-select-');
    const [core_skillset, setCoreSkillset] = useState('');
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
        axios.get(`/employees/${id}`)
        .then(function (response) {
            let empDetails = response.data.employees[0];
            setFirstName(empDetails.first_name);
            setLastName(empDetails.last_name);
            setSecondarySkills(empDetails.secondary_skills);
            setEducation(empDetails.education);
            setProfileInformation(empDetails.profile_information);
            setTotWorkExp(empDetails.total_work_experience_years);
            setCostPerHour(empDetails.cost_per_hour);
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
            setCoreSkillset(empDetails.primary_skills || '');
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
        })
          
    }, [managerList, id])
  
    const handleEmpTypeChange = (event) => {
        setSelectedEmpType(event.target.value);
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

    const handleSave = () => {
        if (!first_name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter first name!',
                showConfirmButton: true
            })
            return;
        }

        if (!last_name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter last name!',
                showConfirmButton: true
            })
            return;
        }

        if (!email.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter email!',
                showConfirmButton: true
            })
            return;
        }

        if (!designation.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter designation!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        var onSite = Number(is_onsite);
        const data = new FormData();
        data.append('first_name', first_name);
        data.append('last_name', last_name);
        data.append('status', status);
        data.append('email', email);
        data.append('designation', designation);
        data.append('secondary_skills', secondary_skills);
        data.append('education', education);
        data.append('profile_information', profile_information);
        data.append('total_work_experience_years', total_work_experience_years);
        data.append('cost_per_hour', cost_per_hour);
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
        data.append('primary_skills', core_skillset);
        data.append('max_company_revenue_size', revenue_company_size.join(','));
        data.append('industries_experience', industries.join(','));
        data.append('erp_software_experience', software_erp_experience.join(','));  
        data.append('max_work_hours_prefered', hours_preference);
        
        if(selected_resume) data.append('resume', selected_resume);
        if(profile_picture) data.append('profile_picture', profile_picture);

        axios.post(`/employees/update/${id}`, data, {config:httpConfig})
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Employee updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/employees");
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

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Resource Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading resource details...</p>
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
                        <h1 className="form-page-title">Edit Resource Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Basic Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="first_name" className="form-label required-field">
                                            First Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setFirstName(event.target.value)}}
                                            value={first_name}
                                            type="text"
                                            className="form-control"
                                            id="first_name"
                                            name="first_name"
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="last_name" className="form-label required-field">
                                            Last Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setLastName(event.target.value)}}
                                            value={last_name}
                                            type="text"
                                            className="form-control"
                                            id="last_name"
                                            name="last_name"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label required-field">
                                            Email ID
                                        </label>
                                        <input 
                                            onChange={(event)=>{setEmail(event.target.value)}}
                                            value={email}
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="designation" className="form-label required-field">
                                            Designation
                                        </label>
                                        <input 
                                            onChange={(event)=>{setDesignation(event.target.value)}}
                                            value={designation}
                                            type="text"
                                            className="form-control"
                                            id="designation"
                                            name="designation"
                                            placeholder="Enter designation"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Experience & Skills</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="total_work_experience_years" className="form-label">
                                            Total Experience (Years)
                                        </label>
                                        <input 
                                            onChange={(event)=>{setTotWorkExp(event.target.value)}}
                                            value={total_work_experience_years}
                                            type="number"
                                            className="form-control"
                                            id="total_work_experience_years"
                                            name="total_work_experience_years"
                                            placeholder="Enter years of experience"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cost_per_hour" className="form-label">
                                            Rate Per Hour (USD)
                                        </label>
                                        <input 
                                            onChange={(event)=>{setCostPerHour(event.target.value)}}
                                            value={cost_per_hour}
                                            type="number"
                                            className="form-control"
                                            id="cost_per_hour"
                                            name="cost_per_hour"
                                            placeholder="Enter hourly rate"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="core_skillset" className="form-label required-field">
                                        Core Skillset
                                    </label>
                                    <textarea 
                                        value={core_skillset}
                                        onChange={(event)=>{setCoreSkillset(event.target.value)}}
                                        className="form-textarea"
                                        id="core_skillset"
                                        name="core_skillset"
                                        placeholder="Enter core skills (comma separated)"
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="secondary_skills" className="form-label">
                                        Secondary Skills
                                    </label>
                                    <textarea 
                                        value={secondary_skills}
                                        onChange={(event)=>{setSecondarySkills(event.target.value)}}
                                        className="form-textarea"
                                        id="secondary_skills"
                                        name="secondary_skills"
                                        placeholder="Enter secondary skills (comma separated)"
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Education & Profile</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="education" className="form-label">
                                        Education
                                    </label>
                                    <textarea 
                                        value={education}
                                        onChange={(event)=>{setEducation(event.target.value)}}
                                        className="form-textarea"
                                        id="education"
                                        name="education"
                                        placeholder="Enter education details"
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="profile_information" className="form-label">
                                        Profile Information
                                    </label>
                                    <textarea 
                                        value={profile_information}
                                        onChange={(event)=>{setProfileInformation(event.target.value)}}
                                        className="form-textarea"
                                        id="profile_information"
                                        name="profile_information"
                                        placeholder="Enter profile information"
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Employment Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="employment_type" className="form-label">
                                            Employment Type
                                        </label>
                                        <div style={{ marginTop: '8px' }}>
                                            <label className="radio_emptype" style={{ marginRight: '20px' }}>
                                                <input
                                                    type="radio"
                                                    value="Full-time"
                                                    className="form-check-input"
                                                    checked={employment_type === 'Full-time'}
                                                    name="employment_type"
                                                    onChange={handleEmpTypeChange}
                                                />
                                                <span style={{ marginLeft: '8px' }}>Full Time</span>
                                            </label>
                                            <label className="radio_emptype">
                                                <input
                                                    type="radio"
                                                    value="Part-time"
                                                    className="form-check-input"
                                                    checked={employment_type === 'Part-time'}
                                                    name="employment_type"
                                                    onChange={handleEmpTypeChange}
                                                />
                                                <span style={{ marginLeft: '8px' }}>Part Time</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="vaco_join_date" className="form-label">
                                            Joining Date at Vaco
                                        </label>
                                        <input 
                                            onChange={(event)=>{setVacoJoinDate(event.target.value)}}
                                            value={vaco_join_date}
                                            type="date"
                                            className="form-date"
                                            id="vaco_join_date"
                                            name="vaco_join_date"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="status" className="form-label">
                                            Status
                                        </label>
                                        <select 
                                            name="status" 
                                            id="status" 
                                            className="form-select" 
                                            value={status} 
                                            onChange={(event)=>{setStatus(event.target.value)}}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="is_onsite" className="form-label">
                                            Working On-site?
                                        </label>
                                        <div style={{ marginTop: '8px' }}>
                                            <input 
                                                type="checkbox"
                                                checked={is_onsite}
                                                className="form-check-input"
                                                id="is_onsite"
                                                name="is_onsite"
                                                onChange={()=>{setIsOnsite(!is_onsite)}}
                                            />
                                            <span style={{ marginLeft: '8px' }}>Yes, working on-site</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Location Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="home_location_city" className="form-label">
                                            Home Location City
                                        </label>
                                        <input 
                                            onChange={(event)=>{setHomeLocCity(event.target.value)}}
                                            value={home_location_city}
                                            type="text"
                                            className="form-control"
                                            id="home_location_city"
                                            name="home_location_city"
                                            placeholder="Enter home location city"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="office_location_city" className="form-label">
                                            Office Location City
                                        </label>
                                        <select 
                                            name="office_location_city" 
                                            id="office_location_city" 
                                            className="form-select" 
                                            value={office_location_city} 
                                            onChange={(event)=>{setOfficeLocCity(event.target.value)}}
                                        > 
                                            <option value="-select-"> -- Select Location -- </option>
                                            {locationList.map((location) => (
                                                <option key={location.office_location_city} value={location.office_location_city}>
                                                    {location.office_location_city}
                                                </option>
                                            ))}    
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Professional Focus</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="functional_focus" className="form-label">
                                            Functional Focus
                                        </label>
                                        <select
                                            id="functional_focus"
                                            className="form-select"
                                            value={functional_focus}
                                            onChange={(e) => setFunctionalFocus(e.target.value)}
                                        >
                                            <option value="-select-">-- Select Functional Focus --</option>
                                            {functionalFocusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="vaco_division" className="form-label">
                                            Vaco Division
                                        </label>
                                        <select
                                            id="vaco_division"
                                            className="form-select"
                                            value={vaco_division}
                                            onChange={(e) => setVacoDivision(e.target.value)}
                                        >
                                            <option value="-select-">-- Select Division --</option>
                                            {vacoDivisionOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="hours_preference" className="form-label">
                                            Hours Preference
                                        </label>
                                        <select
                                            id="hours_preference"
                                            className="form-select"
                                            value={hours_preference}
                                            onChange={(e) => setHoursPreference(e.target.value)}
                                        >
                                            <option value="40.00">40 hours</option>
                                            <option value="45.00">Open to Excess Hours (&gt; 40)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="revenue_company_size" className="form-label">
                                            Revenue / Company Size Experience
                                        </label>
                                        <select
                                            id="revenue_company_size"
                                            multiple
                                            className="form-select"
                                            value={revenue_company_size}
                                            onChange={(e) => setRevenueCompanySize(Array.from(e.target.selectedOptions, option => option.value))}
                                        >
                                            {revenueCompanySizeOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="industries" className="form-label">
                                            Industries (Top 3)
                                        </label>
                                        <select
                                            id="industries"
                                            multiple
                                            className="form-select"
                                            value={industries}
                                            onChange={(e) => setIndustries(Array.from(e.target.selectedOptions, option => option.value))}
                                        >
                                            {industriesOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="software_erp_experience" className="form-label">
                                            Software / ERP Experience
                                        </label>
                                        <select
                                            id="software_erp_experience"
                                            multiple
                                            className="form-select"
                                            value={software_erp_experience}
                                            onChange={(e) => setSoftwareErpExperience(Array.from(e.target.selectedOptions, option => option.value))}
                                        >
                                            {softwareErpExperienceOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Manager Assignment</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="managerId" className="form-label">
                                            Manager Name
                                        </label>
                                        <select 
                                            name="managerId" 
                                            id="managerId" 
                                            className="form-select" 
                                            value={manager_id} 
                                            onChange={handleManagerChange}
                                        > 
                                            <option value="-select-"> -- Select Manager -- </option>
                                            {managerList.map((manager) => (
                                                <option key={manager.user_id} value={manager.user_id}>
                                                    {manager.first_name}, {manager.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="manager_email" className="form-label">
                                            Manager Email
                                        </label>
                                        <input 
                                            onChange={(event)=>{setManagerEmail(event.target.value)}}
                                            value={manager_email}
                                            type="email"
                                            className="form-control"
                                            id="manager_email"
                                            name="manager_email"
                                            placeholder="Manager email (auto-filled)"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Documents</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="resume" className="form-label">
                                            Resume
                                        </label>
                                        {resumeFileName && (
                                            <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '14px', color: '#6c757d' }}>
                                                Current file: {resumeFileName}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            name="resume"
                                            id="resume"
                                            className="form-control"
                                            onChange={handleResumeChange}
                                            accept=".pdf,.doc,.docx"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profile_picture" className="form-label">
                                            Profile Picture
                                        </label>
                                        {profilePicFileName && (
                                            <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '14px', color: '#6c757d' }}>
                                                Current file: {profilePicFileName}
                                            </div>
                                        )}
                                        <input
                                            type="file" 
                                            className="form-control"
                                            name="profile_picture"
                                            id="profile_picture"
                                            onChange={handleProfileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button"
                                    onClick={() => navigate("/employees")} 
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
                                            Update Resource
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
  
export default EmpEdit;