import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import APP_CONSTANTS from "../appConstants";
import * as Utils from "../lib/Utils";
import Multiselect from 'multiselect-react-dropdown';

function UserEdit() {
    const user_id = useState(useParams().id)
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
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
    }, []);


    useEffect(() => {
        axios.get(`/users/${user_id}`)
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
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                text: error,
                showConfirmButton: false,
                timer: 1500
            })
        })
          
    }, [useParams().id])

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
        if(validateRoleDependencies()) {
            setIsSaving(true);

            let updatedData = {
                first_name: first_name,
                last_name: last_name,
                email: email,
                role: role,
                password: password,
                emp_id: employee,
                project_id: project
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

            axios.post(`/users/update/${user_id}`, updatedData)
            .then(function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'User updated successfully!',
                    showConfirmButton: false,
                    timer: 1500
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
        axios.post(`/users/resetPassword/${user_id}`, {
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
    return (
        <Layout>
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-center">Edit User Details</h4>
                    </div>
                    <div className="card-body">
                    <form>
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input 
                                    onChange={(event)=>{setFirstName(event.target.value)}}
                                    value={first_name}
                                    type="text"
                                    className="form-control"
                                    id="first_name"
                                    name="first_name"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input 
                                    onChange={(event)=>{setLastName(event.target.value)}}
                                    value={last_name}
                                    type="text"
                                    className="form-control"
                                    id="last_name"
                                    name="last_name"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email ID</label>
                                <input 
                                    onChange={(event)=>{setEmail(event.target.value)}}
                                    value={email}
                                    type="text"
                                    className="form-control"
                                    id="email"
                                    name="email"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role</label>
                                <select name="role" id="role" className="form-control" onChange={handleRoleChange} > 
                                    {roles.map((rl, key) => {
                                        const sel = (rl.role === role) ? true : false;
                                        return <option key={key} value={rl.role} selected={sel}>{rl.role.toUpperCase()}</option>;
                                    })}
                                </select>
                            </div>
                            {showClientSel ? 
                            (<div className="form-group">
                                <label htmlFor="client">Client </label>
                                <Multiselect
                                    options={clients} 
                                    selectedValues={clients.filter(cl=> producerClientIds?.includes(cl.client_id))} 
                                    onSelect={handleClientAdd}
                                    onRemove={handleClientRemove}
                                    showCheckbox={true}
                                    displayValue="name"
                                    closeIcon="close"
                                />
                            </div>) : ''}
                            {showProjectSel ? 
                            (<div className="form-group">
                                <label htmlFor="project">Project</label>
                                <select name="project" id="project" className="form-control" onChange={handleProjectChange} > 
                                    <option value="-select-" > -- Select a Project -- </option>
                                    {projects.map((prj) => {
                                        const sel = (prj.project_id === project) ? true : false;
                                        return <option key={prj.project_id} value={prj.project_id} selected={sel}>{prj.project_name}</option>;
                                    })}
                                </select>
                            </div>) : ''}
                            {showEmpSel ? 
                            (<div className="form-group">
                                <label htmlFor="emp">Employee</label>
                                <select name="emp" id="emp" className="form-control" onChange={handlEmployeeChange} > 
                                    <option value="-select-" > -- Select an Employee -- </option>
                                    {employees.map((emp) => {
                                        const sel = (emp.emp_id === employee) ? true : false;
                                        return <option key={emp.emp_id} value={emp.emp_id} selected={sel}>{emp.first_name} {emp.last_name}</option>;
                                    })}
                                </select>
                            </div>) : ''}
                        </form>
                        <button 
                                onClick={handleReset} 
                                type="submit"
                                className="btn btn-outline-light me-3 mt-3">
                                RESET
                        </button>
                        <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="submit"
                                className="btn btn-outline-info mt-3">
                                UPDATE
                        </button>
                        <button 
                                disabled={isSaving}
                                onClick={handlePasswordReset} 
                                type="submit"
                                className="btn btn-outline-danger mt-3 float-end">
                                RESET PASSWORD
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default UserEdit;