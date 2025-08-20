import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout"
 
function CapabilityAreaShow() {
    const { id } = useParams();
    const [capabilityAreaDetails, setCapabilityAreaDetails] = useState({
        name: '',
        description: '',
        service_line_name: '',
        created_at: '',
    });
    const navigate = useNavigate();
 
    useEffect(() => {
        axios.get(`/capabilityArea/${id}`)
        .then(function (response) {
            setCapabilityAreaDetails(response.data.capabilityArea[0])
        })
        .catch(function (error) {
          console.log(error);
        })
    }, [])
    
    const goBack = () => {
		navigate(-1);
	}
    
    return (
        <Layout>
           <div className="container">
                <div className="card">
                <div className="card-header">
                <div className="row">
                    <div className="col">
                    </div>
                    <div className="col text-center">
                        <h4>Capability Area Details</h4>
                    </div>
                    <div className="col">
                    <button 
                        onClick={goBack}
                        type="button"
                        className="btn btn-outline-secondary float-end">
                        Back to List
                    </button>
                </div>
                </div>
                </div>
                    <div className="card-body fw-bold">
                        <p><b className="text-muted">Capability Area Name: </b>{capabilityAreaDetails.name}</p>
                        <p><b className="text-muted">Description: </b>{capabilityAreaDetails.description || 'N/A'}</p>
                        <p><b className="text-muted">Line of Business: </b>{capabilityAreaDetails.line_of_business_name || 'N/A'}</p>
                        <p><b className="text-muted">Service Line: </b>{capabilityAreaDetails.service_line_name || 'N/A'}</p>
                        <p><b className="text-muted">Created At: </b>{new Date(capabilityAreaDetails.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default CapabilityAreaShow; 