import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import "../FormStyles.css"
 
function EmpProjUtiliEdit() {
    const { id } = useParams();
    const [emp_id, setEmpId] = useState('');
    const [project_id, setProjectId] = useState('');
    const [week_starting, setWeekStart] = useState('');
    const [proj_hours_per_week, setProjPerWeek] = useState('');
    const [allc_work_hours_per_week, setAllcPerWeek] = useState('');
    const [forecast_hours_per_week, setForecastPerWeek] = useState('');
    const [pto_hours_per_week, setPtoPerWeek] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [empList, setEmpList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [minValue, setMinValue] = useState();
    const [maxValue, setMaxValue] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/empPrjUtili/${id}`)
        .then(function (response) {
            setEmpId(response.data?.empProjUtili?.empDetails?.emp_id);
            setProjectId(response.data?.empProjUtili?.projectDetails?.project_id);
            setWeekStart(Utils.formatDateYYYYMMDD(response.data?.empProjUtili?.week_starting));
            setProjPerWeek(response.data?.empProjUtili?.proj_hours_per_week);
            setAllcPerWeek(response.data?.empProjUtili?.allc_work_hours_per_week);
            setForecastPerWeek(response.data?.empProjUtili?.forecast_hours_per_week);
            setPtoPerWeek(response.data?.empProjUtili?.pto_hours_per_week);
            fetchEmpList(response.data?.empProjUtili?.projectDetails?.project_id);
            
            fetchEmpProjAloc(response.data?.empProjUtili?.empDetails?.emp_id, response.data?.empProjUtili?.projectDetails?.project_id);
            setIsLoading(false);
        })
        .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occured!',
                text: error,
                showConfirmButton: false,
                timer: 1500
            })
            setIsLoading(false);
        })
          
    }, [id])

    useEffect(() => {
        fetchProjList();
    }, [])

    const fetchEmpProjAloc = (emp_id, project_id) => {
        axios.post(`/empPrjAloc/project_employees_alloc`, {
                emp_id : emp_id,
                project_id: project_id
        })
        .then(function (response) {
            setMinValue(Utils.formatDateYYYYMMDD(response.data.allocations[0]['start_date']));
            setMaxValue(Utils.formatDateYYYYMMDD(response.data.allocations[0]['end_date']));
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const fetchEmpList = (projectId) => {
        axios.get(`/empPrjAloc/project-employees/${projectId}`)
        .then(function (response) {
          setEmpList(response.data.employees);
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const handleEmpChange = (e) => {
        if(e.target.value === "-select-"){
            Swal.fire({
                icon: 'warning',
                title: 'Resource Name is required!',
                showConfirmButton: true
            })
        }
        setEmpId(e.target.value)
    }

    const handleProjectChange = (e) => {
        if(e.target.value === "-select-"){
            Swal.fire({
                icon: 'warning',
                title: 'Project Name is required!',
                showConfirmButton: true
            })
        }
        setProjectId(e.target.value)
        fetchEmpList(e.target.value);
    }

    const fetchProjList = () => {
        axios.get('/projects')
        .then(function (response) {
          setProjectList(response.data.projects);
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const handleSave = () => {
        if (project_id === '' || project_id === '-select-') {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a project!',
                showConfirmButton: true
            })
            return;
        }

        if (emp_id === '' || emp_id === '-select-') {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a resource!',
                showConfirmButton: true
            })
            return;
        }

        if (!week_starting) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a week starting date!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        axios.post(`/empPrjUtili/update/${id}`, {
            emp_id: emp_id,
            project_id: project_id,
            week_starting: week_starting,
            proj_hours_per_week : proj_hours_per_week,
            allc_work_hours_per_week : allc_work_hours_per_week,
            forecast_hours_per_week :forecast_hours_per_week,
            pto_hours_per_week : pto_hours_per_week, 
        })
        .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Utilization updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            navigate('/empUtiliList');
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

    const handleCancel = () => {
        navigate('/empUtiliList');
    }

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Utilization Details</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading utilization details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Edit Utilization Details</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Resource & Project Selection</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="employee" className="form-label required-field">
                                            Resource Name
                                        </label>
                                        <select 
                                            name="employee" 
                                            id="employee" 
                                            className="form-select" 
                                            onChange={handleEmpChange}
                                            value={emp_id}
                                            required
                                        > 
                                            {empList.map((emp, key) => (
                                                <option key={key} value={emp.emp_id}>
                                                    {emp.first_name} {emp.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="project" className="form-label required-field">
                                            Project
                                        </label>
                                        <select 
                                            name="project" 
                                            id="project" 
                                            className="form-select" 
                                            onChange={handleProjectChange}
                                            value={project_id}
                                            required
                                        > 
                                            {projectList.map((prj, key) => (
                                                <option key={key} value={prj.project_id}>
                                                    {prj.project_name}, {prj.project_location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Week Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="week_starting" className="form-label required-field">
                                            Week Starting
                                        </label>
                                        <input 
                                            onChange={(event)=>{setWeekStart(event.target.value)}}
                                            value={week_starting}
                                            type="date"
                                            className="form-date"
                                            id="week_starting"
                                            name="week_starting"
                                            min={minValue} 
                                            max={maxValue}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        {/* Empty div for layout balance */}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Hours Breakdown</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="proj_hours_per_week" className="form-label">
                                            Project Hours per Week
                                        </label>
                                        <input 
                                            onChange={(event)=>{setProjPerWeek(event.target.value)}}
                                            value={proj_hours_per_week}
                                            type="number"
                                            className="form-control"
                                            id="proj_hours_per_week"
                                            name="proj_hours_per_week"
                                            placeholder="Enter project hours"
                                            min="0"
                                            max="168"
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="allc_work_hours_per_week" className="form-label">
                                            Allocation Hours per Week
                                        </label>
                                        <input 
                                            onChange={(event)=>{setAllcPerWeek(event.target.value)}}
                                            value={allc_work_hours_per_week}
                                            type="number"
                                            className="form-control"
                                            id="allc_work_hours_per_week"
                                            name="allc_work_hours_per_week"
                                            placeholder="Enter allocation hours"
                                            min="0"
                                            max="168"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="forecast_hours_per_week" className="form-label">
                                            Forecast Hours per Week
                                        </label>
                                        <input 
                                            onChange={(event)=>{setForecastPerWeek(event.target.value)}}
                                            value={forecast_hours_per_week}
                                            type="number"
                                            className="form-control"
                                            id="forecast_hours_per_week"
                                            name="forecast_hours_per_week"
                                            placeholder="Enter forecast hours"
                                            min="0"
                                            max="168"
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pto_hours_per_week" className="form-label">
                                            PTO Hours per Week
                                        </label>
                                        <input 
                                            onChange={(event)=>{setPtoPerWeek(event.target.value)}}
                                            value={pto_hours_per_week}
                                            type="number"
                                            className="form-control"
                                            id="pto_hours_per_week"
                                            name="pto_hours_per_week"
                                            placeholder="Enter PTO hours"
                                            min="0"
                                            max="168"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button"
                                    onClick={handleCancel} 
                                    className="btn btn-outline"
                                    disabled={isSaving}
                                >
                                    <i className="bi bi-x-circle"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Update Utilization
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
  
export default EmpProjUtiliEdit;