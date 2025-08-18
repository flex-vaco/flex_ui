import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
function ServiceLineEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleCancel = () => {
        navigate("/serviceLine");
    }

    useEffect(() => {
        axios.get(`/serviceLine/${id}`)
        .then(function (response) {
            let serviceLineDetails = response.data.serviceLine[0];
            setName(serviceLineDetails.name);
            setDescription(serviceLineDetails.description || '');
            setIsLoading(false);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                text: error,
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
                title: 'Please enter service line name!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        const config = {
          headers: {
            "Content-Length": 0,
            "Content-Type": "application/json",
          },
          responseType: "text",
        };
        const data = {
          name: name,
          description: description,
        };
        axios.post(`/serviceLine/update/${id}`, data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Service Line Details updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/serviceLine");
            setIsSaving(false);
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
                            <h1 className="form-page-title">Edit Service Line</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading service line details...</p>
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
                        <h1 className="form-page-title">Edit Service Line</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Service Line Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="name" className="form-label required-field">
                                        Service Line Name
                                    </label>
                                    <input 
                                        onChange={(event)=>{setName(event.target.value)}}
                                        value={name}
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        placeholder="Enter service line name"
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="description" className="form-label">
                                        Description
                                    </label>
                                    <textarea 
                                        onChange={(event)=>{setDescription(event.target.value)}}
                                        value={description}
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        placeholder="Enter description (optional)"
                                        rows="3"
                                    />
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
                                                Update Service Line
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ServiceLineEdit; 