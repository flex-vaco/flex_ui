import React,{ useState, useEffect} from 'react';
import axios from 'axios'
import Layout from "../../components/Layout"
import HiringModal from '../../components/HiringModal';
import DataTable from 'react-data-table-component';

function EnquiredByMe() {
    const [hiringList, setHiringList] = useState([])
    const [modalIsOpen, setIsOpen] = useState(false);
    const [hiringModalDetails, setHiringModalDetails] = useState({});
    const [hiringModalComments, setHiringModalComments] = useState({})
    const [hideHireBtn, setHideHireBtn] = useState(false);
    useEffect(() => {
        fetchHiringListByMe()
    }, [])
  
    const fetchHiringListByMe = () => {
        axios.get('/hirings/enquiredtome')
        .then(function (response) {
          setHiringList(response.data.hirings);
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    const columns = [
      { name: 'Employee Name', selector: row => `${row.employee_details.first_name} ${row.employee_details.last_name}`, sortable: false },
      { name: 'Enquired Manager Name', selector: row => `${row.manager_details.manager_first_name} ${row.manager_details.manager_last_name}`, sortable: false },
      { name: 'Enquired Manager Email', selector: row => row.manager_details.manager_email, sortable: false },
      { name: 'Project Name', selector: row => row.project_name, sortable: false },
      { name: 'Start Date', selector: row => new Date(row.start_date).toLocaleDateString(), sortable: false },
      { name: 'End Date', selector: row => new Date(row.end_date).toLocaleDateString(), sortable: false },
      { name: 'Work Location', selector: row => row.work_location, sortable: false },
      { name: 'Hiring Status', selector: row => row.hiring_status, sortable: false }
    ];

    const [selectedStatus, setSelectedStatus] = useState('');
    const searchText = useState('');

    const filteredData = hiringList.filter(item => {
      const isStatusMatch = selectedStatus ? item.hiring_status === selectedStatus : true;
      const isSearchMatch = searchText ? (
        `${item.employee_details.first_name} ${item.employee_details.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
        `${item.manager_details.manager_first_name} ${item.manager_details.manager_last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
        item.project_name.toLowerCase().includes(searchText.toLowerCase()) ||
        new Date(item.start_date).toLocaleDateString().includes(searchText) ||
        new Date(item.end_date).toLocaleDateString().includes(searchText) ||
        item.work_location.toLowerCase().includes(searchText.toLowerCase())
      ) : true;
  
      return isStatusMatch && isSearchMatch;
    });

    const hiringStatuses = [...new Set(hiringList.map(item => item.hiring_status))];

    const handleRowClick = (row) => {
      setHiringModalDetails([]);
      setHiringModalComments([]);

      setIsOpen(true);
        axios.get(`/hirings/${row.hiring_id}`)
          .then((response) => {
            setHiringModalDetails(response.data.hirings[0])
            setHideHireBtn(response.data.hirings[0].hiring_status === 'enquired' ? false : true);
          })
          .catch((error) => {
            console.log(error);
          })
          axios.get(`/hirings/hiringcomments/${row.hiring_id}`)
          .then((response) => {
            setHiringModalComments(response.data.comments)
          })
          .catch((error) => {
            console.log(error);
          })
    };

    return (
      <Layout>
        <div className="container-fluid">
          <div className="card w-auto">
            <div className="card-header">
              <div className="row">
                <div className="col input-group">
                  <span className="input-group-text"><i className="bi bi-search text-gray"></i></span>
                    <select style={{width:"35%"}} name="searchKey" id="search-key" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}> 
                      <option value="">All Statuses</option>
                      {hiringStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                 </div>
                <div className="col text-center">
                  <h4>Hiring Enquired To Me</h4>
                </div>
                <div className="col">
                </div>
              </div>
            </div>
            <div className="card-body table-responsive">
            <DataTable
                columns={columns}
                data={filteredData}
                pagination
                onRowClicked={handleRowClick}
              />
              <HiringModal
                modelStatus={modalIsOpen}
                hiringDetails={hiringModalDetails}
                hiringComments={hiringModalComments}
                hideAddInListBtn={true}
                hideHireBtn={hideHireBtn}
                navigateToPage="/enquiredtome"
              />
            </div>
          </div>
        </div>
      </Layout>
    );
}
  
export default EnquiredByMe;