import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout"
 
function LineOfBusinessShow() {
    const { id } = useParams();
    const [lineOfBusinessDetails, setLineOfBusinessDetails] = useState({
        name: '',
        created_at: '',
    });
    const navigate = useNavigate();
 
    useEffect(() => {
        axios.get(`/lineOfBusiness/${id}`)
        .then(function (response) {
            setLineOfBusinessDetails(response.data.lineOfBusiness[0])
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
                        <h4>Line of Business Details</h4>
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
                        <p><b className="text-muted">Line of Business Name: </b>{lineOfBusinessDetails.name}</p>
                        <p><b className="text-muted">Created At: </b>{new Date(lineOfBusinessDetails.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default LineOfBusinessShow; 