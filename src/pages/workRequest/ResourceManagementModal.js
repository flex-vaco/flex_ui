import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ResourceManagementModal.css';
import * as Utils from '../../lib/Utils';
import { 
    generateFourWeeks, 
    calculateAvailabilityPercentage, 
    getAvailabilityColorClass, 
    formatAvailabilityText, 
    formatWeekDateRange 
} from '../../lib/WeeklyAvailabilityUtils';

function ResourceManagementModal({ workRequest, onClose, onStatusUpdate, isReadOnly = false, currentUser = null }) {
    const [existingResources, setExistingResources] = useState([]);
    const [availableResources, setAvailableResources] = useState([]);
    const [selectedResources, setSelectedResources] = useState([]);
    const [resourceAvailability, setResourceAvailability] = useState({});
    const [weeklyAvailability, setWeeklyAvailability] = useState({});
    const [weeks, setWeeks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [hasExistingResources, setHasExistingResources] = useState(false);
    const [canSelectResources, setCanSelectResources] = useState(false);

    useEffect(() => {
        if (workRequest) {
            fetchExistingResources();
            // Check if user can select resources
            const canSelect = workRequest.capability_areas && 
                            workRequest.capability_areas.length > 0 && 
                            (currentUser?.role === 'offshore_lead' || currentUser?.role === 'off_shore_lead') && 
                            workRequest.status !== 'approved' && 
                            workRequest.status !== 'rejected';
            
            setCanSelectResources(canSelect);
            
            // Always fetch available resources if user is offshore lead and status allows
            if (canSelect) {
                fetchAvailableResources();
            }
        }
    }, [workRequest, currentUser]);

    const fetchExistingResources = () => {
        setIsLoading(true);
        axios.get(`/workRequest/${workRequest.work_request_id}`)
        .then(function (response) {
            const resources = response.data.workRequest.resources || [];
            setExistingResources(resources);
            setHasExistingResources(resources.length > 0);
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const fetchAvailableResources = () => {
        // First, we need to get the detailed work request to get the capability areas as an array
        axios.get(`/workRequest/${workRequest.work_request_id}`)
        .then(function (response) {
            const detailedWorkRequest = response.data.workRequest;
            const capabilityAreas = detailedWorkRequest.capability_areas || [];
            
            if (capabilityAreas.length === 0) {
                setAvailableResources([]);
                return;
            }
            
            const capabilityAreaIds = capabilityAreas.map(ca => ca.capability_area_id);
            
            return axios.post('/workRequest/offshoreLead/filteredResources', {
                capabilityAreaIds: capabilityAreaIds
            });
        })
        .then(function (response) {
            if (response && response.data) {
                setAvailableResources(response.data.resources);
                // Fetch availability for the loaded resources
                if (response.data.resources.length > 0) {
                    fetchResourceAvailability(response.data.resources);
                }
            }
        })
        .catch(function (error) {
            console.log('Error fetching available resources:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error fetching resources',
                text: 'Failed to load available resources',
                showConfirmButton: true
            });
        });
    };

    const fetchResourceAvailability = (resources) => {
        if (!workRequest?.duration_from || !workRequest?.duration_to) {
            return;
        }

        const empIds = resources.map(r => r.emp_id);
        
        // Generate weeks on frontend for display
        const generatedWeeks = generateFourWeeks(workRequest.duration_from);
        setWeeks(generatedWeeks);
        
        axios.post('/empPrjAloc/resourceAvailability', {
            empIds: empIds,
            fromDate: workRequest.duration_from,
            toDate: workRequest.duration_to,
            weeklyView: true
        })
        .then(function (response) {
            if (response.data.resource_availability) {
                const availabilityMap = {};
                const weeklyMap = {};
                
                response.data.resource_availability.forEach(empData => {
                    availabilityMap[empData.emp_id] = empData;
                    
                    // Organize weekly data by employee
                    if (empData.weekly_availability) {
                        weeklyMap[empData.emp_id] = empData.weekly_availability;
                    }
                });
                
                setResourceAvailability(availabilityMap);
                setWeeklyAvailability(weeklyMap);
            }
        })
        .catch(function (error) {
            console.log('Error fetching resource availability:', error);
        });
    };

    const getWeeklyAvailabilityDisplay = (empId) => {
        const weeklyData = weeklyAvailability[empId];
        if (!weeklyData || weeklyData.length === 0) {
            return { text: 'Loading...', class: 'availability-loading' };
        }
        
        const hoursPerWeek = workRequest?.hours_per_week || 40;
        
        return weeklyData.map(weekData => {
            const percentage = calculateAvailabilityPercentage(weekData.available_hours, hoursPerWeek);
            const colorClass = getAvailabilityColorClass(percentage);
            const text = formatAvailabilityText(weekData.available_hours, hoursPerWeek);
            
            return {
                week: weekData.week,
                text: text,
                class: colorClass,
                percentage: percentage,
                availableHours: weekData.available_hours
            };
        });
    };

    const handleResourceToggle = (resource) => {
        const isSelected = selectedResources.some(r => r.emp_id === resource.emp_id);
        
        if (isSelected) {
            setSelectedResources(selectedResources.filter(r => r.emp_id !== resource.emp_id));
        } else {
            setSelectedResources([...selectedResources, resource]);
        }
    };

    const handleSelectAll = () => {
        if (selectedResources.length === availableResources.length) {
            setSelectedResources([]);
        } else {
            setSelectedResources([...availableResources]);
        }
    };

    const handleApprove = () => {
        if (!hasExistingResources && selectedResources.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Resources Selected',
                text: 'Please select at least one resource before approving',
                showConfirmButton: true
            });
            return;
        }

        setIsSubmitting(true);
        const resourceIds = selectedResources.map(r => r.emp_id);
        
        axios.post(`/workRequest/offshoreLead/updateStatus/${workRequest.work_request_id}`, {
            status: 'approved',
            resourceIds: resourceIds
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Work Request Approved',
                text: hasExistingResources ? 
                    'The work request has been approved with existing resources' :
                    `The work request has been approved and ${selectedResources.length} resource(s) have been assigned`,
                showConfirmButton: false,
                timer: 2000
            });
            onStatusUpdate();
            onClose();
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to approve work request',
                showConfirmButton: true
            });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Rejection Reason Required',
                text: 'Please provide a reason for rejection',
                showConfirmButton: true
            });
            return;
        }

        setIsSubmitting(true);
        
        axios.post(`/workRequest/offshoreLead/updateStatus/${workRequest.work_request_id}`, {
            status: 'rejected',
            rejectionReason: rejectionReason
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Work Request Rejected',
                text: 'The work request has been rejected',
                showConfirmButton: false,
                timer: 2000
            });
            onStatusUpdate();
            onClose();
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to reject work request',
                showConfirmButton: true
            });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'draft') return 'status-pending';
        if (statusLower === 'submitted') return 'status-active';
        if (statusLower === 'approved') return 'status-completed';
        if (statusLower === 'rejected') return 'status-cancelled';
        if (statusLower === 'in_progress') return 'status-active';
        if (statusLower === 'completed') return 'status-completed';
        return 'status-pending';
    };

    const getResourceListTitle = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'approved') return 'Approved Resources';
        if (statusLower === 'rejected') return 'Rejected Resources';
        return 'Requested Resources';
    };

    const getActionButtonText = () => {
        if (hasExistingResources) {
            return 'Approve Current Resources';
        } else if (selectedResources.length > 0) {
            return `Approve (${selectedResources.length} resource${selectedResources.length > 1 ? 's' : ''})`;
        } else {
            return 'Approve';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content resource-management-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Resource Management - {workRequest?.title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Work Request Details */}
                    <div className="work-request-details">
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Status:</label>
                                <span className={`status-badge ${getStatusBadgeClass(workRequest?.status)}`}>
                                    {workRequest?.status?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Line of Business:</label>
                                <span>{workRequest?.line_of_business_name}</span>
                            </div>
                            <div className="detail-item">
                                <label>Service Line:</label>
                                <span>{workRequest?.service_line_name}</span>
                            </div>
                            <div className="detail-item">
                                <label>Project:</label>
                                <span>{workRequest?.project_name}</span>
                            </div>
                            <div className="detail-item">
                                <span>{Utils.formatDateYYYYMMDD(workRequest?.duration_from)} - {Utils.formatDateYYYYMMDD(workRequest?.duration_to)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Hours per Week:</label>
                                <span>{workRequest?.hours_per_week}</span>
                            </div>
                            <div className="detail-item">
                                <label>Capability Areas:</label>
                                <span>
                                    {Array.isArray(workRequest?.capability_areas) 
                                        ? workRequest.capability_areas.map(ca => ca.name).join(', ')
                                        : workRequest?.capability_areas || 'No capability areas'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Existing Resources Section */}
                    {hasExistingResources && (
                        <div className="existing-resources-section">
                            <h3>{getResourceListTitle(workRequest?.status)}</h3>
                            <div className="resources-table-container">
                                <table className="resources-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Primary Skills</th>
                                            <th>Secondary Skills</th>
                                            <th>Allocation %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {existingResources.map((resource) => (
                                            <tr key={resource.emp_id}>
                                                <td>
                                                    <div className="resource-name">
                                                        <strong>{resource.first_name} {resource.last_name}</strong>
                                                    </div>
                                                </td>
                                                <td>{resource.email || '-'}</td>
                                                <td>
                                                    <div className="skills-container">
                                                        {resource.primary_skills ? 
                                                            resource.primary_skills.split(',').map((skill, index) => (
                                                                <span key={index} className="skill-badge primary">
                                                                    {skill.trim()}
                                                                </span>
                                                            ))
                                                            : '-'
                                                        }
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="skills-container">
                                                        {resource.secondary_skills ? 
                                                            resource.secondary_skills.split(',').map((skill, index) => (
                                                                <span key={index} className="skill-badge secondary">
                                                                    {skill.trim()}
                                                                </span>
                                                            ))
                                                            : '-'
                                                        }
                                                    </div>
                                                </td>
                                                <td>{resource.allocation_percentage || 100}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No Resources Message for Read-Only Mode */}
                    {!hasExistingResources && isReadOnly && (
                        <div className="no-resources-section">
                            <div className="empty-state">
                                <i className="bi bi-people"></i>
                                <p>No resources have been assigned to this work request yet.</p>
                            </div>
                        </div>
                    )}

                    {/* Resource Selection Section */}
                    {canSelectResources && !isReadOnly && (
                        <div className="resource-selection-section">
                            <div className="section-header">
                                <h3>
                                    <i className="bi bi-people-fill"></i>
                                    {hasExistingResources ? 'Add Additional Resources' : 'Select Resources'}
                                </h3>
                                {!hasExistingResources && (
                                    <p className="section-description">
                                        Select resources that match the required capability areas and are under your line of business.
                                    </p>
                                )}
                                {hasExistingResources && (
                                    <p className="section-description">
                                        You can add additional resources to the existing ones, or approve with current resources only.
                                    </p>
                                )}
                            </div>
                            


                            {isLoading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>Loading available resources...</p>
                                </div>
                            ) : (
                                <div className="resources-table-container">
                                    {availableResources.length === 0 ? (
                                        <div className="empty-state">
                                            <i className="bi bi-people"></i>
                                            <p>No resources found matching the required criteria</p>
                                            <small>Try adjusting the capability areas or check if resources are available in your line of business.</small>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="table-actions">
                                                <div className="selection-info">
                                                    <span className="selection-count">
                                                        {selectedResources.length} of {availableResources.length} resources selected
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline btn-sm"
                                                    onClick={handleSelectAll}
                                                >
                                                    {selectedResources.length === availableResources.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <table className="resources-table">
                                                <thead>
                                                    <tr>
                                                        <th width="50">Select</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Primary Skills</th>
                                                        <th>Secondary Skills</th>
                                                        <th>Experience</th> 
                                                        <th>Cost per Hour</th>
                                                        {weeks.map(week => (
                                                            <th key={week.weekNumber} className="week-header">
                                                                <div className="week-label">{week.label}</div>
                                                                <div className="week-dates">{formatWeekDateRange(week.startDate, week.endDate)}</div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {availableResources.map((resource) => {
                                                        const isSelected = selectedResources.some(r => r.emp_id === resource.emp_id);
                                                        const weeklyAvailabilityDisplay = getWeeklyAvailabilityDisplay(resource.emp_id);
                                                        return (
                                                            <tr key={resource.emp_id} className={isSelected ? 'selected-row' : ''}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => handleResourceToggle(resource)}
                                                                        className="resource-checkbox"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div className="resource-name">
                                                                        <strong>{resource.first_name} {resource.last_name}</strong>
                                                                    </div>
                                                                </td>
                                                                <td>{resource.email || '-'}</td>
                                                                <td>
                                                                    <div className="skills-container">
                                                                        {resource.primary_skills ? 
                                                                            resource.primary_skills.split(',').map((skill, index) => (
                                                                                <span key={index} className="skill-badge primary">
                                                                                    {skill.trim()}
                                                                                </span>
                                                                            ))
                                                                            : '-'
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="skills-container">
                                                                        {resource.secondary_skills ? 
                                                                            resource.secondary_skills.split(',').map((skill, index) => (
                                                                                <span key={index} className="skill-badge secondary">
                                                                                    {skill.trim()}
                                                                                </span>
                                                                            ))
                                                                            : '-'
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td>{resource.total_work_experience_years || '-'} Years</td>
                                                                <td>$ {resource.cost_per_hour || '-'}</td>
                                                                {weeks.map((week, index) => {
                                                                    const weekData = weeklyAvailabilityDisplay[index];
                                                                    return (
                                                                        <td key={week.weekNumber}>
                                                                            {weekData ? (
                                                                                <div className="weekly-availability-cell">
                                                                                    <span className={`availability-badge ${weekData.class}`}>
                                                                                        {weekData.text}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="availability-badge availability-loading">
                                                                                    Loading...
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rejection Form */}
                    {showRejectionForm && !isReadOnly && (
                        <div className="rejection-form">
                            <h3>Rejection Reason</h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this work request..."
                                rows="4"
                                className="rejection-reason-input"
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {isReadOnly ? 'Close' : 'Cancel'}
                    </button>
                    
                    {!isReadOnly && !showRejectionForm && workRequest?.status !== 'approved' && workRequest?.status !== 'rejected' ? (
                        <>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={() => setShowRejectionForm(true)}
                                disabled={isSubmitting}
                            >
                                <i className="bi bi-x-circle"></i>
                                Reject
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-success" 
                                onClick={handleApprove}
                                disabled={isSubmitting || (!hasExistingResources && selectedResources.length === 0)}
                            >
                                <i className="bi bi-check-circle"></i>
                                {isSubmitting ? 'Processing...' : getActionButtonText()}
                            </button>
                        </>
                    ) : !isReadOnly && showRejectionForm && workRequest?.status !== 'approved' && workRequest?.status !== 'rejected' ? (
                        <>
                            <button 
                                type="button" 
                                className="btn btn-outline" 
                                onClick={() => setShowRejectionForm(false)}
                                disabled={isSubmitting}
                            >
                                Cancel Rejection
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleReject}
                                disabled={isSubmitting || !rejectionReason.trim()}
                            >
                                <i className="bi bi-x-circle"></i>
                                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default ResourceManagementModal;
