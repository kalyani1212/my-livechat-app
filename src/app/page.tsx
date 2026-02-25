"use client";

import { useQuery, useMutation, Authenticated, Unauthenticated } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { Search, Send, MessageSquare, Users } from "lucide-react";

export default function Home() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.list);
  const otherUsers = useQuery(api.users.listAll, { search: searchTerm });
  const sendMessage = useMutation(api.messages.send);
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (user) { storeUser(); }
  }, [user, storeUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Sending only what the schema expects
    await sendMessage({ body: input, author: user?.fullName || "Anonymous" });
    setInput("");
  };

  return (
    <main className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-xl flex items-center gap-2 text-indigo-600">
            <MessageSquare size={24} /> LiveChat
          </h2>
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Direct Messages</p>
          <Authenticated>
            {otherUsers?.map((u) => (
              <div key={u._id} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 cursor-pointer group transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase border border-indigo-200">
                  {u.name[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-slate-700 truncate">{u.name}</p>
                  <p className="text-xs text-green-500 font-medium tracking-tight">Available</p>
                </div>
              </div>
            ))}
          </Authenticated>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 bg-white shadow-2xl">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden"><UserButton afterSignOutUrl="/" /></div>
            <div>
              <h3 className="font-bold text-slate-800">Global Chat</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Live</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <Unauthenticated>
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-6 bg-indigo-50 rounded-full text-indigo-600 mb-4 animate-bounce">
                <Users size={64} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Restricted</h2>
              <p className="text-slate-500 mt-2 mb-6 max-w-xs">Please log in to see the user directory and join the conversation.</p>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                  Sign In Now
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>

          <Authenticated>
            {messages?.map((msg) => {
              const isMe = msg.author === user?.fullName;
              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && <span className="text-[10px] font-bold text-slate-400 ml-2 mb-1 uppercase tracking-tighter">{msg.author}</span>}
                    <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                      isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </Authenticated>
        </div>

        <Authenticated>
          <div className="p-5 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="max-w-5xl mx-auto flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message everyone..."
                className="flex-1 bg-transparent border-none py-2 px-4 focus:ring-0 text-slate-800 outline-none"
              />
              <button type="submit" disabled={!input.trim()} className="bg-indigo-600 p-3 rounded-xl text-white hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg shadow-indigo-100">
                <Send size={18} />
              </button>
            </form>
          </div>
        </Authenticated>
      </section>
    </main>
  );
}