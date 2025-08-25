import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import "../FormStyles.css";

function UserRoleShow() {
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchUserRole();
    }, [id]);

    const fetchUserRole = () => {
        setIsLoading(true);
        axios.get(`/userRoles/${id}`)
        .then(function (response) {
            setUserRole(response.data.userRole);
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'An Error Occurred!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                navigate('/userRoleList');
            });
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const handleEdit = () => {
        navigate(`/userRoleEdit/${id}`);
    };

    const handleBack = () => {
        navigate('/userRoleList');
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">User Role Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading role details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!userRole) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">User Role Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div className="alert alert-danger">
                                User role not found.
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
                        <h1 className="form-page-title">User Role Details</h1>
                    </div>
                    <div className="form-page-body">
                        <div className="form-section">
                            <h3 className="form-section-title">Role Information</h3>
                            <div className="form-group full-width">
                                <label className="form-label">Role ID</label>
                                <div className="form-control-static">
                                    {userRole.role_id}
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Role Type</label>
                                <div className="form-control-static">
                                    {userRole.role}
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Display Name</label>
                                <div className="form-control-static">
                                    {userRole.name || 'N/A'}
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Line of Business</label>
                                <div className="form-control-static">
                                    {userRole.line_of_business_name || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Role Details</h3>
                            <div className="form-group full-width">
                                <label className="form-label">Role Description</label>
                                <div className="form-control-static">
                                    {userRole.role_description || 'No description provided'}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button"
                                onClick={handleBack} 
                                className="btn btn-outline"
                            >
                                <i className="bi bi-arrow-left"></i>
                                Back to List
                            </button>
                            <button 
                                type="button"
                                onClick={handleEdit}
                                className="btn btn-success"
                            >
                                <i className="bi bi-pencil"></i>
                                Edit Role
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default UserRoleShow
