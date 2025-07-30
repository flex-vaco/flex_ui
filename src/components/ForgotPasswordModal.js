import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    Swal.showLoading();

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      const response = await axios.post('/users/forgotPassword/', { email }, config);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password reset instructions have been sent to your email',
        showConfirmButton: false,
        timer: 2500
      });
      
      setEmail('');
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to process request',
        showConfirmButton: false,
        timer: 2000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reset Password</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope-fill text-gray"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary text-center mt-2 px-5 login_button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;