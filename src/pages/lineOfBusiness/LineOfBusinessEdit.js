import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
function LineOfBusinessEdit() {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/lineOfBusiness/${id}`)
        .then(function (response) {
            let lineOfBusinessDetails = response.data.lineOfBusiness[0];
            setName(lineOfBusinessDetails.name);
            setIsLoading(false);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsLoading(false);
        })
          
    }, [id])

    const handleSave = () => {
        setIsSaving(true);
        axios.post(`/lineOfBusiness/update/${id}`, {
            name: name,
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Line of Business updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/lineOfBusiness");
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

    const handleCancel = () => {
        navigate("/lineOfBusiness");
    }
  
    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Line of Business Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading line of business details...</p>
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
                        <h1 className="form-page-title">Edit Line of Business Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Basic Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="line_of_business_name" className="form-label required-field">
                                            Line of Business Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setName(event.target.value)}}
                                            value={name}
                                            type="text"
                                            className="form-control"
                                            id="line_of_business_name"
                                            name="line_of_business_name"
                                            placeholder="Enter line of business name"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button"
                                    onClick={handleCancel} 
                                    className="btn btn-outline"
                                    disabled={isSaving}
                                >
                                    <i className="bi bi-x-circle"></i>
                                    Cancel
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
                                            Update Line of Business
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default LineOfBusinessEdit; 