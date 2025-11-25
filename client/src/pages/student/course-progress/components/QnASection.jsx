import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Reply,
  Flag
} from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "@/hooks/use-toast";

function QnASection({ courseId, lectureId, user }) {
  QnASection.propTypes = {
    courseId: PropTypes.string,
    lectureId: PropTypes.string,
    user: PropTypes.object
  };

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Mock questions data - in real implementation, this would come from API
  useEffect(() => {
    // Simulate loading questions
    const mockQuestions = [
      {
        id: 1,
        author: "John Doe",
        avatar: "JD",
        content: "Can you explain the concept of closures in more detail? I'm having trouble understanding how they work.",
        timestamp: "2024-01-15T10:30:00Z",
        likes: 5,
        replies: [
          {
            id: 101,
            author: "Instructor",
            avatar: "IN",
            content: "Sure! A closure is a function that has access to variables in its outer scope, even after the outer function has returned. Let me give you a practical example...",
            timestamp: "2024-01-15T11:00:00Z",
            likes: 3,
            isInstructor: true
          }
        ]
      },
      {
        id: 2,
        author: "Sarah Wilson",
        avatar: "SW",
        content: "What are the prerequisites for this course? Should I have prior knowledge of JavaScript?",
        timestamp: "2024-01-14T15:45:00Z",
        likes: 2,
        replies: []
      },
      {
        id: 3,
        author: "Mike Chen",
        avatar: "MC",
        content: "The code example on line 45 doesn't seem to work. I'm getting a 'TypeError'. Can someone help?",
        timestamp: "2024-01-13T09:20:00Z",
        likes: 1,
        replies: [
          {
            id: 102,
            author: "Alex Johnson",
            avatar: "AJ",
            content: "I had the same issue. Make sure you're using ES6 syntax. The example assumes you're using let/const instead of var.",
            timestamp: "2024-01-13T10:15:00Z",
            likes: 4,
            isInstructor: false
          }
        ]
      }
    ];
    setQuestions(mockQuestions);
  }, [courseId, lectureId]);

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;

    const question = {
      id: Date.now(),
      author: user?.name || "Anonymous",
      avatar: (user?.name || "A").substring(0, 2).toUpperCase(),
      content: newQuestion,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    setQuestions([question, ...questions]);
    setNewQuestion("");

    toast({
      title: "Question posted!",
      description: "Your question has been posted successfully.",
    });
  };

  const handleSubmitReply = (questionId) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      author: user?.name || "Anonymous",
      avatar: (user?.name || "A").substring(0, 2).toUpperCase(),
      content: replyText,
      timestamp: new Date().toISOString(),
      likes: 0,
      isInstructor: false
    };

    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, replies: [...q.replies, reply] }
        : q
    ));

    setReplyText("");
    setReplyingTo(null);

    toast({
      title: "Reply posted!",
      description: "Your reply has been posted successfully.",
    });
  };

  const handleLike = (questionId, replyId = null) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (replyId) {
          return {
            ...q,
            replies: q.replies.map(r =>
              r.id === replyId ? { ...r, likes: r.likes + 1 } : r
            )
          };
        } else {
          return { ...q, likes: q.likes + 1 };
        }
      }
      return q;
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Q&A</h3>
      </div>

      {/* Ask Question Form */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What would you like to know about this lecture?"
            className="min-h-20 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            onClick={handleSubmitQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!newQuestion.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Post Question
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No questions yet</p>
            <p className="text-sm">Be the first to ask a question about this lecture.</p>
          </div>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="border-gray-200">
              <CardContent className="p-4">
                {/* Question */}
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-gray-100">
                      {question.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {question.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(question.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-3">{question.content}</p>

                    {/* Question Actions */}
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(question.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {question.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(question.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === question.id && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="min-h-16 mb-2"
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleSubmitReply(question.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!replyText.trim()}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          <Button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {question.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {question.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-3 pl-4 border-l-2 border-gray-200">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className={`text-xs ${reply.isInstructor ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                {reply.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`font-medium text-xs ${reply.isInstructor ? 'text-green-700' : 'text-gray-900'}`}>
                                  {reply.author}
                                  {reply.isInstructor && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                      Instructor
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(reply.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(question.id, reply.id)}
                                className="text-gray-600 hover:text-gray-900 text-xs"
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {reply.likes}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Q&A Guidelines */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">💡 Q&A Guidelines</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Ask specific questions about the lecture content</li>
            <li>• Be respectful and constructive in your responses</li>
            <li>• Check if your question has already been asked</li>
            <li>• Instructors typically respond within 24 hours</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default QnASection;