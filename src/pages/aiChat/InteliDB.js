import { useCallback, useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import Layout from "../../components/Layout"
import axios from 'axios'

function InteliDB() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [userQueryList, setUserQueryList] = useState([]);


  useEffect(()=> {
    getUserQueries();
  },[])

  const handleSend = useCallback(() => {
    customChatGptAPICall(message)
  },[message]);

  const handleQueryChange = (event) => {
      const userQueryId = event.target.value;
      const queryItem = userQueryList.find((queryItem) => queryItem.user_query_id === Number(userQueryId));
      if (queryItem) {
        setQuery(queryItem.query);
        setMessage(queryItem.question);
      }
  }


  const getUserQueries = () => {
    axios.get(`/application/getUserQueries`)
      .then((res) => {
        setUserQueryList(res.data.records);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const handleRunQuery = () => {
      
      axios.get(`/application/runUserQuery`, {
        params: {
          query: query     
        }
      })
      .then((res) => {
        setData(res.data.records);
      })
      .catch(function(err) {
        Swal.fire({
         icon: 'error',
         title: 'An Error Occured!',
         text: err,
         showConfirmButton: false,
         timer: 1500
      })
      })
  }

  const handleSaveQuery = () => {
    Swal.fire({
      title: 'Save Query',
      input: 'text',
      icon: 'save',
      inputPlaceholder: 'Please add a description for the query',
      inputAttributes:{
        input: 'string',
        required: 'true'
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Save',
      preConfirm: (description) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
          }
        };
        const data = {
          query_description: description,
          query: query,
          question: message
        };

        axios.post('/application/saveUserQuery', data, config)
        .then(()=> {
          getUserQueries();
        });
      }

    })
  }

  const customChatGptAPICall = async (message)=>{
    
    axios.get(`/application/getChatResp`, {
      params: {
        chatMessage: message     
      }
    })
      .then((res) => {
        setIsTyping(false);
        setData(res.data.records);
        setQuery(res.data.query);
      })
      .error((err) => {
        Swal.fire({
          icon: 'error',
         title: 'An Error Occured!',
         text: err,
         showConfirmButton: false,
         timer: 1500
     })
    })
      .catch((error) => {
        console.log(error);
      })
  }

  const renderTableHeader = () => {
    if (data.length === 0) return null;

    const header = Object.keys(data[0]);
    return header.map((key, index) => <th key={index}>{
      key.replace(/_([a-z])/g, function (m, w) {
        return ' ' + w.toUpperCase();
    })
    
    }</th>);
  };



  const renderTableData = () => {
    if (data.length === 0) return null;

    return data.map((item, index) => {
      const values = Object.values(item);
      return (
        <tr key={index}>
          {values.map((value, idx) => (
            <td key={idx}>{value}</td>
          ))}
        </tr>
      );
    });
  };


  return (
    <Layout>
    <div className="container-fluid">
      <div className="card w-auto">
        <div className="card-header">
       
          <div className="row">
            <div className="col-md-12 input-group" >
            {/* <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Resume Explorer is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList> */}
                
                <textarea 
                    style={{ width: '95%' }}
                    rows = {3}
                    id="search-value"
                    placeholder="Ask any information"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSend();
                      }
                    }}></textarea>
                <span
                  style={{ width: '5%', minWidth: '5%' }}
                  onClick={handleSend}
                  className="btn btn-outline-primary btn-small">
                  <i className="bi bi-send"></i>
                </span>
                
            </div>
           
          
          </div>
          <div className='row' style={{marginTop:'20px'}}>
          <div className="col-5">
              <textarea
                  rows = {3}     // Specifies the width of the textarea in characters
                  value={query}
                  wrap = "soft"   // Specifies how the text in the textarea should be wrapped
                  name = "name"   // Specifies the name of the textarea, which can be used when submitting a form
                  onChange={(event)=>{setQuery(event.target.value)}}
                  style={{width:'100%'}}
                >
              {query} 
            </textarea>
            </div>
            <div className="col-3" >
                    <select style={{width:'90%', textAlign:'left',height:'50%'}} name="userQuery" id="userQuery" onChange={handleQueryChange}> 
                      <option value='0'> -- Select Query -- </option>
                      {userQueryList.map((item, key) => <option key={key} value={item.user_query_id}>{item.query_description}</option>)}
                    </select>
            </div>
            <div className="col-1">
            <button
                    type="button"
                    onClick={handleRunQuery}
                    className="btn btn-outline-primary float-end"
                    disabled={!query}
                  >
                    Run Query 
                  </button>
                  </div>
                  <div className="col-1">
                  <button
                    type="button"
                    onClick={handleSaveQuery}
                    className="btn btn-outline-primary float-end"
                    disabled={!query}
                  >
                    Save Query 
                  </button>
              </div>
            
          </div>
        
        </div>
        <div className="card-body table-responsive">
      
        <table>
          <thead>
            <tr>{renderTableHeader()}</tr>
          </thead>
          <tbody>{renderTableData()}</tbody>
        </table>
        </div>
      </div>
    </div>
  </Layout>
  )
}

export default InteliDB
