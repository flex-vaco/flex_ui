import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"

function UserList() {
    const  [userList, setUserList] = useState([])
    const  [searchKeys, setSearchKeys] = useState([])
    const  [inputType, setInputType] = useState("text");

    useEffect(() => {
        fetchUserList()
    }, [])
  
    const fetchUserList = () => {
        axios.get('/users')
        .then(function (response) {
          setUserList(response.data.users);
          setFilteredList(response.data.users);
          setSearchKeys(Object.keys(response?.data?.users[0]))
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    const navigate = useNavigate();
    const handleAddButtonClick = () => {
      navigate("/userCreate");
    }
    const handleDelete = (user_id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {
                axios.get(`/users/delete/${user_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'User deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchUserList()
                })
                .catch(function (error) {
                    Swal.fire({
                         icon: 'error',
                        title: 'An Error Occured!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                });
            }
          })
    }
    const [filteredList, setFilteredList] = useState(userList);
    const [searchKey, setSearchKey] = useState("");

    const handleSearch = (event) => {
      event.stopPropagation();
      const searchValue = event.target.value.toString().toLowerCase();
      let dbVal = "";
      const fList = userList.filter((item) => {
        if (searchKey.includes("date")) {
          dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`]).toString();
        } else {
          dbVal = item[`${searchKey}`].toString().toLowerCase();
        }
        return dbVal.includes(searchValue);
      });
      setFilteredList(fList);
    };

    const handleSearchKeyChange = (event) => {
      event.stopPropagation();
      if (event.target.value === "-select-"){
        document.getElementById("search-value").value = "";
      } else {
        setSearchKey(event.target.value);
      }
      
      (event.target.value.includes("date")) ? setInputType("date") : setInputType("text");
    };


    const handleSearchRefreshClick = () => {
      window.location.reload(true);
    };

    const searchKeysToIgnore = ["password","user_id"];
    
    return (
      <Layout>
        <div className="container-fluid">
          <div className="card w-auto">
            <div className="card-header">
            <div className="row">
                <div className="col input-group">
                  <span className="input-group-text"><i className="bi bi-search text-gray"></i></span>
                    <select style={{width:"35%"}} name="searchKey" id="search-key"  onChange={handleSearchKeyChange}> 
                      <option value="-select-"> -- Search Key -- </option>
                      {searchKeys.map((k) => (!searchKeysToIgnore.includes(k)) ? <option value={k}>{k.toLocaleUpperCase()}</option> : "")}
                    </select>
                    <input style={{width:"35%"}} className="ms-1" id="search-value" type={inputType} placeholder=" Type a value" onChange={handleSearch} />
                      <span 
                      onClick={handleSearchRefreshClick}
                      className="btn btn-outline-primary btn-small">
                      <i className="bi bi-arrow-counterclockwise"></i>
                    </span>
                </div>
                <div className="col text-center">
                  <h4>User List</h4>
                </div>
                <div className="col">
                  <button 
                    type="button"
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
                    <th>Action</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((usersList, key) => {
                    return (
                      <tr key={key}>
                        <td>
                          <button
                            onClick={() => handleDelete(usersList.user_id)}
                            className="btn btn-outline-danger" 
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <Link
                            className="btn btn-outline-success edit_icon"
                            to={`/userEdit/${usersList.user_id}`}
                          >
                            <i className="bi bi-pencil" font-size="2rem;"></i>
                          </Link>
                        </td>
                        <td>
                            {usersList.first_name}, {usersList.last_name}
                        </td>
                        <td>{usersList.email}</td>
                        <td>{usersList.role.toUpperCase()}</td>  
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
  
export default UserList;