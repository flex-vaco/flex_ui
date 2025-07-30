import React from "react";
import Modal from "react-modal";
import * as Utils from "../../lib/Utils";
import { useNavigate } from "react-router-dom";

const EmployeeProfileModal = (props) => {
  const [modalIsOpen, setIsOpen] = React.useState(props.modalIsOpen);
  const hideAddInListBtn = React.useState(props.hideAddInListBtn || false);
  const hideHireBtn = React.useState(props.hideHireBtn || false);
  const allSkills = [
    ...(props.employee.primary_skills ? props.employee.primary_skills.split(",") : []),
    ...(props.employee.secondary_skills ? props.employee.secondary_skills.split(",") : [])
  ];
  const navigate = useNavigate();

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleHireClick = () => {
    navigate(`/hireResource`, {
      state: {
        employee: props.employee,
      },
    });
  };

  return (
    <Modal
      isOpen={props.modelstatus}
      onRequestClose={closeModal}
      ariaHideApp={true}
      contentLabel="Profile Modal"
      className="profile-modal"
      overlayClassName="profile-modal-overlay"
      shouldCloseOnOverlayClick={true} 
    >
      <div className="modal-left">
        <div className="profile-header-model">
          <img
            src={`${process.env.REACT_APP_API_BASE_URL}/uploads/profile_picture/${props.employee.profile_picture ? props.employee.profile_picture : 'profile_picture-default.png'}`}
            className="profile-photo-model"
            alt="Profile"
          />
          <div className="profile-info-model">
            <h2>{props.employee.first_name} {props.employee.last_name}</h2>
            <p className="location">Location: {props.employee.office_location_city}</p>
            <p className="status">
              Status {props.employee.status ? (
                <span className={`${props.employee.status.toLowerCase()}`}>
                  {props.employee.status.toUpperCase()}
                </span>
              ) : (
                <span className="no-status">NO STATUS</span>
              )}
            </p>
          </div>
        </div>

        <div className="details">
          <p>Email: {props.employee.email}</p>
          <p>Role: {props.employee.designation}</p>
          <p>Exp (Yrs.): {props.employee.total_work_experience_years}</p>
          <p>Rate/HR: {props.employee.rate_per_hour}</p>
          <p>Vaco Join Date: {Utils.formatDateYYYYMMDD(props.employee.vaco_join_date)}</p>
          <p>Home Location: {props.employee.home_location_city}</p>
          <p>Office Location: {props.employee.office_location_city}</p>
          <p>
            Supervisor: {props.employee.manager_name}
            <button className="view-profile-btn">View Profile</button>
          </p>
          <p>Supervisor Email: {props.employee.manager_email}</p>
          <p>On Site: {(props.employee.is_onsite) ? "YES" : "NO"}</p>
        </div>

        <div className="education">
          <h4>Education</h4>
          <p>{props.employee.education}</p>
        </div>
      </div>

      <div className="modal-right">
        <div className="buttons">
          {!hideHireBtn && <button className="hire-btn" onClick={handleHireClick}>Hire</button>}
          {!hideAddInListBtn && <a href={(props.employee.resume) ? `${process.env.REACT_APP_API_BASE_URL}/uploads/resume/${props.employee.resume}` : null} rel="noreferrer" target="_blank" className="add-btn">Resume</a>}
        </div>
        <h3>
            {props.employee.designation} <span className="price">$ {props.employee.rate_per_hour}/hr</span>
        </h3>
        <p>{props.employee.profile_information}</p>
        <div className="skills">
          <h4>Skills</h4>
          
          <div className="skill-tags">
            
            {allSkills.map((skill, index) => (
              skill.trim() ? (
                <span key={index}>{skill.trim()}</span>
              ) : null
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeProfileModal;
