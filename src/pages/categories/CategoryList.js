import React,{ useState, useEffect} from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout";
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";

function CategoryList() {
    const  [categoryList, setCategoryList] = useState([])
    const hasReadOnlyAccess = useState(AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER);
    
    const navigate = useNavigate(); 

    const handleAddButtonClick = () => {
      navigate("/categoryCreate");
    }

    useEffect(() => {
        fetchEmpProjAlocList()
    }, [])
    const url = "categories";
    const fetchEmpProjAlocList = () => {
        axios.get(`/${url}`)
        .then(function (response) {
          setCategoryList(response.data.categories);
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    
    return (
      <Layout>
        <div className="container-fluid">
          <div className="card w-auto">
            <div className="card-header">
              <div className="row">
                <div className="col input-group">
                  
                </div>
                <div className="col text-center">
                  <h4>Category List</h4>
                </div>
                <div className="col">
                  <button 
                    type="button"
                    hidden={hasReadOnlyAccess}
                    onClick={handleAddButtonClick}
                    className="btn btn-outline-primary float-end">
                    ADD <i className="bi bi-plus-square"></i> 
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-hover">
                <thead className="bg-light">
                  <tr>
                    <th hidden={hasReadOnlyAccess}>Action</th>
                    <th>Category Name</th>
                    <th>Technologies</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryList.map((categoryList, key) => {
                    return (
                      <tr key={key}>
                        <td hidden={hasReadOnlyAccess}>
                          <Link
                            className="btn btn-outline-success mx-1 edit_icon"
                            to={`/categoryEdit/${categoryList.category_id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        </td>
                        <td>{categoryList.category_name}</td>
                        <td>{categoryList.technologies}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
            </div>
          </div>
        </div>
      </Layout>
    );
}
  
export default CategoryList;