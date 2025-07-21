import { useEffect, useState } from "react";
import axios from 'axios'
import Swal from "sweetalert2";

function EmployeeProfileCard(props) {
    const [displayStatus, setDisplayStatus] = useState(true);
    const [availability, setAvailability] = useState(0);
    const handleResumeClick = () => {
        if (!props.employee.resume) {
            Swal.fire({
                icon: "error",
                title: `Resume not available`,
                showConfirmButton: false,
                timer: 2000,
            });
        }
    }

    useEffect(()=> {
        setAvailability((40 - props.employee.alc_per_week)) 
    },[props.employee.emp_id])

    useEffect(()=> {
        setDisplayStatus(availability >= props.availability);
    },[availability])

    return (<> {displayStatus && (
        <div class="col-12 col-lg-4 col-sm-12 float-left p-4">
                <div class="card profile-card cursor" onClick={(e) => props.handleProfileClick(props.employee.emp_id)}>
                    <div class="profile-header">
                        <img src={`${process.env.REACT_APP_API_BASE_URL}/uploads/profile_picture/${props.employee.profile_picture ? props.employee.profile_picture : 'profile_picture-default.png'}`}  className="profile-image"/>
                    </div>
                    <div class="profile-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h3 class="profile-name">{props.employee.first_name} {props.employee.last_name}</h3>
                                <p class="profile-title">{props.employee.designation}</p>
                            </div>
                            <div class="rating">
                                <i class="bi bi-star-fill"></i>
                                <span class="rating-value">5.0</span>
                            </div>
                        </div>
                        
                        <div class="profile-details">
                            <div class="detail-item">
                                <span class="detail-label">Location: </span>
                                <span class="detail-value">{props.employee.office_location_city}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Availability: </span>
                                <span class="detail-value"><span className={availability > 0 ? 'text-success fw-bold': 'text-danger'}>{availability}  Hrs./week</span></span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Experience: </span>
                                <span class="detail-value">{props.employee.total_work_experience_years} years</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Starting At: </span>
                                <span class="detail-value starting-price"><b>${props.employee.rate_per_hour} PER HOUR</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
    }</>)
}

export default EmployeeProfileCard;