import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import "./FormStyles.css"
 
function ProjectEdit() {
    const { id } = useParams();
    const [project_name, setProjectName] = useState('');
    const [project_location, setProjectLocation] = useState('');
    const [contact_person, setContactPerson] = useState('');
    const [contact_email, setContactEmail] = useState('');
    const [contact_phone, setContactPhone] = useState('');
    const [start_date, setStartDate] = useState('');
    const [expected_end_date, setExpectedEndDate] = useState('');
    const [actual_end_date, setActualEndDate] = useState('');
    const [technologies_required, setTechRequired] = useState('');
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('');
    const [head_count, setHeadCount] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [client_id, setClientId] = useState('');
    const [clientList, setClientList] = useState([]);

    useEffect(() => {
        fetchClientList();
    }, [])

    const fetchClientList = () => {
        axios.get('/clients')
        .then(function (response) {
          setClientList(response.data.clients);
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const handleClientChange = (e) => {
        if(e.target.value === "-select-"){
            Swal.fire({
                icon: 'warning',
                title: 'Client Name is required!',
                showConfirmButton: true
            })
        }
        setClientId(e.target.value);
    }

    useEffect(() => {
        axios.get(`/projects/${id}`)
        .then(function (response) {
            let projectDetails = response.data.projects[0];
            setClientId(projectDetails.client_id);
            setProjectName(projectDetails.project_name);
            setProjectLocation(projectDetails.project_location);
            setContactPerson(projectDetails.contact_person);
            setContactEmail(projectDetails.contact_email);
            setContactPhone(projectDetails.contact_phone);
            setActualEndDate(Utils.formatDateYYYYMMDD(projectDetails.actual_end_date));
            setStartDate(Utils.formatDateYYYYMMDD(projectDetails.start_date));
            setExpectedEndDate(Utils.formatDateYYYYMMDD(projectDetails.expected_end_date));
            setTechRequired(projectDetails.technologies_required);
            setStatus(projectDetails.status);
            setDescription(projectDetails.description);
            setHeadCount(projectDetails.head_count);
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
          
    }, [id])

    const handleSave = () => {
        if (client_id === '' || client_id === '-select-') {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a client!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        axios.post(`/projects/update/${id}`, {
            client_id: client_id,
            project_name: project_name,
            project_location: project_location,
            contact_person: contact_person,
            contact_email: contact_email,
            contact_phone: contact_phone,
            start_date: start_date,
            expected_end_date: expected_end_date,
            actual_end_date: actual_end_date,
            technologies_required: technologies_required,
            description: description,
            status: status,
            head_count: head_count,
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Project updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/projects");
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
        navigate("/projects");
    }

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Project Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading project details...</p>
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
                        <h1 className="form-page-title">Edit Project Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Project Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="client" className="form-label required-field">
                                            Client
                                        </label>
                                        <select 
                                            name="client" 
                                            id="client" 
                                            className="form-select" 
                                            onChange={handleClientChange}
                                            value={client_id}
                                            required
                                        > 
                                            {clientList.map((client, key) => (
                                                <option key={key} value={client.client_id}>
                                                    {client.name}, {client.location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="project_name" className="form-label required-field">
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
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="project_location" className="form-label required-field">
                                            Project Location
                                        </label>
                                        <input 
                                            onChange={(event)=>{setProjectLocation(event.target.value)}}
                                            value={project_location}
                                            type="text"
                                            className="form-control"
                                            id="project_location"
                                            name="project_location"
                                            placeholder="Enter project location"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="head_count" className="form-label">
                                            Head Count
                                        </label>
                                        <input 
                                            onChange={(event)=>{setHeadCount(event.target.value)}}
                                            value={head_count}
                                            type="number"
                                            className="form-control"
                                            id="head_count"
                                            name="head_count"
                                            placeholder="Enter head count"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Contact Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="contact_person" className="form-label required-field">
                                            Contact Person Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setContactPerson(event.target.value)}}
                                            value={contact_person}
                                            type="text"
                                            className="form-control"
                                            id="contact_person"
                                            name="contact_person"
                                            placeholder="Enter contact person name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="contact_email" className="form-label required-field">
                                            Contact Email
                                        </label>
                                        <input 
                                            onChange={(event)=>{setContactEmail(event.target.value)}}
                                            value={contact_email}
                                            type="email"
                                            className="form-control"
                                            id="contact_email"
                                            name="contact_email"
                                            placeholder="Enter contact email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="contact_phone" className="form-label required-field">
                                            Contact Phone
                                        </label>
                                        <input 
                                            onChange={(event)=>{setContactPhone(event.target.value)}}
                                            value={contact_phone}
                                            type="tel"
                                            className="form-control"
                                            id="contact_phone"
                                            name="contact_phone"
                                            placeholder="Enter contact phone number"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status" className="form-label required-field">
                                            Project Status
                                        </label>
                                        <select 
                                            value={status}
                                            onChange={(event)=>{setStatus(event.target.value)}}
                                            className="form-select"
                                            id="status"
                                            name="status"
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="Planning">Planning</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Project Timeline</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="start_date" className="form-label required-field">
                                            Project Start Date
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
                                        <label htmlFor="expected_end_date" className="form-label">
                                            Expected End Date
                                        </label>
                                        <input 
                                            onChange={(event)=>{setExpectedEndDate(event.target.value)}}
                                            value={expected_end_date}
                                            type="date"
                                            className="form-date"
                                            id="expected_end_date"
                                            name="expected_end_date"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="actual_end_date" className="form-label">
                                            Actual End Date
                                        </label>
                                        <input 
                                            onChange={(event)=>{setActualEndDate(event.target.value)}}
                                            value={actual_end_date}
                                            type="date"
                                            className="form-date"
                                            id="actual_end_date"
                                            name="actual_end_date"
                                        />
                                    </div>
                                    <div className="form-group">
                                        {/* Empty div for layout balance */}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Project Details</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="description" className="form-label">
                                        Project Description
                                    </label>
                                    <textarea 
                                        value={description}
                                        onChange={(event)=>{setDescription(event.target.value)}}
                                        className="form-textarea"
                                        id="description"
                                        name="description"
                                        placeholder="Enter project description"
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="technologies_required" className="form-label">
                                        Technologies Required
                                    </label>
                                    <textarea 
                                        value={technologies_required}
                                        onChange={(event)=>{setTechRequired(event.target.value)}}
                                        className="form-textarea"
                                        id="technologies_required"
                                        name="technologies_required"
                                        placeholder="Enter technologies required for this project"
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
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Update Project
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
  
export default ProjectEdit;