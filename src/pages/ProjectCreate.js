import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import "./FormStyles.css"
 
function ProjectCreate() {
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
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();
    const [clientList, setClientList] = useState([]);
    const [client_id, setClientId] = useState('');
    const [lineOfBusinessList, setLineOfBusinessList] = useState([]);
    const [lineOfBusiness_id, setLineOfBusinessId] = useState('');

    const handleCancel = () => {
        navigate("/projects");
    }

    useEffect(() => {
        fetchClientList();
        fetchLineofBusinessList();
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

    const fetchLineofBusinessList = () => {
        axios.get('/lineOfBusiness')
        .then(function (response) {
          setLineOfBusinessList(response.data.lineOfBusiness);
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
        const config = {
          headers: {
            "Content-Length": 0,
            "Content-Type": "application/json",
          },
          responseType: "text",
        };
        const data = {
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
        };
        axios.post('/projects/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Project Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/projects");
            setIsSaving(false);
            setProjectName('');
            setProjectLocation('');
            setContactPerson('');
            setContactEmail('');
            setContactPhone('');
            setStartDate('');
            setExpectedEndDate('');
            setActualEndDate('');
            setTechRequired('');
            setDescription('');
            setStatus('Active');
            setHeadCount(''); 
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
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Add New Project</h1>
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
                                            <option value=""> -- Select client -- </option>
                                            {clientList.map((client) => (
                                                <option key={client.client_id} value={client.client_id}>
                                                    {client.name}, {client.location}
                                                </option>
                                            ))}
                                        </select>
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
                                <div className="form-row">
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
                                    
                                </div>
                                <div className="form-row">
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Project
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
  
export default ProjectCreate;