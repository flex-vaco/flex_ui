import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import APP_CONSTANTS from "../../appConstants"
import "../FormStyles.css";

function UserRoleCreate() {
    const [isLoading, setIsLoading] = useState(false);
    const [lineOfBusinessList, setLineOfBusinessList] = useState([]);
    const [formData, setFormData] = useState({
        role: '',
        name: '',
        role_description: '',
        line_of_business_id: ''
    });
    const navigate = useNavigate();

    // Get role options from app constants
    const roleOptions = Object.entries(APP_CONSTANTS.USER_ROLES).map(([key, value]) => ({
        label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
        value: value
    }));

    useEffect(() => {
        fetchLineOfBusinessList();
    }, []);

    const fetchLineOfBusinessList = () => {
        axios.get('/lineOfBusiness')
        .then(function (response) {
            setLineOfBusinessList(response.data.lineOfBusiness);
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch line of business list'
            });
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.role || !formData.name || !formData.role_description || !formData.line_of_business_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Please fill in all required fields!',
                showConfirmButton: true
            });
            return;
        }

        setIsLoading(true);
        
        axios.post('/userRoles', formData)
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'User Role Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                navigate('/userRoleList');
            });
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'An Error Occurred!',
                showConfirmButton: false,
                timer: 1500
            });
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const handleCancel = () => {
        navigate('/userRoleList');
    };

    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Add New User Role</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3 className="form-section-title">Role Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="role" className="form-label required-field">
                                        Role Capability
                                    </label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        {roleOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="name" className="form-label required-field">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter display name for the role"
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="line_of_business_id" className="form-label required-field">
                                        Line of Business
                                    </label>
                                    <select
                                        className="form-select"
                                        id="line_of_business_id"
                                        name="line_of_business_id"
                                        value={formData.line_of_business_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Line of Business</option>
                                        {lineOfBusinessList.map((lob) => (
                                            <option key={lob.id} value={lob.id}>
                                                {lob.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Role Details</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="role_description" className="form-label required-field">
                                        Role Description
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        id="role_description"
                                        name="role_description"
                                        value={formData.role_description}
                                        onChange={handleInputChange}
                                        placeholder="Enter role description"
                                        rows="4"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button"
                                    onClick={handleCancel} 
                                    className="btn btn-outline"
                                    disabled={isLoading}
                                >
                                    <i className="bi bi-x-circle"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Role
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default UserRoleCreate
