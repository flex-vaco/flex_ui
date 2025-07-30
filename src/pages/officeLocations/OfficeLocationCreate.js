import React, {useState} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
 
 
function OfficeLocationCreate() {
    const [name, setLocationName] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/officeLocations");
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
                        <h4 className="text-center">Add New Location</h4>
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
                                type="submit"
                                className="btn btn-outline-info mt-3 me-3">
                                Save Location
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default OfficeLocationCreate;