import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import "../FormStyles.css"
 
function EmpProjUtiliCreate() {
    const [emp_id, setEmpId] = useState('');
    const [project_id, setProjectId] = useState('');
    const [week_starting, setWeekStart] = useState('');
    const [proj_hours_per_week, setProjPerWeek] = useState(0);
    const [allc_work_hours_per_week, setAllcPerWeek] = useState(0);
    const [forecast_hours_per_week, setForecastPerWeek] = useState(0);
    const [pto_hours_per_week, setPtoPerWeek] = useState(0);

    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate();

    const [empList, setEmpList] = useState([])
    const [projectList, setProjectList] = useState([])
    const [minValue, setMinValue] = useState();
    const [maxValue, setMaxValue] = useState();

    useEffect(() => {
        fetchProjList();
    }, [])
  
    const fetchEmpProjAloc = (emp_id, project_id) => {
        axios.post(`/empPrjAloc/project_employees_alloc`, {
                emp_id : emp_id,
                project_id: project_id
        })
        .then(function (response) {
            console.log(response.data.allocations[0]['start_date']);
            
            setMinValue(Utils.formatDateYYYYMMDD(response.data.allocations[0]['start_date']));
            setMaxValue(Utils.formatDateYYYYMMDD(response.data.allocations[0]['end_date']));
        })
        .catch(function (error) {
          console.log(error);
        })
        console.log('hi');
    }

    const fetchEmpList = (project_id) => {
        axios.get(`/empPrjAloc/project-employees/${project_id}`)
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
        console.log(project_id);
        fetchEmpProjAloc(e.target.value, project_id);
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

    const handleCancel = () => {
        navigate("/empUtiliList");
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
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const data = {
            emp_id: emp_id,
            project_id: project_id,
            week_starting: week_starting,
            proj_hours_per_week : proj_hours_per_week,
            allc_work_hours_per_week : allc_work_hours_per_week,
            forecast_hours_per_week :forecast_hours_per_week,
            pto_hours_per_week : pto_hours_per_week, 
        };

        axios.post('/empPrjUtili/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Utilization saved successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            setEmpId('');
            setProjectId('');
            setWeekStart('');
            setProjPerWeek(0);
            setAllcPerWeek(0);
            setForecastPerWeek(0);
            setPtoPerWeek(0);
          })
          .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
          });
    }
  
    return (
        <Layout>
            <div className="form-page-container">
                <div className="form-page-card">
                    <div className="form-page-header">
                        <h1 className="form-page-title">Add Resource Utilization</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Resource & Project Selection</h3>
                                <div className="form-row">
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
                                            <option value=""> -- Select Project -- </option>
                                            {projectList.map((prj) => (
                                                <option key={prj.project_id} value={prj.project_id}>
                                                    {prj.project_name}, {prj.project_location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                                            <option value=""> -- Select Resource -- </option>
                                            {empList.map((emp) => (
                                                <option key={emp.emp_id} value={emp.emp_id}>
                                                    {emp.first_name} {emp.last_name}
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            Save Utilization
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
  
export default EmpProjUtiliCreate;