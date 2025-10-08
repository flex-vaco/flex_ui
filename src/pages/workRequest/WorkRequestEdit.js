import React, {useState, useEffect} from 'react'
import { useNavigate, useParams } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import "../FormStyles.css"
import Multiselect from 'multiselect-react-dropdown';
import ResourceSelectionModal from './ResourceSelectionModal';
import * as Utils from "../../lib/Utils";

function WorkRequestEdit() {
    const { id } = useParams();
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
    const [selectedOffshoreLeads, setSelectedOffshoreLeads] = useState([]);
    const [workRequestStatus, setWorkRequestStatus] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingWorkRequest, setIsLoadingWorkRequest] = useState(true);
    
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
        // Fetch projects first, then work request to ensure project list is available
        fetchProjects().then(() => {
            fetchWorkRequest();
        });
    }, []);

    useEffect(() => {
        if (lineOfBusinessId) {
            fetchServiceLinesByLineOfBusiness(lineOfBusinessId);
        } else {
            setServiceLines([]);
        }
        // Only reset serviceLineId if we're not loading work request data
        // if (!isLoadingWorkRequest) {
        //     setServiceLineId('');
        //     setCapabilityAreas([]);
        // }
    }, [lineOfBusinessId, isLoadingWorkRequest]);

    useEffect(() => {
        if (serviceLineId) {
            fetchCapabilityAreasByServiceLine(serviceLineId);
            fetchOffshoreLeadsByServiceLine(serviceLineId);
        } else {
            // Only reset if we're not loading work request data
            if (!isLoadingWorkRequest) {
                setCapabilityAreas([]);
                setSelectedOffshoreLeads([]);
            }
        }
    }, [serviceLineId, isLoadingWorkRequest]);

    useEffect(() => {
        // Reset "to" date when "from" date changes to ensure it's not before the "from" date
        if (durationFrom && durationTo && durationTo < durationFrom) {
            setDurationTo('');
        }
    }, [durationFrom]);

    // Fetch service lines and capability areas after work request data is loaded
    useEffect(() => {
        if (!isLoadingWorkRequest && lineOfBusinessId && serviceLineId) {
            // Ensure service lines are loaded for the line of business
            if (serviceLines.length === 0) {
                fetchServiceLinesByLineOfBusiness(lineOfBusinessId);
            }
            // Ensure capability areas are loaded for the service line
            if (capabilityAreas.length === 0) {
                fetchCapabilityAreasByServiceLine(serviceLineId);
                fetchOffshoreLeadsByServiceLine(serviceLineId);
            }
        }
    }, [isLoadingWorkRequest, lineOfBusinessId, serviceLineId, serviceLines.length, capabilityAreas.length]);

    // Ensure project gets selected when projects list is loaded
    useEffect(() => {
        if (!isLoadingWorkRequest && projectId && projects.length > 0) {
            // Check if the projectId exists in the projects list
            const projectExists = projects.some(project => project.project_id == projectId);
            if (!projectExists) {
                console.log('Project not found in projects list, resetting projectId');
                setProjectId('');
            }
        }
    }, [isLoadingWorkRequest, projectId, projects]);

    const fetchWorkRequest = () => {
        axios.get(`/workRequest/${id}`)
        .then(function (response) {
            const workRequest = response.data.workRequest;
            const user = response.data.user;
            
            setCurrentUser(user);
            setWorkRequestStatus(workRequest.status);
            
            // Check if user can edit this work request
            const canEdit = (user?.role === 'project_manager' || user?.role === 'producer') && 
                           workRequest.status === 'draft' &&
                           workRequest.submitted_by === user?.user_id;
            
            if (!canEdit) {
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'You cannot edit this work request. Only draft work requests created by you can be edited.',
                    showConfirmButton: true
                }).then(() => {
                    navigate("/workRequest");
                });
                return;
            }
            
            setTitle(workRequest.title);
            setLineOfBusinessId(workRequest.line_of_business_id);
            setServiceLineId(workRequest.service_line_id);
            setProjectId(workRequest.project_id);
            setDurationFrom(Utils.formatDateYYYYMMDD(workRequest.duration_from));
            setDurationTo(Utils.formatDateYYYYMMDD(workRequest.duration_to));
            setHoursPerWeek(workRequest.hours_per_week);
            setNotes(workRequest.notes || '');
            
            // Set capability areas
            if (workRequest.capability_areas) {
                setCapabilityAreaIds(workRequest.capability_areas.map(ca => ca.capability_area_id));
            }
            
            // Set selected resources
            if (workRequest.resources) {
                setSelectedResources(workRequest.resources);
            }
            
            // Set selected offshore leads
            if (workRequest.offshore_leads) {
                setSelectedOffshoreLeads(workRequest.offshore_leads);
            }
            
            setIsLoadingWorkRequest(false);
            setIsLoading(false);
        })
        .catch(function (error) {
            console.log(error);
            setIsLoadingWorkRequest(false);
            setIsLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load work request details'
            });
        })
    }

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

    const fetchOffshoreLeadsByServiceLine = (serviceLineId) => {
        axios.get(`/workRequest/offshoreLeads/serviceLine/${serviceLineId}`)
        .then(function (response) {
            // Automatically set all offshore leads for the selected service line
            setSelectedOffshoreLeads(response.data.offshoreLeads);
        })
        .catch(function (error) {
            console.log(error);
        })
    }



    const fetchProjects = () => {
        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR) {
            // For Administrator, fetch all projects
            return axios.get('/projects')
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
                return axios.get(`/projects/lineOfBusiness/${user.line_of_business_id}`)
                .then(function (response) {
                    setProjects(response.data.projects);
                })
                .catch(function (error) {
                    console.log(error);
                })
            }
            return Promise.resolve(); // Return resolved promise if no user or line_of_business_id
        }
    }

    const handleCapabilityAreaAdd = (selectedList, selectedItem) => {
        setCapabilityAreaIds(selectedList.map(item => item.capability_area_id));
    }

    const handleCapabilityAreaRemove = (selectedList, removedItem) => {
        setCapabilityAreaIds(selectedList.map(item => item.capability_area_id));
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
        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR && !lineOfBusinessId) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Line of Business is required'
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
        formData.append('line_of_business_id', lineOfBusinessId);
        formData.append('service_line_id', serviceLineId);
        formData.append('project_id', projectId);
        formData.append('duration_from', durationFrom);
        formData.append('duration_to', durationTo);
        formData.append('hours_per_week', hoursPerWeek);
        formData.append('notes', notes);
        formData.append('capability_area_ids', JSON.stringify(capabilityAreaIds));
        formData.append('resource_ids', JSON.stringify(selectedResources.map(r => r.emp_id)));
        formData.append('offshore_lead_ids', JSON.stringify(selectedOffshoreLeads.map(r => r.user_id)));
        formData.append('status', 'draft');
        
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

    const handleSubmitToOffshoreLead = () => {
        if (!validateForm()) {
            return;
        }

        // Show confirmation dialog
        Swal.fire({
            title: 'Submit Work Request',
            text: 'Do you want to submit this request to offshore lead?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Submit',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                setIsSaving(true);

                const formData = new FormData();
                formData.append('title', title);
                formData.append('line_of_business_id', lineOfBusinessId);
                formData.append('service_line_id', serviceLineId);
                formData.append('project_id', projectId);
                formData.append('duration_from', durationFrom);
                formData.append('duration_to', durationTo);
                formData.append('hours_per_week', hoursPerWeek);
                formData.append('notes', notes);
                formData.append('capability_area_ids', JSON.stringify(capabilityAreaIds));
                formData.append('resource_ids', JSON.stringify(selectedResources.map(r => r.emp_id)));
                formData.append('offshore_lead_ids', JSON.stringify(selectedOffshoreLeads.map(r => r.user_id)));
                formData.append('status', 'submitted');
                
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
                        text: 'Work Request submitted to offshore lead successfully'
                    }).then(() => {
                        navigate("/workRequest");
                    });
                })
                .catch(function (error) {
                    console.log(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to submit work request'
                    });
                })
                .finally(() => {
                    setIsSaving(false);
                });
            }
        });
    }

    const handleResourceSelection = (resources) => {
        setSelectedResources(resources);
        setShowResourceModal(false);
    }

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Work Request</h1>
                        </div>
                        <div className="form-page-body">
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading work request details...</p>
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
                                
                                {AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR && (
                                    <div className="form-group full-width">
                                        <label htmlFor="lineOfBusiness" className="form-label required-field">
                                            Line of Business
                                        </label>
                                        <select 
                                            id="lineOfBusiness"
                                            value={lineOfBusinessId}
                                            onChange={(e) => setLineOfBusinessId(e.target.value)}
                                            className="form-select"
                                            required
                                        >
                                            <option value=""> -- Select a Line of Business -- </option>
                                            {lineOfBusinesses.map((lineOfBusiness) => (
                                                <option key={lineOfBusiness.line_of_business_id} value={lineOfBusiness.line_of_business_id}>
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
                                            id="serviceLine"
                                            value={serviceLineId}
                                            onChange={(e) => setServiceLineId(e.target.value)}
                                            className="form-select"
                                            required
                                        >
                                            <option value=""> -- Select a Service Line -- </option>
                                            {serviceLines.map((serviceLine) => (
                                                <option key={serviceLine.service_line_id} value={serviceLine.service_line_id}>
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
                                        selectedValues={capabilityAreas.filter(ca => capabilityAreaIds.includes(ca.capability_area_id))}
                                        onSelect={handleCapabilityAreaAdd}
                                        onRemove={handleCapabilityAreaRemove}
                                        showCheckbox={true}
                                        displayValue="name"
                                        closeIcon="close"
                                        placeholder="Select capability areas..."
                                        disabled={!serviceLineId}
                                    />
                                </div>

                                {selectedOffshoreLeads.length > 0 && (
                                    <div className="form-group full-width">
                                        <label htmlFor="offshoreLeads" className="form-label">
                                            Offshore Leads (Auto-selected based on Service Line)
                                        </label>
                                        <div className="p-3 bg-light rounded">
                                            {selectedOffshoreLeads.map((lead, index) => (
                                                <span key={index} className="badge bg-info me-2 mb-2">
                                                    {lead.first_name} {lead.last_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                        type="button"
                                        onClick={handleSubmitToOffshoreLead}
                                        className="btn btn-primary me-2"
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
                    workRequest={{
                        duration_from: durationFrom,
                        duration_to: durationTo,
                        hours_per_week: hoursPerWeek
                    }}
                />
            )}
        </Layout>
    );
}

export default WorkRequestEdit;
