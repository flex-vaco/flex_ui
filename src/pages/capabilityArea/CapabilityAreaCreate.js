import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import "../FormStyles.css"
 
function CapabilityAreaCreate() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [serviceLineId, setServiceLineId] = useState('');
    const [serviceLines, setServiceLines] = useState([]);
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/capabilityArea");
    }

    useEffect(() => {
        fetchServiceLines();
    }, []);

    const fetchServiceLines = () => {
        axios.get('/serviceLine')
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