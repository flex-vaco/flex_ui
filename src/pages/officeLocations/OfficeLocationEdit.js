import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
function OfficeLocationEdit() {
    const { id } = useParams();
    const [name, setLocationName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/officeLocations");
    }
    
    useEffect(() => {
        axios.get(`/officeLocation/${id}`)
        .then(function (response) {
            let locationDetails = response.data.locations[0];
            setLocationName(locationDetails.office_location_city);
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
        if (!name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter a city name!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        axios.post(`/officeLocation/update/${id}`, {
            office_location_city: name,
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Location updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/officeLocations");
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

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Office Location</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading location details...</p>
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
                        <h1 className="form-page-title">Edit Office Location</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Location Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="office_location_city" className="form-label required-field">
                                        City Name
                                    </label>
                                    <input 
                                        onChange={(event)=>{setLocationName(event.target.value)}}
                                        value={name}
                                        type="text"
                                        className="form-control"
                                        id="office_location_city"
                                        name="office_location_city"
                                        placeholder="Enter city name"
                                        required
                                    />
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
                                            Update Location
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
  
export default OfficeLocationEdit;