import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout"
 
function ServiceLineShow() {
    const { id } = useParams();
    const [serviceLineDetails, setServiceLineDetails] = useState({
        name: '',
        description: '',
        created_at: '',
    });
    const navigate = useNavigate();
 
    useEffect(() => {
        axios.get(`/serviceLine/${id}`)
        .then(function (response) {
            setServiceLineDetails(response.data.serviceLine[0])
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
                        <h4>Service Line Details</h4>
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
                        <p><b className="text-muted">Service Line Name: </b>{serviceLineDetails.name}</p>
                        <p><b className="text-muted">Description: </b>{serviceLineDetails.description || 'N/A'}</p>
                        <p><b className="text-muted">Line of Business: </b>{serviceLineDetails.line_of_business_name || 'N/A'}</p>
                        <p><b className="text-muted">Created At: </b>{new Date(serviceLineDetails.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ServiceLineShow; 