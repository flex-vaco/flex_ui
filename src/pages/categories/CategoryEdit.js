import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout";
import * as AppFunc from "../../lib/AppFunctions";
import "../FormStyles.css";

function CategoryEdit() {
    const { id } = useParams();
    const [category_name, setCategoryName] = useState('');
    const [technologies, setTechnologies] = useState('');
    const navigate = useNavigate();
    const [technologyFileName, setTechnologyFileName] = useState('');
    const [image_name, setSelectedImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleCancel = () => {
        navigate("/categoryList");
    }

    const handleImageChange = (e) => {
        if (AppFunc.validateUploadFile(e.target.files[0], "image")) {
            setSelectedImage(e.target.files[0]);
        } else {
            document.getElementById("image_name").value = null;
        }    
    };

    const handleSave = () => {
        if (!category_name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please enter a category name!',
                showConfirmButton: true
            })
            return;
        }

        setIsSaving(true);
        const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        };
        
        const data = new FormData();
        data.append('category_name', category_name);
        data.append('technologies', technologies);
        data.append('technology_file_name', technologyFileName);
        if(image_name) data.append('image_name', image_name);

        axios.post(`/categories/update/${id}`, data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Category Details Updated successfully!',
                showConfirmButton: false,
                timer: 1500
            })
            navigate("/categoryList");
            setIsSaving(false);
            setCategoryName('');
            setTechnologies('');
            setSelectedImage(null);
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

    useEffect(() => {
        axios.get(`/categories/${id}`)
        .then(function (response) {
            let catDetails = response.data.category[0];
            setCategoryName(catDetails.category_name);
            setTechnologies(catDetails.technologies);
            setTechnologyFileName(catDetails.image_name);
            setIsLoading(false);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
            setIsLoading(false);
        })
          
    }, [id])

    if (isLoading) {
        return (
            <Layout>
                <div className="form-page-container">
                    <div className="form-page-card">
                        <div className="form-page-header">
                            <h1 className="form-page-title">Edit Category</h1>
                        </div>
                        <div className="form-page-body">
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span className="loading-spinner"></span>
                                <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading category details...</p>
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
                        <h1 className="form-page-title">Edit Category</h1>
                    </div>
                    <div className="form-page-body">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="form-section">
                                <h3 className="form-section-title">Category Information</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="category_name" className="form-label required-field">
                                        Category Name
                                    </label>
                                    <input 
                                        onChange={(event)=>{setCategoryName(event.target.value)}}
                                        value={category_name}
                                        type="text"
                                        className="form-control"
                                        id="category_name"
                                        name="category_name"
                                        placeholder="Enter category name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Category Details</h3>
                                <div className="form-group full-width">
                                    <label htmlFor="technologies" className="form-label">
                                        Technologies
                                    </label>
                                    <textarea 
                                        value={technologies}
                                        onChange={(event)=>{setTechnologies(event.target.value)}}
                                        className="form-textarea"
                                        id="technologies"
                                        name="technologies"
                                        placeholder="Enter technologies for this category"
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="image_name" className="form-label">
                                        Technology Picture
                                    </label>
                                    {technologyFileName && (
                                        <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '14px', color: '#6c757d' }}>
                                            Current file: {technologyFileName}
                                        </div>
                                    )}
                                    <input
                                        type="file" 
                                        className="form-control"
                                        name="image_name"
                                        id="image_name"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
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
                                            Update Category
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

export default CategoryEdit;