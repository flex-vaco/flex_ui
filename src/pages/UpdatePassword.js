import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from "../components/Footer";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/users/updatePassword`, {
        token,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data.message || 'Password reset successfully!',
      });

      navigate("/");
      // Clear form after successful reset
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to reset password',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>

    <div className="container w-auto login_div">
      <div className="container w-auto login_logo">
        <img src='/images/Logo.png' alt="Logo" />
      </div>

      <div className="container w-auto">
            <div className="">
                <div className="rounded d-flex justify-content-center">
                    <div className="col-lg-4 col-md-6 col-sm-12 form-bg-radius">
                        <div className="text-center">
                            <h4 className="login_header">Set New Password</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 text-center">
                                <div className="input-group mb-3">
                                    <span className="input-group-text"><i className="bi bi-lock-fill text-gray"></i></span>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text"><i className="bi bi-lock-fill text-gray"></i></span>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm Password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button 
                                type="submit" 
                                className="btn btn-primary text-center mt-2 px-5 login_button"
                                disabled={loading}
                                >
                                {loading ? (
                                    <span>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Resetting Password...
                                    </span>
                                ) : (
                                    'Reset Password'
                                )}
                                </button>
                            </div>
                        </form>
                        <div className="text-center poweredby_logo">
                          Powered by <img src='/images/VacoBinary_Logo.png' alt="Logo" />
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        <div className="container login_footer">
          <Footer />
        </div>                              
    </div>   
    </>
  );
};

export default ResetPassword;