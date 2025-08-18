import { useCallback, useState } from 'react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import Layout from "../../components/Layout"
import axios from 'axios'
import Cookies from 'universal-cookie';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './chat.css';

const cookies = new Cookies();
cookies.set('chat_history', 'session', { path: '/' });

function InteliChat() {
  const [messages, setMessages] = useState([
    {
      message: `Hey ${JSON.parse(localStorage.getItem("user")).first_name} how can I help you?`,
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
      <div className="chat-page-container">
        <div className="chat-page-card">
          {/* Header Section */}
          <div className="chat-page-header">
            <h1 className="chat-page-title">
              <i className="bi bi-robot me-2"></i>
              Resume Explorer AI Chat
            </h1>
            <p className="chat-page-subtitle">
              Ask me anything about resumes, skills, or hiring insights
            </p>
          </div>

          {/* Chat Container */}
          <div className="chat-container-wrapper">
            <MainContainer>
              <ChatContainer>       
                <MessageList 
                  scrollBehavior="smooth" 
                  typingIndicator={isTyping ? <TypingIndicator content="Resume Explorer is typing" /> : null}
                  className="custom-message-list"
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.message}</ReactMarkdown>
                      </Message.CustomContent>
                    </Message>
                  ))}
                </MessageList>
                <MessageInput 
                  placeholder="Type your message here..." 
                  onSend={handleSend} 
                  attachButton={false}
                  className="custom-message-input"
                />        
              </ChatContainer>
            </MainContainer>
          </div>

          <div className="chat-footer">
            <div className="chat-info">
              <i className="bi bi-info-circle me-2"></i>
              <span>Powered by Highspring Flex Team</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default InteliChat