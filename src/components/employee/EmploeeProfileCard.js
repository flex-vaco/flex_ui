import { useEffect, useState } from "react";
import Swal from "sweetalert2";

function EmployeeProfileCard(props) {
    const [displayStatus, setDisplayStatus] = useState(true);
    const [availability, setAvailability] = useState(0);

    useEffect(()=> {
        setAvailability((40 - props.employee.alc_per_week)) 
    },[props.employee.emp_id])

    useEffect(()=> {
        setDisplayStatus(availability >= props.availability);
    },[availability])

    return (<> {displayStatus && (
        <div className="col-12 col-lg-4 col-sm-12 float-left p-4">
                <div className="card profile-card cursor" onClick={(e) => props.handleProfileClick(props.employee.emp_id)}>
                    <div className="profile-header">
                        <img src={`${process.env.REACT_APP_API_BASE_URL}/uploads/profile_picture/${props.employee.profile_picture ? props.employee.profile_picture : 'profile_picture-default.png'}`}  className="profile-image"/>
                    </div>
                    <div className="profile-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="profile-name-container">
                                <h3 className="profile-name">{props.employee.first_name} {props.employee.last_name}</h3>
                                <p className="profile-title">{props.employee.designation}</p>
                            </div>
                            <div className="rating">
                                <i className="bi bi-star-fill"></i>
                                <span className="rating-value">5.0</span>
                            </div>
                        </div>
                        
                        <div className="profile-details">
                            <div className="detail-item">
                                <span className="detail-label">Location: </span>
                                <span className="detail-value">{props.employee.office_location_city}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Availability: </span>
                                <span className="detail-value"><span className={availability > 0 ? 'text-success fw-bold': 'text-danger'}>{availability}  Hrs./week</span></span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Experience: </span>
                                <span className="detail-value">{props.employee.total_work_experience_years} years</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Starting At: </span>
                                <span className="detail-value starting-price"><b>${props.employee.rate_per_hour} PER HOUR</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
    }</>)
}

export default EmployeeProfileCard;