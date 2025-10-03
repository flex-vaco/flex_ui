import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import Swal from 'sweetalert2';

import OffshoreLeadReviewModal from './OffshoreLeadReviewModal';
 
function WorkRequestShow() {
    const { id } = useParams();
    const [workRequestDetails, setWorkRequestDetails] = useState({
        title: '',
        line_of_business_name: '',
        service_line_name: '',
        project_name: '',
        project_location: '',
        duration_from: '',
        duration_to: '',
        hours_per_week: '',
        notes: '',
        project_attachment: '',
        status: '',
        first_name: '',
        last_name: '',
        submitted_at: '',
        capability_areas: [],
        resources: []
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
 
    useEffect(() => {
        fetchWorkRequestDetails();
    }, [])
    
    const fetchWorkRequestDetails = () => {
        axios.get(`/workRequest/${id}`)
        .then(function (response) {
            setWorkRequestDetails(response.data.workRequest);
            setCurrentUser(response.data.user);
        })
        .catch(function (error) {
          console.log(error);
        })
    };

    const goBack = () => {
		navigate(-1);
	}

    const handleReviewClick = () => {
        setShowReviewModal(true);
    };

    const handleSubmitRequest = () => {
        Swal.fire({
            title: 'Submit Work Request?',
            text: 'Are you sure you want to submit this work request? This action cannot be undone.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Submit',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                submitWorkRequest();
            }
        });
    };

    const submitWorkRequest = () => {
        setIsSubmitting(true);
        axios.post(`/workRequest/submit/${id}`)
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Work Request Submitted!',
                text: 'The work request has been successfully submitted and is now available for offshore lead review.',
                showConfirmButton: false,
                timer: 2000
            });
            fetchWorkRequestDetails(); // Refresh the data
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Failed to submit work request. Please try again.',
                showConfirmButton: true
            });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleStatusUpdate = () => {
        fetchWorkRequestDetails();
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

    // Check if current user is an offshore lead or manager and can review this work request
    const canReview = (currentUser?.role === 'offshore_lead' || currentUser?.role === 'off_shore_lead' || currentUser?.role === 'manager') && 
                     workRequestDetails.status === 'submitted' &&
                     workRequestDetails.offshore_leads?.some(lead => lead.user_id === currentUser?.user_id);

    // Check if current user can submit this work request (project manager or producer, draft status, and is the creator)
    const canSubmit = (currentUser?.role === 'project_manager' || currentUser?.role === 'producer') && 
                     workRequestDetails.status === 'draft' &&
                     workRequestDetails.submitted_by === currentUser?.user_id;

    // Check if current user can edit this work request (project manager or producer, draft status, and is the creator)
    const canEdit = (currentUser?.role === 'project_manager' || currentUser?.role === 'producer') && 
                   workRequestDetails.status === 'draft' &&
                   workRequestDetails.submitted_by === currentUser?.user_id;
    
    return (
        <Layout>
           <div className="container">
                <div className="card">
                <div className="card-header">
                <div className="row">
                    <div className="col">
                    </div>
                    <div className="col text-center">
                        <h4>Work Request Details</h4>
                    </div>
                    <div className="col">
                        <div className="d-flex justify-content-end gap-2">
                            {canSubmit && (
                                <button 
                                    onClick={handleSubmitRequest}
                                    type="button"
                                    className="btn btn-success"
                                    disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send"></i>
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            )}
                            {canEdit && (
                                <button 
                                    onClick={() => navigate(`/workRequestEdit/${id}`)}
                                    type="button"
                                    className="btn btn-primary">
                                    <i className="bi bi-pencil"></i>
                                    Edit
                                </button>
                            )}
                            {canReview && (
                                <button 
                                    onClick={handleReviewClick}
                                    type="button"
                                    className="btn btn-primary">
                                    <i className="bi bi-eye"></i>
                                    Review & Approve
                                </button>
                            )}
                            <button 
                                onClick={goBack}
                                type="button"
                                className="btn btn-outline-secondary">
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>
                </div>
                    <div className="card-body fw-bold">
                        <div className="row">
                            <div className="col-md-6">
                                <p><b className="text-muted">Title: </b>{workRequestDetails.title}</p>
                                <p><b className="text-muted">Line of Business: </b>{workRequestDetails.line_of_business_name || 'N/A'}</p>
                                <p><b className="text-muted">Service Line: </b>{workRequestDetails.service_line_name || 'N/A'}</p>
                                <p><b className="text-muted">Project: </b>{workRequestDetails.project_name || 'N/A'}</p>
                                <p><b className="text-muted">Project Location: </b>{workRequestDetails.project_location || 'N/A'}</p>
                                <p><b className="text-muted">Duration: </b>
                                    {Utils.formatDateYYYYMMDD(workRequestDetails.duration_from)} - {Utils.formatDateYYYYMMDD(workRequestDetails.duration_to)}
                                </p>
                                <p><b className="text-muted">Hours Per Week: </b>{workRequestDetails.hours_per_week}</p>
                            </div>
                            <div className="col-md-6">
                                <p><b className="text-muted">Status: </b>
                                    <span className={`status-badge ${getStatusBadgeClass(workRequestDetails.status)}`}>
                                        {workRequestDetails.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </p>
                                <p><b className="text-muted">Submitted By: </b>{workRequestDetails.first_name} {workRequestDetails.last_name}</p>
                                <p><b className="text-muted">Submitted At: </b>{Utils.formatDateYYYYMMDD(workRequestDetails.submitted_at)}</p>
                                <p><b className="text-muted">Project Attachment: </b>
                                    {workRequestDetails.project_attachment ? (
                                        <a href={workRequestDetails.project_attachment} target="_blank" rel="noopener noreferrer" className="text-primary">
                                            View Attachment
                                        </a>
                                    ) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {workRequestDetails.notes && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <p><b className="text-muted">Notes: </b></p>
                                    <div className="p-3 bg-light rounded">
                                        {workRequestDetails.notes}
                                    </div>
                                </div>
                            </div>
                        )}

                        {workRequestDetails.capability_areas && workRequestDetails.capability_areas.length > 0 && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <p><b className="text-muted">Capability Areas: </b></p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {workRequestDetails.capability_areas.map((ca, index) => (
                                            <span key={index} className="badge bg-primary">
                                                {ca.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {workRequestDetails.resources && workRequestDetails.resources.length > 0 && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <p><b className="text-muted">Assigned Resources: </b></p>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Allocation %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workRequestDetails.resources.map((resource, index) => (
                                                    <tr key={index}>
                                                        <td>{resource.first_name} {resource.last_name}</td>
                                                        <td>{resource.email || 'N/A'}</td>
                                                        <td>{resource.allocation_percentage || 100}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* {workRequestDetails.offshore_leads && workRequestDetails.offshore_leads.length > 0 && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <p><b className="text-muted">Offshore Leads: </b></p>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workRequestDetails.offshore_leads.map((lead, index) => (
                                                    <tr key={index}>
                                                        <td>{lead.first_name} {lead.last_name}</td>
                                                        <td>{lead.email || 'N/A'}</td>
                                                        <td>{lead.role || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Offshore Lead Review Modal */}
                {showReviewModal && (
                    <OffshoreLeadReviewModal
                        workRequest={workRequestDetails}
                        onClose={() => setShowReviewModal(false)}
                        onStatusUpdate={handleStatusUpdate}
                    />
                )}
            </div>
        </Layout>
    );
}
  
export default WorkRequestShow; 