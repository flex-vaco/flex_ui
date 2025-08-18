import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import APP_CONSTANTS from "../appConstants";
import * as Utils from "../lib/Utils";
import Multiselect from 'multiselect-react-dropdown';
import "./FormStyles.css";

function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    const [clients, setClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [producerClientIds, setProducerClientIds] = useState([]);

    const [projects, setProjects] = useState([]);
    const [project, setProject] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [employee, setEmployee] = useState(null);

    const [showEmpSel, setShowEmpSel] = useState(false);
    const [showClientSel, setShowClientSel] = useState(false);
    const [showProjectSel, setShowProjectSel] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [lineOfBusinessList, setLineOfBusinessList] = useState([]);
    const [lineOfBusiness_id, setLineOfBusinessId] = useState('');
    const [disableLineOfBusiness, setDisableLineOfBusiness] = useState(false);
    const handleCancel = () => {
        navigate("/userList");
    }

    const handleRoleChange = (e) => {
        const roleVal =  e.target.value;
        e.stopPropagation();
        if (roleVal === "-select-") {
            Swal.fire({
                icon: 'warning',
                title: 'Role Name is required!',
                showConfirmButton: true
            })
        } else {
                
                setRole(roleVal);
                validateRoleDependencies();
        }
    }

    const fetchRoles = () => {
        axios.post('/users/roles')
        .then(function (response) {
          setRoles(response.data.user_roles);
        })
        .catch(function (error) {
          console.log(error);
        })
    };
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
    const handlEmployeeChange = (e) => {
        const empRequiredRoles = [APP_CONSTANTS.USER_ROLES.EMPLOYEE]
        if((empRequiredRoles.includes(role)) && (e.target.value === "-select-")){
            Swal.fire({
                icon: 'warning',
                title: 'Employee Name is required!',
                showConfirmButton: true
            })
        }
        setEmployee(e.target.value)
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

    useEffect(() => {
        fetchRoles();
        fetchClients();
        fetchProjects();
        fetchEmployees();
        fetchLineofBusinessList();
    }, []);

    useEffect(() => {
        axios.get(`/users/${id}`)
        .then(function (response) {
            let userDetatils = response.data.user;
            setFirstName(userDetatils.first_name);
            setLastName(userDetatils.last_name);
            setPassword(userDetatils.password)
            setRole(userDetatils.role);
            setEmail(userDetatils.email);
            setProducerClientIds(userDetatils?.producer_clients?.map(prd_cl=>prd_cl.client_id));
            setSelectedClients(clients.filter(cl=> producerClientIds.includes(cl.client_id)));
            setShowClientSel(userDetatils.role === APP_CONSTANTS.USER_ROLES.PRODUCER);
            setProject(userDetatils.project_id);
            setShowProjectSel(userDetatils.project_id ? true : false);
            setEmployee(userDetatils.emp_id);
            setShowEmpSel(userDetatils.role === APP_CONSTANTS.USER_ROLES.EMPLOYEE);
            setLineOfBusinessId(userDetatils.line_of_business_id);
            setIsLoading(false);
            setDisableLineOfBusiness(userDetatils.role === APP_CONSTANTS.USER_ROLES.EMPLOYEE);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                text: error,
                showConfirmButton: false,
                timer: 1500
            })
            setIsLoading(false);
        })
          
    }, [id])

 const validateRoleDependencies = () =>{
    let roleHasValidDependencies = false;
    switch (role) {
        case APP_CONSTANTS.USER_ROLES.EMPLOYEE:
            if(Object.is(employee, null)) { 
                roleHasValidDependencies = false;
                setErrMsg('Employee is required for Manager/Employee Role!');
               setShowEmpSel(true);
               setShowClientSel(false);
               setShowProjectSel(false);
            } else {
                setProject(null);
                roleHasValidDependencies = true;
            }
            break;
        case APP_CONSTANTS.USER_ROLES.PRODUCER:
            setShowEmpSel(false);
            setShowClientSel(true);
            setShowProjectSel(false);
            setProject(null);
            setEmployee(null);
            roleHasValidDependencies = true;
            break;
        case APP_CONSTANTS.USER_ROLES.ADMINISTRATOR:
        case APP_CONSTANTS.USER_ROLES.MANAGER:
            setShowEmpSel(false);
            setShowClientSel(false);
            setShowProjectSel(false);
            setProject(null);
            setEmployee(null);
            roleHasValidDependencies = true;
            break;
        default:
            roleHasValidDependencies = true;
            break;
    }
    return roleHasValidDependencies;
 }
    useEffect(() => { 
        validateRoleDependencies();
    }, [role])

    const handleSave = async () => {
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

        if (!lineOfBusiness_id || lineOfBusiness_id === "-- Select line of business --") {

            Swal.fire({
                icon: 'warning',
                title: 'Please select a line of business!',
                showConfirmButton: true
            })
            return;
        }

        if(validateRoleDependencies()) {
            setIsSaving(true);

            let updatedData = {
                first_name: first_name,
                last_name: last_name,
                email: email,
                role: role,
                password: password,
                emp_id: employee,
                project_id: project,
                line_of_business_id: lineOfBusiness_id
            }
            if (role === APP_CONSTANTS.USER_ROLES.PRODUCER) {
                const clientIds = (selectedClients?.length > 0) ? selectedClients.map(s=>s.client_id) : producerClientIds;
                if ((!clientIds) || (clientIds.length === 0)) {
                    const { value: isConfirmed } = await Swal.fire({
                        icon: 'warning',
                        title: 'Client is Required \n for Producer Role',
                        showConfirmButton: true
                    })
                    if (isConfirmed) {
                        setIsSaving(false);
                        return;
                    }
                } else {
                    updatedData.client_ids = clientIds;
                }
            }

            axios.post(`/users/update/${id}`, updatedData)
            .then(function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'User updated successfully!',
                    showConfirmButton: false,
                    timer: 1500
                })
                setIsSaving(false);
                navigate("/userList");
            })
            .catch(function (error) {
                Swal.fire({
                     icon: 'error',
                    title: 'An Error Occured!',
                    text: error.data,
                    showConfirmButton: false,
                    timer: 1500
                })
                setIsSaving(false)
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: errMsg,
                showConfirmButton: true
           }).then(()=>{
            return
           })
        }
    }
  
    const handlePasswordReset = () => {
        const tempPswd = Utils.generateRandomString(8);

        setIsSaving(true);
        axios.post(`/users/resetPassword/${id}`, {
            email: email,
            password: tempPswd,
            needsPasswordReset: true
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: `Reset successfull!`,
                text: `New Password: ${tempPswd}`,
                showConfirmButton: true
            })
            setIsSaving(false);
        })
        .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occured!',
                text: error.data,
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false)
        });
    }
    const handleClientAdd = (selectedList, selectedItem)=>{
        setSelectedClients(selectedList);
        setProducerClientIds(selectedList?.map(s=>s.client_id))
    }

    const handleClientRemove = (selectedList, removedItem)=>{
        setSelectedClients(selectedList);
        setProducerClientIds(selectedList?.map(s=>s.client_id))
    }

    const handleReset = ()=>{
        window.location.reload(true);
    }

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit User Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading user details...</p>
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
                        <h1 className="form-page-title">Edit User Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                                <h3 className="form-section-title">User Role & Assignment</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="role" className="form-label required-field">
                                        Role
                                    </label>
                                    <select 
                                        name="role" 
                                        id="role" 
                                        className="form-select" 
                                        onChange={handleRoleChange}
                                        value={role}
                                        required
                                    > 
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
                                            selectedValues={clients.filter(cl=> producerClientIds?.includes(cl.client_id))} 
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
                                            value={employee || ""}
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

                            <div className="form-actions">
                                <div className="form-actions-left">
                                    <button 
                                        type="button"
                                        onClick={handleReset} 
                                        className="btn btn-outline"
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-arrow-clockwise"></i>
                                        Reset
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handlePasswordReset} 
                                        className="btn btn-outline-danger"
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-key"></i>
                                        Reset Password
                                    </button>
                                </div>
                                <div className="form-actions-right">
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
                                                Update User
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default UserEdit;