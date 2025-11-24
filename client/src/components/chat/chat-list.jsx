import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context/useAuth";
import { useSocket } from "@/context/socket-context/useSocket";
import { getChatPartnersService } from "@/services";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ChatList({ onSelectUser, selectedUser }) {
  ChatList.propTypes = {
    onSelectUser: PropTypes.func.isRequired,
    selectedUser: PropTypes.shape({
      userId: PropTypes.string,
      userName: PropTypes.string,
      role: PropTypes.string,
    }),
  };

  const { auth } = useAuth();
  const { messages } = useSocket();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch chat partners
  useEffect(() => {
    const fetchChatPartners = async () => {
      try {
        setLoading(true);
        const response = await getChatPartnersService();
        if (response.success) {
          setUsers(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chat partners:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.authenticate && auth.user) {
      fetchChatPartners();
    }
  }, [auth.authenticate, auth.user]);

  // Calculate unread messages for each user
  const getUnreadCount = (userId) => {
    if (!messages || !Array.isArray(messages)) return 0;
    return messages.filter(
      (msg) =>
        msg.senderId === userId &&
        msg.receiverId === auth.user._id &&
        !msg.seen
    ).length;
  };

  // Filter users based on search term
  const filteredUsers = (users && Array.isArray(users)) ? users.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.userEmail && user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <div className="w-80 border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="p-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                {searchTerm ? "No users found" : "No chat partners available"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const unreadCount = getUnreadCount(user.userId);
              return (
                <div
                  key={user.userId}
                  onClick={() => onSelectUser(user)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.userId === user.userId
                      ? "bg-blue-100 border-blue-300"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{user.userName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      {user.courseTitle && (
                        <p className="text-xs text-gray-400 truncate">{user.courseTitle}</p>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}