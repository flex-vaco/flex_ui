import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import Layout from "../components/Layout"
 
function ProjectShow() {
    const project_id = useState(useParams().id)
    const [projectDetails, setProjectDetails] = useState({
        project_name: '',
        project_location: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        start_date: '',
        expected_end_date: '',
        actual_end_date: '',
        technologies_required: '',
        description: '',
        status: '',
        head_count: '',
    })
    const navigate = useNavigate();
    useEffect(() => {
        axios.get(`/projects/${project_id}`)
        .then(function (response) {
            setProjectDetails(response.data.projects[0])
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
                                <h4>Project Details</h4>
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
                        <p><b className="text-muted">Project Name: </b>{projectDetails.project_name}, {projectDetails.last_name}</p>
                        <p><b className="text-muted">Location: </b>{projectDetails.project_location}</p>
                        <p><b className="text-muted">Contact Person: </b>{projectDetails.contact_person}</p>
                        <p><b className="text-muted">Contact Person Email: </b>{projectDetails.contact_email}</p>
                        <p><b className="text-muted">Contact Person Phone: </b>{projectDetails.contact_phone}</p>
                        <p><b className="text-muted">Status: </b>{projectDetails.status}</p>
                        <p><b className="text-muted">Project Started on: </b>{projectDetails.start_date}</p>
                        <p><b className="text-muted">Expected End Date: </b>{projectDetails.expected_end_date}</p>
                        <p><b className="text-muted">Actual End Date: </b>{projectDetails.actual_end_date}</p>
                        <p><b className="text-muted">Technologies: </b>{projectDetails.technologies_required}</p>
                        <p><b className="text-muted">Description: </b>{projectDetails.description}</p>
                        <p><b className="text-muted">Head Count: </b>{projectDetails.head_count}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default ProjectShow;