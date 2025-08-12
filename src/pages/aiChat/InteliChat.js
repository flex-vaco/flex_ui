import { useCallback, useState } from 'react'
//import './chat.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import Layout from "../../components/Layout"
import axios from 'axios'
import Cookies from 'universal-cookie';
import ReactMarkdown from 'react-markdown';
const cookies = new Cookies();
cookies.set('chat_history', 'session', { path: '/' });

function InteliChat() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Resume Explorer! Ask me anything!",
      sender: "ai"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false); 

  const handleSend = useCallback((message) => {
    const chatMessages = [...messages, 
      {
        message,
        sender: "user"
      }
    ]
    setMessages(chatMessages)
    setIsTyping(true)
    customChatGptAPICall(message, chatMessages)
  },[messages.length]);

  const customChatGptAPICall = async (message, chatMessages) => {
    setIsTyping(true);
  
    // Commenting out API request for now
    
    const baseURL = `/genAI/talk_to_ai`;
    const params = new URLSearchParams({
      userQuery: message
    });
  
    const url = `${baseURL}?${params.toString()}`;
  
    try {
      const res = await axios.get(url, {
        withCredentials: true
      });
  
      const aiText = res.data.ai_response || "Sorry, something went wrong. Please try again!";
  
      setIsTyping(false);
  
      setMessages([
        ...chatMessages,
        { message: aiText.replace(/\\n/g, '\n'), sender: "ai" }
      ]);
    } catch (error) {
      setIsTyping(false);
      console.error("GET request failed:", error);
      setMessages([
        ...chatMessages,
        { message: "Something went wrong. Please try again later!", sender: "ai" }
      ]);
    }
    
  };
  
  

  return (
    <Layout>
    <div className="conatiner-fluid ">
      <div style={{ position:"relative", height: "70vh", width: "90%", marginLeft:"5%" }} >
        <MainContainer >
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Resume Explorer is typing" /> : null}
            >
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  model={{
                    message: "",
                    sentTime: "just now",
                    sender: msg.sender === 'user' ? "You" : "Resume Explorer",
                    direction: msg.sender === 'user' ? "outgoing" : "incoming"
                  }}
                >
                  <Message.CustomContent>
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  </Message.CustomContent>
                </Message>
              ))}

            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} attachButton={false} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
    </Layout>
  )
}

export default InteliChat