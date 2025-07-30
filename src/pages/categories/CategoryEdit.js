import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout";
import * as AppFunc from "../../lib/AppFunctions";

function CategoryEdit() {
    const category_id = useState(useParams().id)
    const [category_name, setCategoryName] = useState('');
    const [technologies, setTechnologies] = useState('');
    const navigate = useNavigate();
    const [technologyFileName, setTechnologyFileName] = useState('');
    const [image_name, setSelectedImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
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

        axios.post(`/categories/update/${category_id}`, data, config)
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
            setSelectedImage('null');
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
        axios.get(`/categories/${category_id}`)
        .then(function (response) {
            let catDetails = response.data.category[0];
            setCategoryName(catDetails.category_name);
            setTechnologies(catDetails.technologies);
            setTechnologyFileName(catDetails.image_name);
        })
        .catch(function (error) {
            Swal.fire({
                 icon: 'error',
                title: 'An Error Occured!',
                showConfirmButton: false,
                timer: 1500
            })
        })
          
    }, [])
    return (
        <Layout>
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-center">Edit Category</h4>
                    </div>
                    <div className="card-body">
                        <form>
                            
                            <div className="form-group">
                                <label htmlFor="category_name">Category Name</label>
                                <input 
                                    onChange={(event)=>{setCategoryName(event.target.value)}}
                                    value={category_name}
                                    type="text"
                                    className="form-control"
                                    id="category_name"
                                    name="category_name"/>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="technologies_required">Technologies </label>
                                <textarea 
                                    value={technologies}
                                    onChange={(event)=>{setTechnologies(event.target.value)}}
                                    className="form-control"
                                    id="technologies"
                                    rows="3"
                                    name="technologies">
                                    
                                </textarea>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="image_name"> Technology Picture</label>
                                <div className="input-group">
                                <span style={{width:"35%"}} className="input-group-text fw-bold">{technologyFileName}</span>
                                    <input
                                    id="image_name"
                                    type="file"
                                    name="image_name"
                                    className="form-control"
                                    onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                            <button 
                                disabled={isSaving}
                                onClick={handleCancel} 
                                type="submit"
                                className="btn btn-outline-light mt-3 me-3">
                                Cancel
                            </button>
                            <button 
                                disabled={isSaving}
                                onClick={handleSave} 
                                type="submit"
                                className="btn btn-outline-primary mt-3 me-3">
                                Update Category
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CategoryEdit;