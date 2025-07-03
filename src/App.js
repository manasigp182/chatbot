import React, { useState, useEffect, useRef } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots("");
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();
    const timestamp = new Date();
    setLoading(true);
    setQuestion("");

    setChatHistory((prev) => [
      ...prev,
      { text: currentQuestion, sender: "user", timestamp },
    ]);

    try {
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botReply =
        data.answer || "I'm sorry, I couldn't process that request.";

      setChatHistory((prev) => [
        ...prev,
        { text: botReply, sender: "bot", timestamp: new Date() },
      ]);
      setIsConnected(true);
    } catch (error) {
      console.error("Error:", error);
      const errorMsg =
        "I'm having trouble connecting to the server. Please try again in a moment.";
      setChatHistory((prev) => [
        ...prev,
        { text: errorMsg, sender: "bot", timestamp: new Date() },
      ]);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const formatTime = (timestamp) => {
    return (
      timestamp?.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }) || ""
    );
  };

  const clearChat = () => {
    setChatHistory([
      {
        text: "Chat cleared! How can I help you?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-t-xl p-4 border-b border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">AI Assistant</h1>
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></div>
                  <span className="text-white text-opacity-80 text-sm">
                    {isConnected ? "Online" : "Connection Issues"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-white bg-opacity-10 backdrop-blur-md p-4 space-y-4">
          {chatHistory.map((entry, idx) => (
            <div
              key={idx}
              className={`flex ${
                entry.sender === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <div
                className={`flex items-end space-x-2 max-w-[80%] ${
                  entry.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    entry.sender === "user"
                      ? "bg-blue-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                >
                  {entry.sender === "user" ? "U" : "AI"}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`p-3 rounded-2xl shadow-lg ${
                      entry.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white bg-opacity-90 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{entry.text}</p>
                  </div>
                  {entry.timestamp && (
                    <span
                      className={`text-xs text-white text-opacity-60 mt-1 ${
                        entry.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(entry.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end space-x-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500">
                  AI
                </div>
                <div className="bg-white bg-opacity-90 text-gray-800 p-3 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Thinking</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-b-xl p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-3 bg-white bg-opacity-90 border-0 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none max-h-32 min-h-[48px]"
                placeholder="Type your message here..."
                rows="1"
                disabled={loading}
                style={{
                  height: "auto",
                  minHeight: "48px",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 128) + "px";
                }}
              />
            </div>
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-white text-opacity-60">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{question.length}/1000</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        textarea {
          field-sizing: content;
        }
      `}</style>
    </div>
  );
}

export default App;
