import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import "../FormStyles.css"
 
function ServiceLineEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [lineOfBusinessId, setLineOfBusinessId] = useState('');
    const [lineOfBusinesses, setLineOfBusinesses] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [disableLineOfBusiness, setDisableLineOfBusiness] = useState(false);
    const [imageFileName, setImageFileName] = useState('');
    const [image_name, setSelectedImage] = useState(null);
    
    const hasAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR || AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.LOB_ADMIN;
    
    useEffect(() => {
        if (!hasAccess) {
            navigate('/serviceLine');
        }
    }, [hasAccess, navigate]);

    const handleCancel = () => {
        navigate("/serviceLine");
    }

    const handleImageChange = (e) => {
        if (AppFunc.validateUploadFile(e.target.files[0], "image")) {
            setSelectedImage(e.target.files[0]);
        } else {
            document.getElementById("image_name").value = null;
        }    
    };

    useEffect(() => {
        fetchLineOfBusinesses();
        axios.get(`/serviceLine/${id}`)
        .then(function (response) {
            let serviceLineDetails = response.data.serviceLine;
            setName(serviceLineDetails.name);
            setDescription(serviceLineDetails.description || '');
            setLineOfBusinessId(serviceLineDetails.line_of_business_id || '');
            setImageFileName(serviceLineDetails.image_name || '');
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

    const fetchLineOfBusinesses = () => {
        if (AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR) {
            // For Administrator, fetch all line of businesses
            axios.get('/lineOfBusiness')
            .then(function (response) {
                setLineOfBusinesses(response.data.lineOfBusiness);
            })
            .catch(function (error) {
                console.log(error);
            })
        } else {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.line_of_business_id) {
                setLineOfBusinessId(user.line_of_business_id);
                setDisableLineOfBusiness(true);
            }
        }
    }

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
              'Content-Type': 'multipart/form-data'
            }
        };
        
        const data = new FormData();
        data.append('name', name);
        data.append('description', description);
        data.append('line_of_business_id', lineOfBusinessId);
        data.append('image_file_name', imageFileName);
        if(image_name) data.append('image_name', image_name);

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
                                <div className="form-group full-width">
                                    <label htmlFor="image_name" className="form-label">
                                        Service Line Picture
                                    </label>
                                    {imageFileName && (
                                        <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '14px', color: '#6c757d' }}>
                                            Current file: {imageFileName}
                                        </div>
                                    )}
                                    <input
                                        type="file" 
                                        className="form-control"
                                        name="image_name"
                                        id="image_name"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </div>
                                {AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR && (
                                    <div className="form-group full-width">
                                        <label htmlFor="lineOfBusiness" className="form-label required-field">
                                            Line of Business
                                        </label>
                                        <select 
                                            id="lineOfBusiness"
                                            value={lineOfBusinessId}
                                            onChange={(e) => setLineOfBusinessId(e.target.value)}
                                            className="form-select"
                                            required
                                            disabled={disableLineOfBusiness || AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.LOB_ADMIN}
                                        >
                                            <option value=""> -- Select a Line of Business -- </option>
                                            {lineOfBusinesses?.map((lineOfBusiness) => (
                                                <option key={lineOfBusiness.line_of_business_id} value={lineOfBusiness.line_of_business_id}>
                                                    {lineOfBusiness.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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