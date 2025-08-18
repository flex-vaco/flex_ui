import React, {useState} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
function LineOfBusinessCreate() {
    const [name, setName] = useState('');
    const [location, setLOBLocation] = useState('');
    const [contact_person, setLOBContactPerson] = useState('');
    const [contact_email, setLOBContactEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/lineOfBusiness");
    }

    const handleSave = () => {
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
          location: location,
          contact_person: contact_person,
          contact_email: contact_email,
        };
        axios.post('/lineOfBusiness/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Line of Business Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/lineOfBusiness");
            setIsSaving(false);
            setName('');
            setLOBLocation('');
            setLOBContactPerson('');
            setLOBContactEmail('');
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
                        <h1 className="form-page-title">Add New Line of Business</h1>
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
                                    <div className="form-group">
                                        <label htmlFor="line_of_business_location" className="form-label required-field">
                                            Line of Business Location
                                        </label>
                                        <input 
                                            onChange={(event)=>{setLOBLocation(event.target.value)}}
                                            value={location}
                                            type="text"
                                            className="form-control"
                                            id="line_of_business_location"
                                            name="line_of_business_location"
                                            placeholder="Enter line of business location"
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
                                            onChange={(event)=>{setLOBContactPerson(event.target.value)}}
                                            value={contact_person}
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
                                            onChange={(event)=>{setLOBContactEmail(event.target.value)}} 
                                            value={contact_email}
                                            type="email"
                                            className="form-control"
                                            id="contact_email"
                                            name="contact_email"
                                            placeholder="Enter contact email"
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Line of Business
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
  
export default LineOfBusinessCreate; 