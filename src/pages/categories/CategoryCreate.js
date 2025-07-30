import React, {useState} from 'react'
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout";
import * as AppFunc from "../../lib/AppFunctions";

function CategoryCreate() {
    const [category_name, setCategoryName] = useState('');
    const [technologies, setTechnologies] = useState('');
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false)
    const handleCancel = () => {
        navigate("/categoryList");
    }


    const [image_name, setSelectedImage] = useState(null);

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
        const data = {
          category_name: category_name,
          technologies: technologies,
          image_name: image_name
        };
        axios.post('/categories/add', data, config)
          .then(function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Category Details saved successfully!',
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
    return (
        <Layout>
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-center">Add New Category</h4>
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
                                <input
                                    type="file" 
                                    className="form-control needs-validation"
                                    name="image_name"
                                    id="image_name"
                                    onChange={handleImageChange}
                                    required/>
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
                                Save Category
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );

}

export default CategoryCreate