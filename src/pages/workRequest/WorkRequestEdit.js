import React, {useState, useEffect} from 'react'
import { useNavigate, useParams } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
import Multiselect from 'multiselect-react-dropdown';
import ResourceSelectionModal from './ResourceSelectionModal';
import * as Utils from "../../lib/Utils";

function WorkRequestEdit() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
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
    const [serviceLines, setServiceLines] = useState([]);
    const [capabilityAreas, setCapabilityAreas] = useState([]);
    const [projects, setProjects] = useState([]);
    
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/workRequest");
    }

    useEffect(() => {
        fetchServiceLines();
        fetchProjects();
        fetchWorkRequest();
    }, []);

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

    const fetchWorkRequest = () => {
        axios.get(`/workRequest/${id}`)
        .then(function (response) {
            const workRequest = response.data.workRequest;
            setTitle(workRequest.title);
            setServiceLineId(workRequest.service_line_id);
            setProjectId(workRequest.project_id);
            setDurationFrom(Utils.formatDateYYYYMMDD(workRequest.duration_from));
            setDurationTo(Utils.formatDateYYYYMMDD(workRequest.duration_to));
            setHoursPerWeek(workRequest.hours_per_week);
            setNotes(workRequest.notes || '');
            
            // Set capability areas
            if (workRequest.capability_areas) {
                setCapabilityAreaIds(workRequest.capability_areas.map(ca => ca.id));
            }
            
            // Set selected resources
            if (workRequest.resources) {
                setSelectedResources(workRequest.resources);
            }
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load work request details'
            });
        })
    }

    const fetchServiceLines = () => {
        axios.get('/serviceLine')
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
        axios.get('/projects')
        .then(function (response) {
            setProjects(response.data.projects);
        })
        .catch(function (error) {
            console.log(error);
        })
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
                icon: 'error',
                title: 'Validation Error',
                text: 'Title is required'
            });
            return false;
        }
        if (!serviceLineId) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Service Line is required'
            });
            return false;
        }
        if (!projectId) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Project is required'
            });
            return false;
        }
        if (!durationFrom) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Duration From is required'
            });
            return false;
        }
        if (!durationTo) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Duration To is required'
            });
            return false;
        }
        if (!hoursPerWeek) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Hours Per Week is required'
            });
            return false;
        }
        if (new Date(durationTo) <= new Date(durationFrom)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Duration To must be after Duration From'
            });
            return false;
        }
        return true;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('service_line_id', serviceLineId);
        formData.append('project_id', projectId);
        formData.append('duration_from', durationFrom);
        formData.append('duration_to', durationTo);
        formData.append('hours_per_week', hoursPerWeek);
        formData.append('notes', notes);
        formData.append('capability_area_ids', JSON.stringify(capabilityAreaIds));
        formData.append('resource_ids', JSON.stringify(selectedResources.map(r => r.emp_id)));
        
        if (projectAttachment) {
            formData.append('project_attachment', projectAttachment);
        }

        axios.post(`/workRequest/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Work Request updated successfully'
            }).then(() => {
                navigate("/workRequest");
            });
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update work request'
            });
        })
        .finally(() => {
            setIsSaving(false);
        });
    }

    const handleResourceSelection = (resources) => {
        setSelectedResources(resources);
        setShowResourceModal(false);
    }

    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Edit Work Request</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3 className="form-section-title">Work Request Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="title" className="form-label required-field">
                                        Work Request Title
                                    </label>
                                    <input 
                                        type="text" 
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="form-control"
                                        placeholder="Enter work request title"
                                        required
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="serviceLine" className="form-label required-field">
                                            Service Line
                                        </label>
                                        <select 
                                            id="serviceLine"
                                            value={serviceLineId}
                                            onChange={(e) => setServiceLineId(e.target.value)}
                                            className="form-select"
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
                                            id="project"
                                            value={projectId}
                                            onChange={(e) => setProjectId(e.target.value)}
                                            className="form-select"
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
                                            type="date" 
                                            id="durationFrom"
                                            value={durationFrom}
                                            onChange={(e) => setDurationFrom(e.target.value)}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="durationTo" className="form-label required-field">
                                            Duration To
                                        </label>
                                        <input 
                                            type="date" 
                                            id="durationTo"
                                            value={durationTo}
                                            onChange={(e) => setDurationTo(e.target.value)}
                                            className="form-control"
                                            required
                                            min={durationFrom}
                                            disabled={!durationFrom}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="hoursPerWeek" className="form-label required-field">
                                            Hours Per Week
                                        </label>
                                        <input 
                                            type="number" 
                                            id="hoursPerWeek"
                                            value={hoursPerWeek}
                                            onChange={(e) => setHoursPerWeek(e.target.value)}
                                            className="form-control"
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
                                            type="file" 
                                            id="projectAttachment"
                                            onChange={handleFileChange}
                                            className="form-control"
                                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                        />
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="notes" className="form-label">
                                        Notes
                                    </label>
                                    <textarea 
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="form-control"
                                        placeholder="Enter additional notes (optional)"
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">
                                        Preferred Team
                                    </label>
                                    <div className="resource-selection-container">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-primary"
                                            onClick={() => setShowResourceModal(true)}
                                        >
                                            <i className="bi bi-people-fill"></i>
                                            Select Preferred Team
                                        </button>
                                        {selectedResources.length > 0 && (
                                            <div className="selected-resources">
                                                <h4>Selected Resources ({selectedResources.length})</h4>
                                                <div className="resource-list">
                                                    {selectedResources.map((resource, index) => (
                                                        <div key={index} className="resource-item">
                                                            <span>{resource.first_name} {resource.last_name}</span>
                                                            <span className="resource-role">{resource.designation}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                                Update Work Request
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
                    onClose={() => setShowResourceModal(false)}
                />
            )}
        </Layout>
    );
}

export default WorkRequestEdit;
