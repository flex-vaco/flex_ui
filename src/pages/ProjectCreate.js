import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
 
 
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
    const [status, setStatus] = useState('');
    const [description, setDescription] = useState('');
    const [head_count, setHeadCount] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();
    const  [clientList, setClientList] = useState([]);
    const [client_id, setClientId] = useState('');

    const handleCancel = () => {
        navigate("/projects");
    }

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

    const handleSave = () => {
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
            setStatus('');
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
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-center">Add New Project</h4>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="form-group">
                                <label htmlFor="client">Client</label>
                                <select name="client" id="client" className="form-control" onChange={handleClientChange}> 
                                    <option value="-select-" > -- Select client -- </option>
                                    {clientList.map((client) => <option value={client.client_id}>{client.name}, {client.location}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="project_name">Project Name</label>
                                <input 
                                    onChange={(event)=>{setProjectName(event.target.value)}}
                                    value={project_name}
                                    type="text"
                                    className="form-control"
                                    id="project_name"
                                    name="project_name"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="project_location">Project Location</label>
                                <input 
                                    onChange={(event)=>{setProjectLocation(event.target.value)}}
                                    value={project_location}
                                    type="text"
                                    className="form-control"
                                    id="project_location"
                                    name="project_location"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_person">Contact Person Name</label>
                                <input 
                                    onChange={(event)=>{setContactPerson(event.target.value)}}
                                    value={contact_person}
                                    type="text"
                                    className="form-control"
                                    id="contact_person"
                                    name="contact_person"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_email">Contact Email</label>
                                <input 
                                    onChange={(event)=>{setContactEmail(event.target.value)}}
                                    value={contact_email}
                                    type="email"
                                    className="form-control"
                                    id="contact_email"
                                    name="contact_email"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_phone">Contact Phone</label>
                                <input 
                                    onChange={(event)=>{setContactPhone(event.target.value)}}
                                    value={contact_phone}
                                    type="number"
                                    className="form-control"
                                    id="contact_phone"
                                    name="contact_phone"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="start_date">Project Start Date</label>
                                <input 
                                    onChange={(event)=>{setStartDate(event.target.value)}}
                                    value={start_date}
                                    type="date"
                                    className="form-control"
                                    id="start_date"
                                    name="start_date"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expected_end_date">Expected End Date</label>
                                <input 
                                    onChange={(event)=>{setExpectedEndDate(event.target.value)}}
                                    value={expected_end_date}
                                    type="date"
                                    className="form-control"
                                    id="expected_end_date"
                                    name="expected_end_date"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="actual_end_date">Project Actual Date</label>
                                <input 
                                    onChange={(event)=>{setActualEndDate(event.target.value)}}
                                    value={actual_end_date}
                                    type="date"
                                    className="form-control"
                                    id="actual_end_date"
                                    name="actual_end_date"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Project Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(event)=>{setDescription(event.target.value)}}
                                    className="form-control"
                                    id="description"
                                    rows="3"
                                    name="description"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="technologies_required">Technologies Required</label>
                                <textarea 
                                    value={technologies_required}
                                    onChange={(event)=>{setTechRequired(event.target.value)}}
                                    className="form-control"
                                    id="technologies_required"
                                    rows="3"
                                    name="technologies_required"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Project Status</label>
                                <input 
                                    value={status}
                                    onChange={(event)=>{setStatus(event.target.value)}}
                                    type="text"
                                    className="form-control"
                                    id="status"
                                    name="status"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="head_count">Head Count</label>
                                <input 
                                    onChange={(event)=>{setHeadCount(event.target.value)}}
                                    value={head_count}
                                    type="number"
                                    className="form-control"
                                    id="head_count"
                                    name="head_count"/>
                            </div>
                            <button 
                                disabled={isSaving}
                                onClick={handleCancel} 
                                type="submit"
                                className="btn btn-outline-secondary mt-3 me-3">
                                Cancel
                            </button>
                            <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="submit"
                                className="btn btn-outline-primary mt-3 me-3">
                                Save Project
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ProjectCreate;