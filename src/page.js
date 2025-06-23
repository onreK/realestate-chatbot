import React, { useState } from "react";

// Improved Google Sheets logging function
const logToSheets = async (message, leadType = "Buyer", sessionId) => {
  const timestamp = new Date().toISOString();
  
  const params = new URLSearchParams({
    timestamp,
    message: message.trim(),
    leadType,
    sessionId
  });
  
  const url = `https://script.google.com/macros/s/AKfycbwV3MRxnmKzSdbykLAFUS89MUAIzbj-VgqFTCQ_yk7m-bbwDGJEUTBNKRS-j5PCmV8T/exec?${params}`;
  
  try {
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors'
    });
    console.log('Message logged to Google Sheets successfully');
    return true;
  } catch (error) {
    console.error("Google Sheet logging failed:", error);
    return false;
  }
};

// Helper function to create/get session ID (FIXED VERSION)
const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem('chatSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
  } catch (error) {
    // Fallback if sessionStorage is not available
    console.log('SessionStorage not available, using temporary session ID');
    return 'temp_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};

// AI response function that calls your API route (FIXED VERSION WITH DEBUGGING)
const generateAIResponse = async (messages) => {
  try {
    console.log('Calling /api/chat with messages:', messages);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    return data.message;
  } catch (error) {
    console.error('AI response failed:', error);
    return "Thanks for your message! Amanda will get back to you soon. In the meantime, feel free to schedule a consultation using the calendar above.";
  }
};

export default function AmandaRealtorPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      from: "bot", 
      text: "Hi! I'm Amanda's assistant. How can I help you with your real estate needs today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const sessionId = getSessionId();
    const userMessage = {
      from: "user",
      text: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Log user message to Google Sheets
    await logToSheets(userMessage.text, "Buyer", sessionId);

    // Generate AI response
    const aiResponse = await generateAIResponse(newMessages);
    
    const botMessage = {
      from: "bot",
      text: aiResponse,
      timestamp: new Date().toISOString()
    };

    setMessages([...newMessages, botMessage]);
    setIsTyping(false);

    // Log bot response to Google Sheets
    await logToSheets(`BOT_RESPONSE: ${aiResponse}`, "Buyer", sessionId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Amanda the Realtor</h1>
          <p className="text-lg md:text-2xl mb-8">Helping Richmond & Chester families find their perfect home</p>
          <a
            href="#schedule"
            className="inline-block bg-white text-purple-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Book a Free Consultation
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose Amanda?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Local Expert</h3>
              <p className="text-gray-600">Deep knowledge of Richmond & Chester markets</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">💯</div>
              <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
              <p className="text-gray-600">100+ happy families in their dream homes</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Personal Service</h3>
              <p className="text-gray-600">Dedicated support throughout your journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-16 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Schedule Your Free Consultation</h2>
          <div className="max-w-2xl mx-auto">
            <iframe
              src="https://calendly.com/kernopay/home-buyer-consultation"
              width="100%"
              height="650"
              frameBorder="0"
              className="rounded-xl shadow-lg"
              title="Amanda's Calendar"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          onClick={() => setChatOpen(!chatOpen)}
          aria-label="Open chat"
        >
          {chatOpen ? "✕" : "💬"}
        </button>
        
        {chatOpen && (
          <div className="w-80 h-96 bg-white border rounded-2xl shadow-2xl p-4 mt-4">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                  A
                </div>
                <div>
                  <div className="font-semibold text-sm">Amanda's Assistant</div>
                  <div className="text-xs text-green-500">● Online</div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="overflow-y-auto h-64 pb-2 mb-2 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.from === "user" 
                      ? "bg-purple-600 text-white rounded-br-sm" 
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    <div className="text-sm">{msg.text}</div>
                    <div className={`text-xs mt-1 ${msg.from === "user" ? "text-purple-200" : "text-gray-500"}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <input
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
              />
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
