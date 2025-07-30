import React,{ useState, useEffect} from 'react';
import Modal from 'react-modal';
import * as Utils from "../lib/Utils"
import * as APP_FUNCTIONS from "../lib/AppFunctions";
import Swal from 'sweetalert2';
import axios from 'axios';

const HiringModal = (props) => {

    const [hiringModalIsOpen, setIsModelOpen] = useState(false);
    const [comments, setComments] = useState([]); 
    const [newComment, setNewComment] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const closeModal = () => {
        setIsModelOpen(false);
    }
    useEffect(() => {
        setIsModelOpen(props.modelStatus);
        setComments(props.hiringComments);
    }, [props.hiringComments]);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };
    
      const handleApprove = () => {
        setIsSaving(true);
        const configs = {
            headers: {
              "Content-Type": "application/json",
            },
        };
        const data = {
            hiring_id: props.hiringDetails.hiring_id,
            hiring_status: 'approved',
        };
        axios.post(`/hirings/update/${props.hiringDetails.hiring_id}`, data, configs)
          .then(function (response) {

            setIsModelOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Hiring Status Updated successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            
          })
          .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);
            closeModal();

            //navigate('/enquiredtome');
          });
      };
    
      const handleReject = () => {
        setIsSaving(true);
        const configs = {
            headers: {
              "Content-Type": "application/json",
            },
        };
        const data = {
            hiring_id: props.hiringDetails.hiring_id,
            hiring_status: 'rejected',
        };
        axios.post(`/hirings/update/${props.hiringDetails.hiring_id}`, data, configs)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Hiring Request Rejected',
                showConfirmButton: false,
                timer: 1500
            });
          })
          .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsSaving(false);

            setIsModelOpen(false);
            //navigate('/enquiredtome');
          });
      };
    
      const handleSubmit = () => {
        setComments([...comments, { comment: newComment, date: new Date() }]);
        
        setIsSaving(true);
        const config = {
          headers: {
            "Content-Length": 0,
            "Content-Type": "application/json",
          },
          responseType: "text",
        };
        const data = {
            hiring_id: props.hiringDetails.hiring_id,
            comment: newComment,
        };
        axios.post('/hirings/hiringcomments/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Comment saved successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            setNewComment("");
            setIsModelOpen(false);
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
      };

    return (
        <Modal
            isOpen={hiringModalIsOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="hiring-modal"
        >
            <div>
                <div className="col-12 float-left">
                    <div className="col-4 col-lg-4 float-left">
                        <button onClick={closeModal} className="btn btn-primary btn-xs exitarrow"><i className="bi bi-box-arrow-left"></i></button>
                    </div>
                    <div className="col-4 col-lg-4 float-left">
                        <h4>Hiring Request</h4>
                    </div>
                    <div className="col-4 col-lg-4 float-left text-right">
                        <button onClick={handleApprove} className="btn btn-success btn-outline-secondary btn-sm mr-2" hidden={props.hideHireBtn} >Approve</button>
                        <button onClick={handleReject} className="btn btn-danger btn-outline-light btn-sm mr-2" hidden={props.hideHireBtn}>Reject</button>
                    </div>
                </div>
                <div className="col-12 float-left mt-1">
                    <div className="col-12 col-lg-6 float-left">
                        <div className="col-12">
                            <p><b className="text-muted">Project: </b>{props.hiringDetails.project_name}</p>
                            <p hidden={APP_FUNCTIONS.userIsProducer()}><b className="text-muted">Email: </b>{props.hiringDetails.employee_details?.emp_email}</p>
                            <p><b className="text-muted">Designation: </b>{props.hiringDetails.employee_details?.designation}</p>
                            <p><b className="text-muted">Rate/HR: </b>{props.hiringDetails.employee_details?.rate_per_hour} USD</p>
                            <p><b className="text-muted">Manager Name: </b>{props.hiringDetails.employee_details?.manager_name}</p>
                            <p><b className="text-muted">Manager Email: </b> <a href={`mailto:${props.hiringDetails.employee_details?.manager_email}`}>{props.hiringDetails.employee_details?.manager_email}</a></p>
                            <p><b className="text-muted">Hours Per Week: </b>{props.hiringDetails.hours_per_week}</p>
                            <p><b className="text-muted">Start Date: </b>{Utils.formatDateYYYYMMDD(props.hiringDetails.start_date)}</p>
                            <p><b className="text-muted">End Date: </b>{Utils.formatDateYYYYMMDD(props.hiringDetails.end_date)}</p>
                            <p><b className="text-muted">Shift Timings: </b>{props.hiringDetails.shift_start_time}-{props.hiringDetails.shift_end_time}</p>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6 float-left">
                        <div className="col-12 comments_textarea">
                            <div className="mt-3">
                                <h4>Comments</h4>
                            </div>
                        </div>
                        <div className="row d-flex justify-content-center">
                        <div className="col-md-12 col-lg-12">
                            <div className="comments_section">
                            <div className="card-body p-0">
                            <div data-mdb-input-init className="form-outline mb-1 d-flex align-items-center">
                                <textarea
                                    value={newComment}
                                    onChange={handleCommentChange}
                                    placeholder="Enter your comment"
                                    className="form-control me-2"
                                    rows="1"
                                />
                                <button 
                                    onClick={handleSubmit} 
                                    className="btn btn-outline-info"
                                >
                                    Comment
                                </button>
                            </div>
                                
                                {comments.length > 0 ? (
                                    comments.map((comment, index) => (
                                        <div className="card mb-1 ">
                                            <div className="card-body comments_card_body">
                                                <p>{comment.comment}</p>

                                                <div className="d-flex justify-content-between">
                                                    <div className="d-flex flex-row align-items-center">
                                                        
                                                        <p className="small mb-0"><b>By:</b> {comment.first_name}, {comment.last_name}</p>
                                                    </div>

                                                    <div className="d-flex flex-row align-items-center">
                                                        <p className="small text-muted mb-0">{Utils.formatDateTime(comment.commented_at)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No comments yet.</p>
                                )}
                                
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default HiringModal;