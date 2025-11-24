import { useState } from "react";
import ChatList from "@/components/chat/chat-list";
import ChatBox from "@/components/chat/chat-box";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-screen flex">
      <ChatList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      <ChatBox selectedUser={selectedUser} />
    </div>
  );
}