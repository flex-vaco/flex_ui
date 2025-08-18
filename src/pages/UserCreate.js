import React, {useState, useEffect} from 'react'
import {useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import APP_CONSTANTS from "../appConstants";
import Multiselect from 'multiselect-react-dropdown';
import "./FormStyles.css";
 
function UserCreate() {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [chkPassword, setChkPassword] = useState('');
    const [role, setRole] = useState('');
    const [roles, setRoles] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);

    const [projects, setProjects] = useState([]);
    const [project, setProject] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [empId, setEmpId] = useState(null);
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErr, setFormErr] = useState("");

    const [showEmpSel, setShowEmpSel] = useState(false);
    const [showClientSel, setShowClientSel] = useState(false);
    const [showProjectSel, setShowProjectSel] = useState(false);
    const [lineOfBusinessList, setLineOfBusinessList] = useState([]);
    const [lineOfBusiness_id, setLineOfBusinessId] = useState('');
    const [disableLineOfBusiness, setDisableLineOfBusiness] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles();
        fetchClients();
        fetchProjects();
        fetchEmployees();
        fetchLineofBusinessList();
    }, []);

    const verifyPassword = (pswd) => {
        setChkPassword(pswd)
        if (pswd !== password) {
            setIsSaving(true);
            setFormErr("Passwords Do Not Match");
        } else if (pswd.length < 8 || password.length < 8) {
            setIsSaving(true);
            setFormErr("Password length should be minimum 8 charaters");
        } else {
            setIsSaving(false);
            setFormErr("");
        }
    };

    const handleCancel = () => {
        navigate("/userList");
    }
    const fetchRoles = () => {
        axios.post('/users/roles')
        .then(function (response) {
            console.log(response.data)
          setRoles(response.data.user_roles);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const fetchClients = () => {
        axios.get('/clients')
        .then(function (response) {
            setClients(response.data.clients);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const fetchEmployees = () => {
        axios.get('/employees')
        .then(function (response) {
           setEmployees(response.data.employees);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const fetchProjects = () => {
        axios.get('/projects')
        .then(function (response) {
           setProjects(response.data.projects);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const fetchLineofBusinessList = () => {
        axios.get('/lineOfBusiness')
        .then(function (response) {
          setLineOfBusinessList(response.data.lineOfBusiness);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const handleRoleChange = (e) => {
        const roleVal =  e.target.value;
        e.stopPropagation();

        if(roleVal !== APP_CONSTANTS.USER_ROLES.EMPLOYEE){
            setEmail('');
            setFirstName('');
            setLastName('');
            setDisableLineOfBusiness(false);
            setLineOfBusinessId('');
        }
        
        if (roleVal === "-select-") {
            Swal.fire({
                icon: 'warning',
                title: 'Role Name is required!',
                showConfirmButton: true
            })
        } else {
            setRole(roleVal);
            switch (roleVal) {
                case APP_CONSTANTS.USER_ROLES.EMPLOYEE:
                    setShowEmpSel(true);
                    setShowClientSel(false);
                    setShowProjectSel(false)
                    break;
                case APP_CONSTANTS.USER_ROLES.PRODUCER:
                    setShowEmpSel(false);
                    setShowClientSel(true);
                    setShowProjectSel(false)
                    break;
                case APP_CONSTANTS.USER_ROLES.ADMINISTRATOR:
                case APP_CONSTANTS.USER_ROLES.MANAGER:
                    setShowEmpSel(false);
                    setShowClientSel(false);
                    setShowProjectSel(false)
                    break;
                default:
                    setShowEmpSel(false);
                    setShowClientSel(false);
                    setShowProjectSel(false)
                    break;
            }
        }
    }

    const handlEmployeeChange = (e) => {
        const selectedEmpId = parseInt(e.target.value);
        const empRequiredRoles = [APP_CONSTANTS.USER_ROLES.EMPLOYEE];
        if((empRequiredRoles.includes(role)) && (e.target.value === "-select-")){
            Swal.fire({
                icon: 'warning',
                title: 'Employee Name is required!',
                showConfirmButton: true
            })
        }
        setEmpId(selectedEmpId);
        const selectedEmployee = employees.filter(e => e.emp_id === selectedEmpId);
        setEmail(selectedEmployee[0].email);
        setLineOfBusinessId(selectedEmployee[0].line_of_business_id);
        setFirstName(selectedEmployee[0].first_name);
        setLastName(selectedEmployee[0].last_name);
        setDisableLineOfBusiness(true);
    }
    const handleProjectChange = (e) => {
        if(e.target.value === "-select-"){
            Swal.fire({
                icon: 'warning',
                title: 'Project Name is required!',
                showConfirmButton: true
            })
        }
        setProject(e.target.value)
    }
    const handleSave = () => {
        if (!role || role === "-select-") {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a role!',
                showConfirmButton: true
            })
            return;
        }

        if (!lineOfBusiness_id || lineOfBusiness_id === "-- Select line of business --") {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a line of business!',
                showConfirmButton: true
            })
            return;
        }

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

        if (!password || password.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'Password must be at least 8 characters!',
                showConfirmButton: true
            })
            return;
        }

        if (password !== chkPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Passwords do not match!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        const config = {
          headers: {
            "Content-Type": "application/json"
          }
        };

        let data = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            role: role,
            password: password,
            emp_id: empId,
            project_id: project,
            line_of_business_id: lineOfBusiness_id
        }

        const clientIds = selectedClients.map(s=>s.client_id);
        if ((role === APP_CONSTANTS.USER_ROLES.PRODUCER) && (clientIds.length === 0)) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a Client for Producer',
                showConfirmButton: true
            }).then((res) => {
                setIsSaving(false);
                return;
            })
        } else {
            data.client_ids = clientIds;
        }

        axios.post('/users/sign-up', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'User saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/userList");
            setIsSaving(false);
            setFirstName('');
            setLastName('');
            setRole('');
            setEmail('');
            setPassword('');
            setChkPassword('');
            setEmpId(null);
            setProject(null);
            setSelectedClients([]);
            setDisableLineOfBusiness(false);
            setLineOfBusinessId('');
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

    const handleClientAdd = (e)=>{
        setSelectedClients(e);
    }

    const handleClientRemove = (e)=>{
        setSelectedClients(e);
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Add New User</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">User Role & Assignment</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="role" className="form-label required-field">
                                        Role Name
                                    </label>
                                    <select 
                                        name="role" 
                                        id="role" 
                                        className="form-select" 
                                        onChange={handleRoleChange}
                                        value={role}
                                        required
                                    > 
                                        <option value=""> -- Select a Role -- </option>
                                        {roles.map((rl, key) => {
                                            return <option key={key} value={rl.role}>{rl.role.toUpperCase()}</option>;
                                        })}
                                    </select>
                                </div>
                                {showClientSel && (
                                    <div className="form-group full-width">
                                        <label htmlFor="client" className="form-label required-field">
                                            Client
                                        </label>
                                        <Multiselect
                                            options={clients} 
                                            onSelect={handleClientAdd} 
                                            onRemove={handleClientRemove} 
                                            showCheckbox={true}
                                            displayValue="name" 
                                            closeIcon="close"
                                            placeholder="Select clients..."
                                        />
                                    </div>
                                )}
                                {showProjectSel && (
                                    <div className="form-group full-width">
                                        <label htmlFor="project" className="form-label required-field">
                                            Project
                                        </label>
                                        <select 
                                            name="project" 
                                            id="project" 
                                            className="form-select" 
                                            onChange={handleProjectChange}
                                            value={project || ""}
                                            required
                                        > 
                                            <option value=""> -- Select a Project -- </option>
                                            {projects.map((prj) => {
                                                return <option key={prj.project_id} value={prj.project_id}>{prj.project_name}</option>;
                                            })}
                                        </select>
                                    </div>
                                )}
                                {showEmpSel && (
                                    <div className="form-group full-width">
                                        <label htmlFor="emp" className="form-label required-field">
                                            Employee
                                        </label>
                                        <select 
                                            name="emp" 
                                            id="emp" 
                                            className="form-select" 
                                            onChange={handlEmployeeChange}
                                            value={empId || ""}
                                            required
                                        > 
                                            <option value=""> -- Select an Employee -- </option>
                                            {employees.map((emp) => {
                                                return <option key={emp.emp_id} value={emp.emp_id}>{emp.first_name} {emp.last_name}</option>;
                                            })}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">User Information</h3>
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
                                            readOnly={role === APP_CONSTANTS.USER_ROLES.EMPLOYEE}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="line_of_business" className="form-label required-field">
                                            Line of Business
                                        </label>
                                        <select 
                                            name="line_of_business" 
                                            id="line_of_business" 
                                            className="form-select" 
                                            onChange={(e) => setLineOfBusinessId(e.target.value)}
                                            value={lineOfBusiness_id}
                                            required
                                            disabled={disableLineOfBusiness}
                                        >
                                            <option value=""> -- Select line of business -- </option>
                                            {lineOfBusinessList.map((lineOfBusiness) => (
                                                <option key={lineOfBusiness.id} value={lineOfBusiness.id}>
                                                    {lineOfBusiness.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Security</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label required-field">
                                            Password
                                        </label>
                                        <input 
                                            onChange={(event)=>{setPassword(event.target.value)}}
                                            value={password}
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            placeholder="Enter password (min 8 characters)"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="re_password" className="form-label required-field">
                                            Confirm Password
                                        </label>
                                        {formErr && <p className="form-error">{formErr}</p>}
                                        <input 
                                            onChange={(event)=>{verifyPassword(event.target.value)}}
                                            value={chkPassword}
                                            type="password"
                                            className="form-control"
                                            id="re_password"
                                            name="re_password"
                                            placeholder="Confirm password"
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
                                            Save User
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
  
export default UserCreate;