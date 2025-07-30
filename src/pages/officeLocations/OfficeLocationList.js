import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
import Layout from "../../components/Layout"

function OfficeLocationList() {
    const [locationList, setLocationList] = useState([])
    const navigate = useNavigate();

    const handleAddButtonClick = () => {
      navigate("/officeLocationCreate");
    }

    useEffect(() => {
      fetchLocationList()
    }, [])
  
    const fetchLocationList = () => {
        axios.get('/officeLocation')
        .then(function (response) {
          setLocationList(response.data.locations);
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
                <div className="col">
                </div>
                <div className="col text-center">
                  <h4>location List</h4>
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
                    <th>City Name</th>
                  </tr>
                </thead>
                <tbody>
                  {locationList.map((locationDetails, key) => {
                    return (
                      <tr key={key}>
                        <td>
                          <Link
                             className="btn btn-outline-success mx-1 edit_icon"
                             to={`/officeLocationEdit/${locationDetails.office_location_id}`}
                           >
                             <i className="bi bi-pencil"></i>
                           </Link>                         
                        </td>
                        <td>
                         
                            {locationDetails.office_location_city}
                        </td>
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
  
export default OfficeLocationList;