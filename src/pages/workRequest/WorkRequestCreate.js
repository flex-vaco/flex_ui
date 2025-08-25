import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import "../FormStyles.css"
import Multiselect from 'multiselect-react-dropdown';
import ResourceSelectionModal from './ResourceSelectionModal';

function WorkRequestCreate() {
    const [title, setTitle] = useState('');
    const [lineOfBusinessId, setLineOfBusinessId] = useState('');
    const [serviceLineId, setServiceLineId] = useState('');
    const [capabilityAreaIds, setCapabilityAreaIds] = useState([]);
    const [projectId, setProjectId] = useState('');
    const [durationFrom, setDurationFrom] = useState('');
    const [durationTo, setDurationTo] = useState('');
    const [hoursPerWeek, setHoursPerWeek] = useState('');
    const [notes, setNotes] = useState('');
    const [projectAttachment, setProjectAttachment] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [selectedResources, setSelectedResources] = useState([]);
    
    // Dropdown data
    const [lineOfBusinesses, setLineOfBusinesses] = useState([]);
    const [serviceLines, setServiceLines] = useState([]);
    const [capabilityAreas, setCapabilityAreas] = useState([]);
    const [projects, setProjects] = useState([]);
    
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/workRequest");
    }

    useEffect(() => {
        fetchLineOfBusinesses();
        fetchProjects();
    }, []);

    useEffect(() => {
        if (lineOfBusinessId) {
            fetchServiceLinesByLineOfBusiness(lineOfBusinessId);
        } else {
            setServiceLines([]);
        }
        setServiceLineId('');
        setCapabilityAreas([]);
    }, [lineOfBusinessId]);

    useEffect(() => {
        if (serviceLineId) {
            fetchCapabilityAreasByServiceLine(serviceLineId);
        } else {
            setCapabilityAreas([]);
        }
    }, [serviceLineId]);

    useEffect(() => {
        // Reset "to" date when "from" date changes to ensure it's not before the "from" date
        if (durationFrom && durationTo && durationTo < durationFrom) {
            setDurationTo('');
        }
    }, [durationFrom]);

    const fetchLineOfBusinesses = () => {
        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR) {
            // For Administrator, fetch all line of businesses
            axios.get('/lineOfBusiness')
            .then(function (response) {
                setLineOfBusinesses(response.data.lineOfBusiness);
            })
            .catch(function (error) {
                console.log(error);
            })
        } else {
            // For non-administrator users, set their line of business by default
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.line_of_business_id) {
                setLineOfBusinessId(user.line_of_business_id);
            }
        }
    }

    const fetchServiceLinesByLineOfBusiness = (lineOfBusinessId) => {
        axios.get(`/serviceLine/lineOfBusiness/${lineOfBusinessId}`)
        .then(function (response) {
            setServiceLines(response.data.serviceLines);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    const fetchCapabilityAreasByServiceLine = (serviceLineId) => {
        axios.get(`/capabilityArea/serviceLine/${serviceLineId}`)
        .then(function (response) {
            setCapabilityAreas(response.data.capabilityAreas);
        })
        .catch(function (error) {
            console.log(error);
        })
    }



    const fetchProjects = () => {
        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR) {
            // For Administrator, fetch all projects
            axios.get('/projects')
            .then(function (response) {
                setProjects(response.data.projects);
            })
            .catch(function (error) {
                console.log(error);
            })
        } else {
            // For non-administrator users, fetch projects by their line of business
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.line_of_business_id) {
                axios.get(`/projects/lineOfBusiness/${user.line_of_business_id}`)
                .then(function (response) {
                    setProjects(response.data.projects);
                })
                .catch(function (error) {
                    console.log(error);
                })
            }
        }
    }

    const handleCapabilityAreaAdd = (selectedList, selectedItem) => {
        setCapabilityAreaIds(selectedList.map(item => item.id));
    }

    const handleCapabilityAreaRemove = (selectedList, removedItem) => {
        setCapabilityAreaIds(selectedList.map(item => item.id));
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProjectAttachment(file);
        }
    }

    const validateForm = () => {
        if (!title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter work request title!',
                showConfirmButton: true
            })
            return false;
        }

        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR && !lineOfBusinessId) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a line of business!',
                showConfirmButton: true
            })
            return false;
        }

        if (!serviceLineId) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a service line!',
                showConfirmButton: true
            })
            return false;
        }

        if (capabilityAreaIds.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select at least one capability area!',
                showConfirmButton: true
            })
            return false;
        }

        if (!projectId) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a project!',
                showConfirmButton: true
            })
            return false;
        }

        if (!durationFrom) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select duration from date!',
                showConfirmButton: true
            })
            return false;
        }

        if (!durationTo) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select duration to date!',
                showConfirmButton: true
            })
            return false;
        }

        if (!hoursPerWeek || hoursPerWeek <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter valid hours per week!',
                showConfirmButton: true
            })
            return false;
        }

        if (durationFrom && durationTo && durationTo < durationFrom) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Date Range!',
                text: 'Duration "To" date cannot be before "From" date',
                showConfirmButton: true
            })
            return false;
        }

        return true;
    }

    const handleSubmitToOffshoreLead = () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const requestData = {
            title: title,
            line_of_business_id: lineOfBusinessId,
            service_line_id: serviceLineId,
            capability_area_ids: capabilityAreaIds,
            project_id: projectId,
            duration_from: durationFrom,
            duration_to: durationTo,
            hours_per_week: hoursPerWeek,
            notes: notes
        };

        console.log("Selected resources: ", selectedResources);

        if (selectedResources.length > 0) {
            requestData.resource_ids = selectedResources.map(r => r.emp_id);
        }

        console.log("Submitting work request data:", requestData);

        axios.post('/workRequest/add', requestData, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Work Request submitted successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/workRequest");
        })
        .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occurred!',
                text: error.response?.data?.message || 'Something went wrong',
                showConfirmButton: true
            })
        })
        .finally(() => {
            setIsSaving(false);
        });
    }

    const handleSelectPreferredTeam = () => {
        if (!validateForm()) return;

        if (capabilityAreaIds.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select capability areas first!',
                showConfirmButton: true
            })
            return;
        }

        setShowResourceModal(true);
    }

    const handleResourceSelection = (selectedResources) => {
        console.log("Selected resources: ", selectedResources);
        setSelectedResources(selectedResources);
        setShowResourceModal(false);
        
        // setTimeout(() => {
        //     handleSubmitToOffshoreLead();
        // }, 1000);
    }

    const handleCloseResourceModal = () => {
        setShowResourceModal(false);
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Create Work Request</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Work Request Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="title" className="form-label required-field">
                                        Work Request Title
                                    </label>
                                    <input 
                                        onChange={(event)=>{setTitle(event.target.value)}}
                                        value={title}
                                        type="text"
                                        className="form-control"
                                        id="title"
                                        name="title"
                                        placeholder="Enter work request title"
                                        required
                                    />
                                </div>
                                
                                {AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR && (
                                    <div className="form-group full-width">
                                        <label htmlFor="lineOfBusiness" className="form-label required-field">
                                            Line of Business
                                        </label>
                                        <select 
                                            name="lineOfBusiness" 
                                            id="lineOfBusiness" 
                                            className="form-select" 
                                            onChange={(e) => setLineOfBusinessId(e.target.value)}
                                            value={lineOfBusinessId}
                                            required
                                        >
                                            <option value=""> -- Select a Line of Business -- </option>
                                            {lineOfBusinesses.map((lineOfBusiness) => (
                                                <option key={lineOfBusiness.id} value={lineOfBusiness.id}>
                                                    {lineOfBusiness.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="serviceLine" className="form-label required-field">
                                            Service Line
                                        </label>
                                        <select 
                                            name="serviceLine" 
                                            id="serviceLine" 
                                            className="form-select" 
                                            onChange={(e) => setServiceLineId(e.target.value)}
                                            value={serviceLineId}
                                            required
                                        >
                                            <option value=""> -- Select a Service Line -- </option>
                                            {serviceLines.map((serviceLine) => (
                                                <option key={serviceLine.id} value={serviceLine.id}>
                                                    {serviceLine.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="project" className="form-label required-field">
                                            Project
                                        </label>
                                        <select 
                                            name="project" 
                                            id="project" 
                                            className="form-select" 
                                            onChange={(e) => setProjectId(e.target.value)}
                                            value={projectId}
                                            required
                                        >
                                            <option value=""> -- Select a Project -- </option>
                                            {projects.map((project) => (
                                                <option key={project.project_id} value={project.project_id}>
                                                    {project.project_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="capabilityAreas" className="form-label required-field">
                                        Capability Areas
                                    </label>
                                    <Multiselect
                                        options={capabilityAreas} 
                                        selectedValues={capabilityAreas.filter(ca => capabilityAreaIds.includes(ca.id))} 
                                        onSelect={handleCapabilityAreaAdd}
                                        onRemove={handleCapabilityAreaRemove}
                                        showCheckbox={true}
                                        displayValue="name"
                                        closeIcon="close"
                                        placeholder="Select capability areas..."
                                        disabled={!serviceLineId}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="durationFrom" className="form-label required-field">
                                            Duration From
                                        </label>
                                        <input 
                                            onChange={(event)=>{setDurationFrom(event.target.value)}}
                                            value={durationFrom}
                                            type="date"
                                            className="form-control"
                                            id="durationFrom"
                                            name="durationFrom"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="durationTo" className="form-label required-field">
                                            Duration To
                                        </label>
                                        <input 
                                            onChange={(event)=>{setDurationTo(event.target.value)}}
                                            value={durationTo}
                                            type="date"
                                            className="form-control"
                                            id="durationTo"
                                            name="durationTo"
                                            min={durationFrom}
                                            disabled={!durationFrom}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="hoursPerWeek" className="form-label required-field">
                                            Hours Per Week
                                        </label>
                                        <input 
                                            onChange={(event)=>{setHoursPerWeek(event.target.value)}}
                                            value={hoursPerWeek}
                                            type="number"
                                            className="form-control"
                                            id="hoursPerWeek"
                                            name="hoursPerWeek"
                                            placeholder="Enter hours per week"
                                            min="1"
                                            max="168"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="projectAttachment" className="form-label">
                                            Project Attachment (Optional)
                                        </label>
                                        <input 
                                            onChange={handleFileChange}
                                            type="file"
                                            className="form-control"
                                            id="projectAttachment"
                                            name="projectAttachment"
                                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                        />
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="notes" className="form-label">
                                        Notes
                                    </label>
                                    <textarea 
                                        onChange={(event)=>{setNotes(event.target.value)}}
                                        value={notes}
                                        className="form-control"
                                        id="notes"
                                        name="notes"
                                        placeholder="Enter additional notes (optional)"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <div className="form-actions-left">
                                    <button 
                                        type="button"
                                        onClick={handleCancel} 
                                        className="btn btn-outline"
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-x-circle"></i>
                                        Cancel
                                    </button>
                                </div>
                                <div className="form-actions-right">
                                    <button 
                                        type="button"
                                        onClick={handleSelectPreferredTeam}
                                        className="btn btn-primary"
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-people-fill"></i>
                                        Select Preferred Team
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSubmitToOffshoreLead}
                                        className="btn btn-success"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="loading-spinner"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send"></i>
                                                Submit to Offshore Lead
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showResourceModal && (
                <ResourceSelectionModal
                    capabilityAreaIds={capabilityAreaIds}
                    onResourceSelection={handleResourceSelection}
                    onClose={handleCloseResourceModal}
                />
            )}
        </Layout>
    );
}
  
export default WorkRequestCreate; 