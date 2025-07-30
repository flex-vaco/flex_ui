import React, { useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'

function ResetPassword() {
    const location = useLocation();
    const user = location?.state?.user;
    const user_id = useState(user.user_id)
    const [password, setPassword] = useState('');
    const email = useState(user.email);
    const [isSaving, setIsSaving] = useState(false);
    const [formErr, setFormErr] = useState("");
    const [chkPassword, setChkPassword] = useState('');
    const navigate = useNavigate();


    const verifyPassword = (pswd) => {
        setChkPassword(pswd)
        if (pswd !== password) {
            setIsSaving(true);
            setFormErr("Passwords Do Not Match");
        } else {
            setIsSaving(false);
            setFormErr("");
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        if (password.length < 8) {
            Swal.fire({
                icon: 'warning',
                text: `Password Length should be minimum 8 characters.`,
                showConfirmButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsSaving(false);
                    return;
                }
            });
        }
        axios.post(`/users/resetPassword/${user_id}`, {
            email: email,
            password: password,
            needsPasswordReset: false
        })
            .then(function (response) {
                Swal.fire({
                    icon: 'success',
                    title: `Password Reset successfull!`,
                    text: "Please Login with new password",
                    showConfirmButton: true
                }).then((result) => { 
                    if (result.isConfirmed) {
                        navigate("/home");
                    }
                })
                setIsSaving(false);
            })
            .catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'An Error Occured!',
                    text: error.data,
                    showConfirmButton: false,
                    timer: 1500
                })
                setIsSaving(false)
            });
    }

    return (
        <>
            <div className="container w-auto login_div">
                <div className="container w-auto login_logo">
                <img src='images/Logo.png' alt="Logo" />
                </div>
                <div className="container w-auto">
                <div className="justify-content-center d-flex">
                <div className="col-lg-4 col-md-6 col-sm-12 form-bg-radius">
                <div className="card ms-3 me-3">
                    <div className="card-header">
                        <h4 className="text-center">Reset Password</h4>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="form-group mt-3 mb-3">
                                <label htmlFor="email">Email ID: <span className='fw-bold'>{email}</span></label>
                            </div>
                            <div className="form-group mt-2 mb-2">
                                <label htmlFor="password">Password</label>
                                <input
                                    onChange={(event) => { setPassword(event.target.value) }}
                                    value={password}
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    required />
                            </div>
                            <div className="form-group mt-2 mb-2">
                                <label htmlFor="re_password">Re Type Password</label>
                                {(formErr) ? <p className="text-danger"> {formErr}</p> : ""}
                                <input
                                    onChange={(event) => { verifyPassword(event.target.value) }}
                                    value={chkPassword}
                                    type="password"
                                    className="form-control"
                                    id="re_password"
                                    name="re_password"
                                    required />
                            </div>
                            <button
                                disabled={isSaving}
                                onClick={handleSave}
                                type="submit"
                                className="btn btn-outline-primary ml-3 mt-3">
                                Reset Password
                            </button>
                        </form>
                    </div>
                </div>
                </div>
                </div>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;