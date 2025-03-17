import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hello! How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleAsk(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!question.trim()) return;

    // Add user message
    const userMessageId = Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        text: question,
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const res = await fetch("https://bulwark-scroll.onrender.com/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_query: question }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            text: "Sorry, there was an error processing your question. Please try again.",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // Add response message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: data.answer,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, there was an error connecting to the service. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setQuestion("");
      inputRef.current?.focus();
    }
  }

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col">
      {/* <div className="bg-black p-4 text-white flex items-center">
        <div className="w-8 h-8 mr-2 relative rounded-full bg-accent flex items-center justify-center">
          <span className="text-lg font-bold">B</span>
        </div>
        <h1 className="text-xl font-bold">Bulwark Assistant</h1>
      </div> */}

      {/* Chat history */}
      <div className="flex-grow overflow-y-auto p-4 bg-black">
        <div className="max-w-4xl mx-auto">
          {messages.map(message => (
            <div key={message.id} className={`mb-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 max-w-[80%] break-words ${
                  message.isUser ? "bg-black text-brand-gray" : "bg-brand-background text-brand-gray"
                }`}
              >
                <div className="text-sm">{message.text}</div>
                <div className="text-xs opacity-70 text-right mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-brand-background text-brand-gray p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-brand-gray animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-secondary-content animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-secondary-content animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleAsk} className="p-4 bg-[#29292B] border-t border-brand-cream border-opacity-20">
        <div className="max-w-4xl mx-auto flex items-end">
          <div className="relative flex-grow">
            <textarea
              ref={inputRef}
              rows={1}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full bg-transparent border border-brand-cream rounded-xl p-2 px-3 text-brand-cream placeholder-brand-gray placeholder-opacity-20 border-opacity-20 focus:outline-none focus:border-[#F66435] focus:border-opacity-50 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`ml-2 p-3 rounded-xl ${
              isLoading || !question.trim()
                ? "bg-[#333335] text-brand-cream opacity-50"
                : "bg-[#F66435] text-white hover:bg-opacity-90"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
