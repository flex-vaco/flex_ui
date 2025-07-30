import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout"
 
function ClientShow() {
    const client_id = useState(useParams().id)
    const [clientDetails, setClientDetails] = useState({
        name: '',
        location: '',
        client_contact_person: '',
        client_contact_email: '',
        client_contact_phone: '',
        status: '',
    });
    const navigate = useNavigate();
 
    useEffect(() => {
        axios.get(`/clients/${client_id}`)
        .then(function (response) {
            setClientDetails(response.data.clients[0])
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
                        <h4>Client Details</h4>
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
                        <p><b className="text-muted">Client Name: </b>{clientDetails.name}</p>
                        <p><b className="text-muted">Location: </b>{clientDetails.location}</p>
                        <p><b className="text-muted">Contact Person: </b>{clientDetails.client_contact_person}</p>
                        <p><b className="text-muted">Contact Person Email: </b>{clientDetails.client_contact_email}</p>
                        <p><b className="text-muted">Contact Person Phone: </b>{clientDetails.client_contact_phone}</p>
                        <p><b className="text-muted">Status: </b>{clientDetails.status}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ClientShow;