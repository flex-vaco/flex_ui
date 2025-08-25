import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
 
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
    const navigate = useNavigate();
 
    useEffect(() => {
        axios.get(`/workRequest/${id}`)
        .then(function (response) {
            setWorkRequestDetails(response.data.workRequest)
        })
        .catch(function (error) {
          console.log(error);
        })
    }, [])
    
    const goBack = () => {
		navigate(-1);
	}

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
                    <button 
                        onClick={goBack}
                        type="button"
                        className="btn btn-outline-secondary float-end">
                        Back to List
                    </button>
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
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default WorkRequestShow; 