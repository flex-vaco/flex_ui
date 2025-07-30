import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
 
function ClientEdit() {
    const client_id = useState(useParams().id)
    const [name, setClientName] = useState('');
    const [location, setClientLocation] = useState('');
    const [client_contact_person, setContactPerson] = useState('');
    const [client_contact_email, setContactEmail] = useState('');
    const [client_contact_phone, setContactPhone] = useState('');
    const [status, setStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/clients/${client_id}`)
        .then(function (response) {
            let clientDetails = response.data.clients[0];
            setClientName(clientDetails.name);
            setClientLocation(clientDetails.location);
            setContactPerson(clientDetails.client_contact_person);
            setContactEmail(clientDetails.client_contact_email);
            setContactPhone(clientDetails.client_contact_phone);
            setStatus(clientDetails.status);
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
        axios.post(`/clients/update/${client_id}`, {
            name: name,
            location: location,
            client_contact_person: client_contact_person,
            client_contact_email: client_contact_email,
            client_contact_phone: client_contact_phone,
            status: status,
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Project updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate("/clients");
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
                        <h4 className="text-center">Edit Client Details</h4>
                    </div>
                    <div className="card-body">
                    <form>
                            <div className="form-group">
                                <label htmlFor="client_name">Client Name</label>
                                <input 
                                    onChange={(event)=>{setClientName(event.target.value)}}
                                    value={name}
                                    type="text"
                                    className="form-control"
                                    id="client_name"
                                    name="client_name"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="client_location">Client Location</label>
                                <input 
                                    onChange={(event)=>{setClientLocation(event.target.value)}}
                                    value={location}
                                    type="text"
                                    className="form-control"
                                    id="client_location"
                                    name="client_location"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_person">Contact Person Name</label>
                                <input 
                                    onChange={(event)=>{setContactPerson(event.target.value)}}
                                    value={client_contact_person}
                                    type="text"
                                    className="form-control"
                                    id="contact_person"
                                    name="contact_person"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_email">Contact Email</label>
                                <input 
                                    onChange={(event)=>{setContactEmail(event.target.value)}}
                                    value={client_contact_email}
                                    type="email"
                                    className="form-control"
                                    id="contact_email"
                                    name="contact_email"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_phone">Contact Phone</label>
                                <input 
                                    onChange={(event)=>{setContactPhone(event.target.value)}}
                                    value={client_contact_phone}
                                    type="text"
                                    className="form-control"
                                    id="contact_phone"
                                    name="contact_phone"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Client Status</label>
                                <input 
                                    value={status}
                                    onChange={(event)=>{setStatus(event.target.value)}}
                                    type="text"
                                    className="form-control"
                                    id="status"
                                    name="status"/>
                            </div>
                            <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="button"
                                className="btn btn-outline-info mt-3">
                                Update Client
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ClientEdit;