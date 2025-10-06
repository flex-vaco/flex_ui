import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './OffshoreLeadReviewModal.css';
import * as Utils from '../../lib/Utils';

function OffshoreLeadReviewModal({ workRequest, onClose, onStatusUpdate }) {
    const [selectedResources, setSelectedResources] = useState([]);
    const [availableResources, setAvailableResources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);

    useEffect(() => {
        if (workRequest && workRequest.capability_areas && workRequest.capability_areas.length > 0) {
            fetchFilteredResources();
        }
    }, [workRequest]);

    const fetchFilteredResources = () => {
        setIsLoading(true);
        
        const capabilityAreaIds = workRequest.capability_areas.map(ca => ca.capability_area_id);
        
        axios.post('/workRequest/offshoreLead/filteredResources', {
            capabilityAreaIds: capabilityAreaIds
        })
        .then(function (response) {
            setAvailableResources(response.data.resources);
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error fetching resources',
                text: 'Failed to load available resources',
                showConfirmButton: true
            });
        })
        .finally(() => {
            setIsLoading(false);
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

    const handleApprove = () => {
        if (selectedResources.length === 0) {
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
                text: 'The work request has been approved and resources have been assigned',
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Review Work Request</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Work Request Details */}
                    <div className="work-request-details">
                        <h3>{workRequest?.title}</h3>
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
                                <span>{workRequest?.capability_areas?.map(ca => ca.name).join(', ')}</span>
                            </div>
                            <div className="detail-item">
                                <label>Notes:</label>
                                <span>{workRequest?.notes || 'No notes'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resource Selection */}
                    <div className="resource-selection-section">
                        <h3>Select Resources</h3>
                        <p className="section-description">
                            Select resources that match the required capability areas and are under your line of business. Resources are filtered based on their primary and secondary skills matching the capability areas.
                        </p>

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
                                    </div>
                                ) : (
                                    <table className="resources-table">
                                        <thead>
                                            <tr>
                                                <th width="50">Select</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Primary Skills</th>
                                                <th>Secondary Skills</th>
                                                <th>Experience</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableResources.map((resource) => {
                                                const isSelected = selectedResources.some(r => r.emp_id === resource.emp_id);
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
                                                        <td>{resource.experience || '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rejection Form */}
                    {showRejectionForm && (
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
                        Cancel
                    </button>
                    
                    {!showRejectionForm ? (
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
                                disabled={isSubmitting || selectedResources.length === 0}
                            >
                                <i className="bi bi-check-circle"></i>
                                {isSubmitting ? 'Approving...' : `Approve (${selectedResources.length} resources)`}
                            </button>
                        </>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default OffshoreLeadReviewModal;
