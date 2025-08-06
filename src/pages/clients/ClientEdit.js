import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
function ClientEdit() {
    const { id } = useParams();
    const [name, setClientName] = useState('');
    const [location, setClientLocation] = useState('');
    const [client_contact_person, setContactPerson] = useState('');
    const [client_contact_email, setContactEmail] = useState('');
    const [client_contact_phone, setContactPhone] = useState('');
    const [status, setStatus] = useState('Active');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/clients/${id}`)
        .then(function (response) {
            let clientDetails = response.data.clients[0];
            setClientName(clientDetails.name);
            setClientLocation(clientDetails.location);
            setContactPerson(clientDetails.client_contact_person);
            setContactEmail(clientDetails.client_contact_email);
            setContactPhone(clientDetails.client_contact_phone);
            setStatus(clientDetails.status);
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
        axios.post(`/clients/update/${id}`, {
            name: name,
            location: location,
            client_contact_person: client_contact_person,
            client_contact_email: client_contact_email,
            client_contact_phone: client_contact_phone,
            status: status,
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Client updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/clients");
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
        navigate("/clients");
    }
  
    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Client Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading client details...</p>
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
                        <h1 className="form-page-title">Edit Client Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Basic Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="client_name" className="form-label required-field">
                                            Client Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setClientName(event.target.value)}}
                                            value={name}
                                            type="text"
                                            className="form-control"
                                            id="client_name"
                                            name="client_name"
                                            placeholder="Enter client name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="client_location" className="form-label required-field">
                                            Client Location
                                        </label>
                                        <input 
                                            onChange={(event)=>{setClientLocation(event.target.value)}}
                                            value={location}
                                            type="text"
                                            className="form-control"
                                            id="client_location"
                                            name="client_location"
                                            placeholder="Enter client location"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Contact Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="contact_person" className="form-label required-field">
                                            Contact Person Name
                                        </label>
                                        <input 
                                            onChange={(event)=>{setContactPerson(event.target.value)}}
                                            value={client_contact_person}
                                            type="text"
                                            className="form-control"
                                            id="contact_person"
                                            name="contact_person"
                                            placeholder="Enter contact person name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="contact_email" className="form-label required-field">
                                            Contact Email
                                        </label>
                                        <input 
                                            onChange={(event)=>{setContactEmail(event.target.value)}}
                                            value={client_contact_email}
                                            type="email"
                                            className="form-control"
                                            id="contact_email"
                                            name="contact_email"
                                            placeholder="Enter contact email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="contact_phone" className="form-label required-field">
                                            Contact Phone
                                        </label>
                                        <input 
                                            onChange={(event)=>{setContactPhone(event.target.value)}}
                                            value={client_contact_phone}
                                            type="tel"
                                            className="form-control"
                                            id="contact_phone"
                                            name="contact_phone"
                                            placeholder="Enter contact phone number"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status" className="form-label required-field">
                                            Client Status
                                        </label>
                                        <select 
                                            value={status}
                                            onChange={(event)=>{setStatus(event.target.value)}}
                                            className="form-select"
                                            id="status"
                                            name="status"
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Pending">Pending</option>
                                        </select>
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
                                            Update Client
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
  
export default ClientEdit;