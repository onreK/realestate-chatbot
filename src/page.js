import React, { useState } from "react";
import axios from "axios";

const logToGoogleSheet = async (message, leadType = "General") => {
  try {
    await axios.post(
      "https://script.google.com/macros/s/AKfycbwYVkLukdExnF8dSQT_-0LvQ7Ygf7pWDwSCeEnqoxf4WjN2uB3cPatdwgA3oQslhEfW/exec",
      {
        Message: message,
        LeadType: leadType,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Google Sheet logging failed:", error);
  }
};

export default function AmandaRealtorPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I’m Amanda’s assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    logToGoogleSheet(input, "General");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are Amanda's helpful real estate assistant." },
          ...newMessages.map((msg) => ({
            role: msg.from === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;
    setMessages([...newMessages, { from: "bot", text: reply }]);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <section className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Amanda the Realtor</h1>
        <p className="text-lg md:text-2xl mb-6">Helping Richmond & Chester families find their perfect home</p>
        <a
          href="#schedule"
          className="inline-block bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100"
        >
          Book a Free Consultation
        </a>
      </section>

      <section id="schedule" className="py-12 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Schedule a Meeting</h2>
        <div className="max-w-2xl mx-auto">
          <iframe
            src="https://calendly.com/kernopay/home-buyer-consultation"
            width="100%"
            height="600"
            frameBorder="0"
            className="rounded-xl shadow-lg"
            title="Amanda's Calendar"
          ></iframe>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="w-16 h-16 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl"
          onClick={() => setChatOpen(!chatOpen)}
        >
          💬
        </button>
        {chatOpen && (
          <div className="w-80 h-96 bg-white border rounded-lg shadow-lg p-4 mt-2">
            <div className="overflow-y-auto h-72 border-b pb-2 mb-2">
              {messages.map((msg, i) => (
                <div key={i} className={`mb-2 ${msg.from === "user" ? "text-right" : "text-left"}`}>
                  <span className={`inline-block px-3 py-2 rounded-lg ${msg.from === "user" ? "bg-purple-100" : "bg-gray-100"}`}>{msg.text}</span>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                className="flex-1 border rounded-l px-3 py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-r hover:bg-purple-700"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
