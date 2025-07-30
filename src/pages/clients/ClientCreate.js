import React, {useState} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
 
 
function ClientCreate() {
    const [name, setClientName] = useState('');
    const [location, setClientLocation] = useState('');
    const [client_contact_person, setContactPerson] = useState('');
    const [client_contact_email, setContactEmail] = useState('');
    const [client_contact_phone, setContactPhone] = useState('');
    const [status, setStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/clients");
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
          client_contact_person: client_contact_person,
          client_contact_email: client_contact_email,
          client_contact_phone: client_contact_phone,
          status: status,
        };
        axios.post('/clients/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Client Details saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/clients");
            setIsSaving(false);
            setClientName('');
            setClientLocation('');
            setContactPerson('');
            setContactEmail('');
            setContactPhone('');
            setStatus('');
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
                        <h4 className="text-center">Add New Client</h4>
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
                                    type="number"
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
                                Save Client
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ClientCreate;