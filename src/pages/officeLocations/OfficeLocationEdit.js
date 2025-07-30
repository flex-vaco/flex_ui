import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
 
function OfficeLocationEdit() {
    const location_id = useState(useParams().id);
    const [name, setLocationName] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/officeLocations");
    }
    
    useEffect(() => {
        axios.get(`/officeLocation/${location_id}`)
        .then(function (response) {
            let locationDetails = response.data.locations[0];
            setLocationName(locationDetails.office_location_city);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
        })
          
    }, [])

    const handleSave = () => {
        setIsSaving(true);
        axios.post(`/officeLocation/update/${location_id}`, {
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
  
    return (
        <Layout>
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-center">Edit Location Details</h4>
                    </div>
                    <div className="card-body">
                    <form>
                            <div className="form-group">
                                <label htmlFor="office_location_city">City Name</label>
                                <input 
                                    onChange={(event)=>{setLocationName(event.target.value)}}
                                    value={name}
                                    type="text"
                                    className="form-control"
                                    id="office_location_city"
                                    name="office_location_city"/>
                            </div>
                            
                            <button 
                                disabled={isSaving}
                                onClick={handleCancel} 
                                type="submit"
                                className="btn btn-outline-light mt-3 me-3">
                                Cancel
                            </button>
                            <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="button"
                                className="btn btn-outline-info mt-3">
                                Update Location
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default OfficeLocationEdit;