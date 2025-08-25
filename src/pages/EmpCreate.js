import React, {useState, useEffect} from 'react'
import {useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as AppFunc from "../lib/AppFunctions";
import "./FormStyles.css";
import APP_CONSTANTS from "../appConstants";
 
function EmpCreate() {
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
    const [status, setStatus] = useState('Active');
    const [manager_name, setManagerName] = useState('');
    const [manager_email, setManagerEmail] = useState('');
    const [vaco_join_date, setVacoJoinDate] = useState('');
    const [email, setEmail] = useState('');
    const [is_onsite, setIsOnsite] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selected_resume, setSelectedResume] = useState(null);
    const [profile_picture, setSelectedProfilePicture] = useState(null);
    const [employment_type, setSelectedEmpType] = useState('Full-time');
    const [managerList, setManagerList] = useState([]);
    const navigate = useNavigate();
    const [manager_id, setSelectedManager] = useState("-select-");
    const [locationList, setLocationList] = useState([]);
    const [functional_focus, setFunctionalFocus] = useState('-select-');
    const [core_skillset, setCoreSkillset] = useState(''); // textarea
    const [revenue_company_size, setRevenueCompanySize] = useState([]); // multiple
    const [industries, setIndustries] = useState([]); // multiple
    const [software_erp_experience, setSoftwareErpExperience] = useState([]); // multiple
    const [hours_preference, setHoursPreference] = useState('40.00');
    const [line_of_business_id, setLineOfBusinessId] = useState(JSON.parse(localStorage.getItem("user")).line_of_business_id);
    const [userRole, setUserRole] = useState(JSON.parse(localStorage.getItem("user")).role);
    const [lineOfBusinessList, setLineofBusinessList] = useState([]);
    const functionalFocusOptions = ['A/F', 'HR', 'Technology', 'Marketing', 'Operations'];
    const revenueCompanySizeOptions = ['<$10M', '$10M-$100M', '$100M-$1B', '$1B+'];
    const industriesOptions = ['Healthcare', 'Finance', 'Retail', 'Technology', 'Manufacturing'];
    const softwareErpExperienceOptions = ['SAP', 'Oracle', 'Dynamics', 'NetSuite', 'QuickBooks'];

    useEffect(() => {
        fetchLocationList();
        fetchLineofBusinessList();
        
        // Set initial manager list based on user role
        if (userRole === 'administrator') {
            // For admin, fetch all managers initially
            fetchAllManagers();
        } else {
            // For manager/offshorelead, set their own details
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser) {
                setManagerList([{
                    user_id: currentUser.user_id,
                    first_name: currentUser.first_name,
                    last_name: currentUser.last_name,
                    email: currentUser.email
                }]);
                setSelectedManager(currentUser.user_id);
                setManagerName(`${currentUser.first_name} ${currentUser.last_name}`);
                setManagerEmail(currentUser.email);
            }
        }
    }, [userRole]);

    // // Ensure line_of_business_id is set for non-administrator users
    // useEffect(() => {
    //     if (userRole !== 'administrator') {
    //         const user = JSON.parse(localStorage.getItem("user"));
    //         if (user && user.line_of_business_id) {
    //             setLineOfBusinessId(user.line_of_business_id);
    //         }
    //     }
    // }, [userRole]);

    // Handle line of business changes for administrators
    useEffect(() => {
        if (userRole === 'administrator' && line_of_business_id && line_of_business_id !== '-select-') {
            fetchManagersByLineOfBusiness(line_of_business_id);
        }
    }, [line_of_business_id, userRole]);

    const fetchLocationList = () => {
        axios.get('/officeLocation')
        .then(function (response) {
          setLocationList(response.data.locations);
        })
        .catch(function (error) {
          console.log(error);
        })
        
    }

    const fetchLineofBusinessList = () => {
        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR) {
            axios.get('/lineOfBusiness')
            .then(function (response) {
                setLineofBusinessList(response.data.lineOfBusiness);
            })
            .catch(function (error) {
                console.log(error);
            })
            
        } else {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.line_of_business_id) {
                setLineOfBusinessId(user.line_of_business_id);
            }
            
        }
    }

    const fetchAllManagers = () => {
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
    }

    const fetchManagersByLineOfBusiness = (lineOfBusinessId) => {
        const configs = {
            headers: {
              "Content-Type": "application/json",
            },
        };
        const datas = {
            line_of_business_id: lineOfBusinessId,
        };
  
        axios.post('/users/getManagersByLineOfBusiness', datas, configs)
        .then(function (response) {
          setManagerList(response.data.users);
          // Reset manager selection when line of business changes
          setSelectedManager("-select-");
          setManagerName('');
          setManagerEmail('');
        })
        .catch(function (error) {
          console.log(error);
        })
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

    const handleEmpTypeChange = (event) => {
        setSelectedEmpType(event.target.value);
    }

    const handleCancel = () => {
        navigate("/employees");
    }

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

        if (!total_work_experience_years) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter total work experience!',
                showConfirmButton: true
            })
            return;
        }

        if (!cost_per_hour) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter rate per hour!',
                showConfirmButton: true
            })
            return;
        }

        if (!home_location_city.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter home location city!',
                showConfirmButton: true
            })
            return;
        }

        if (!selected_resume) {
            Swal.fire({
                icon: 'warning',
                title: 'Please upload resume!',
                showConfirmButton: true
            })
            return;
        }

        if (!profile_picture) {
            Swal.fire({
                icon: 'warning',
                title: 'Please upload profile picture!',
                showConfirmButton: true
            })
            return;
        }

        // Validate line of business for non-administrator users
        if (userRole !== 'administrator' && (!line_of_business_id || line_of_business_id === '-select-')) {
            Swal.fire({
                icon: 'warning',
                title: 'Line of Business is required!',
                text: 'Please ensure you have a valid line of business assigned.',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

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
        data.append('is_onsite', onSite);
        data.append('resume', selected_resume);
        data.append('profile_picture', profile_picture);
        data.append('employment_type', employment_type);
        data.append('functional_focus_area', functional_focus);
        data.append('line_of_business_id', line_of_business_id);
        data.append('primary_skills', core_skillset);
        data.append('max_company_revenue_size', revenue_company_size.join(','));
        data.append('industries_experience', industries.join(','));
        data.append('erp_software_experience', software_erp_experience.join(','));  
        data.append('max_work_hours_prefered', hours_preference);

        axios.post('/employees/add', data, config)
          .then((response)=>{
            Swal.fire({
                icon: 'success',
                title: 'Resource Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/employees");
            setIsSaving(false);
            setFirstName('');
            setLastName('');
            setSecondarySkills('');
            setEducation('');
            setProfileInformation('');
            setTotWorkExp('');
            setCostPerHour('');
            setVacoJoinDate('');
            setHomeLocCity('');
            setOfficeLocCity('');
            setDesignation('');
            setStatus('');
            setManagerName('');
            setManagerEmail('');
            setEmail('');
            setIsOnsite(false);
            setSelectedResume(null);
            setSelectedProfilePicture(null);
            setFunctionalFocus('-select-');
            setCoreSkillset('');
            setRevenueCompanySize([]);
            setIndustries([]);
            setSoftwareErpExperience([]);
            setHoursPreference('40.00');
          })
          .catch((error)=>{
            const errMsg = error.response?.data?.split("Error:");
            Swal.fire({
                icon: 'error',
                title: errMsg[0] || "Unknown Error",
                text: errMsg[1] || "Unknown Error",
                showConfirmButton: true
            })
            setIsSaving(false)
          });
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Add New Resource</h1>
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
                                        <label htmlFor="total_work_experience_years" className="form-label required-field">
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
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cost_per_hour" className="form-label required-field">
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
                                            required
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
                                        <label htmlFor="employment_type" className="form-label required-field">
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
                                        <label htmlFor="status" className="form-label required-field">
                                            Status
                                        </label>
                                        <select 
                                            name="status" 
                                            id="status" 
                                            className="form-select" 
                                            value={status}
                                            onChange={(event)=>{setStatus(event.target.value)}}
                                            required
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
                                        <label htmlFor="home_location_city" className="form-label required-field">
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
                                            required
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
                                    {userRole === 'administrator' && (
                                        <div className="form-group">
                                            <label htmlFor="line_of_business_id" className="form-label">
                                            Line of Business
                                            </label>

                                            <select
                                            id="line_of_business_id"
                                            className="form-select"
                                            value={line_of_business_id}
                                            onChange={(e) => setLineOfBusinessId(e.target.value)}
                                            >
                                            <option value="">-- Select Division --</option>
                                            {lineOfBusinessList.map((opt) => (
                                                <option key={opt.id} value={opt.id}>
                                                {opt.name}
                                                </option>
                                            ))}
                                            </select>
                                        </div>
                                    )}

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

                                </div>
                                    <div className="form-row">
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
                                        <label htmlFor="manager_id" className="form-label">
                                            Manager Name
                                        </label>
                                        {userRole === 'administrator' ? (
                                            <select 
                                                name="manager_id" 
                                                id="manager_id" 
                                                className="form-select" 
                                                value={manager_id} 
                                                onChange={handleManagerChange}
                                                disabled={!line_of_business_id || line_of_business_id === '-select-'}
                                            > 
                                                <option value="-select-"> 
                                                    {!line_of_business_id || line_of_business_id === '-select-' 
                                                        ? '-- Select Line of Business First --' 
                                                        : '-- Select Manager --'} 
                                                </option>
                                                {managerList.map((manager) => (
                                                    <option key={manager.user_id} value={manager.user_id}>
                                                        {manager.first_name} {manager.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                type="text"
                                                className="form-control"
                                                value={manager_name || 'Loading...'}
                                                readOnly
                                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                            />
                                        )}
                                        {userRole === 'administrator' && (!line_of_business_id || line_of_business_id === '-select-') && (
                                            <small className="form-text text-muted">
                                                Please select a Line of Business first to enable manager selection
                                            </small>
                                        )}
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
                                {userRole !== 'administrator' && (
                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <small className="form-text text-muted">
                                                Manager is automatically set to your account as you can only create employees under your management
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Documents</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="resume" className="form-label required-field">
                                            Resume
                                        </label>
                                        <input
                                            type="file"
                                            name="resume"
                                            id="resume"
                                            className="form-control"
                                            onChange={handleResumeChange}
                                            accept=".pdf,.doc,.docx"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profile_picture" className="form-label required-field">
                                            Profile Picture
                                        </label>
                                        <input
                                            type="file" 
                                            className="form-control"
                                            name="profile_picture"
                                            id="profile_picture"
                                            onChange={handleProfileChange}
                                            accept="image/*"
                                            required
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Resource
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
  
export default EmpCreate;