import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import "../FormStyles.css"
 
function CapabilityAreaCreate() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [lineOfBusinessId, setLineOfBusinessId] = useState('');
    const [serviceLineId, setServiceLineId] = useState('');
    const [lineOfBusinesses, setLineOfBusinesses] = useState([]);
    const [serviceLines, setServiceLines] = useState([]);
    const [isSaving, setIsSaving] = useState(false)
    const [disableLineOfBusiness, setDisableLineOfBusiness] = useState(false);
    const navigate = useNavigate();
    
    const hasAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR || AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.LOB_ADMIN;
    
    useEffect(() => {
        if (!hasAccess) {
            navigate('/capabilityArea');
        }
    }, [hasAccess, navigate]);

    const handleCancel = () => {
        navigate("/capabilityArea");
    }

    useEffect(() => {
        fetchLineOfBusinesses();
    }, []);

    useEffect(() => {
        if (lineOfBusinessId) {
            fetchServiceLinesByLineOfBusiness(lineOfBusinessId);
        } else {
            setServiceLines([]);
        }
        setServiceLineId('');
    }, [lineOfBusinessId]);

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
            // For LOBADMIN, only show their own line of business   
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.line_of_business_id) {
                setLineOfBusinessId(user.line_of_business_id);
                setDisableLineOfBusiness(true);
            }
        }
    }

    const fetchServiceLinesByLineOfBusiness = (lineOfBusinessId) => {
        axios.get(`/serviceLine/lineOfBusiness/${lineOfBusinessId}`)
        .then(function (response) {
            setServiceLines(response.data.serviceLines);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    const handleSave = () => {
        if (!name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter capability area name!',
                showConfirmButton: true
            })
            return;
        }

        if (!lineOfBusinessId || lineOfBusinessId === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a line of business!',
                showConfirmButton: true
            })
            return;
        }

        if (!serviceLineId || serviceLineId === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a service line!',
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
          line_of_business_id: lineOfBusinessId,
          service_line_id: serviceLineId,
        };
        axios.post('/capabilityArea/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Capability Area Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/capabilityArea");
            setIsSaving(false);
            setName('');
            setDescription('');
            setLineOfBusinessId('');
            setServiceLineId('');
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
                        <h1 className="form-page-title">Create Capability Area</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Capability Area Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="name" className="form-label required-field">
                                        Capability Area Name
                                    </label>
                                    <input 
                                        onChange={(event)=>{setName(event.target.value)}}
                                        value={name}
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        placeholder="Enter capability area name"
                                        required
                                    />
                                </div>
                                {AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR && (
                                    <div className="form-group full-width">
                                        <label htmlFor="lineOfBusiness" className="form-label required-field">
                                            Line of Business
                                        </label>
                                        <select 
                                            name="lineOfBusiness" 
                                            id="lineOfBusiness" 
                                            className="form-select" 
                                            onChange={(e) => setLineOfBusinessId(e.target.value)}
                                            value={lineOfBusinessId}
                                            required
                                            disabled={disableLineOfBusiness}
                                        >
                                            <option value=""> -- Select a Line of Business -- </option>
                                            {lineOfBusinesses?.map((lineOfBusiness) => (
                                                <option key={lineOfBusiness.id} value={lineOfBusiness.id}>
                                                    {lineOfBusiness.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="form-group full-width">
                                    <label htmlFor="serviceLine" className="form-label required-field">
                                        Service Line
                                    </label>
                                    <select 
                                        name="serviceLine" 
                                        id="serviceLine" 
                                        className="form-select" 
                                        onChange={(e) => setServiceLineId(e.target.value)}
                                        value={serviceLineId}
                                        required
                                        disabled={!lineOfBusinessId}
                                    >
                                        <option value=""> -- Select a Service Line -- </option>
                                        {serviceLines.map((serviceLine) => (
                                            <option key={serviceLine.id} value={serviceLine.id}>
                                                {serviceLine.name}
                                            </option>
                                        ))}
                                    </select>
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
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle"></i>
                                                Save Capability Area
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
  
export default CapabilityAreaCreate; 