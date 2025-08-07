import React, {useState} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
 
function OfficeLocationCreate() {
    const [name, setLocationName] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/officeLocations");
    }

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
        const config = {
          headers: {
            "Content-Length": 0,
            "Content-Type": "application/json",
          },
          responseType: "text",
        };
        const data = {
          office_location_city: name,
        };
        axios.post('/officeLocation/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Location Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/officeLocations");
            setIsSaving(false);
            setLocationName('');
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
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Add New Office Location</h1>
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Location
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
  
export default OfficeLocationCreate;