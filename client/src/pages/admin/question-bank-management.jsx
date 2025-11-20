import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { createQuestionService, getAllQuestionsService, updateQuestionService, deleteQuestionService } from "../../services";

function QuestionBankManagement() {
  const { toast } = useToast();

  // State for questions list
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagsFilter, setTagsFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for create/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: "",
    options: [""],
    correctAnswer: "",
    explanation: "",
    tags: "",
    subject: "",
    difficulty: "easy",
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Fetch questions function
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        subject: subjectFilter,
        difficulty: difficultyFilter,
        tags: tagsFilter,
        search: searchTerm,
      };
      const response = await getAllQuestionsService(params);
      setQuestions(response.data.questions);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, subjectFilter, difficultyFilter, tagsFilter, searchTerm, toast]);

  // Effect to fetch questions when filters change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.questionText.trim()) {
      toast({
        title: "Error",
        description: "Question text is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.correctAnswer.trim()) {
      toast({
        title: "Error",
        description: "Correct answer is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.options.includes(formData.correctAnswer)) {
      toast({
        title: "Error",
        description: "Correct answer must be one of the options.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Error",
        description: "Subject is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const questionData = {
        ...formData,
        options: formData.options.filter(option => option.trim() !== ""),
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
      };

      if (editingQuestion) {
        await updateQuestionService(editingQuestion._id, questionData);
        toast({
          title: "Success",
          description: "Question updated successfully.",
        });
      } else {
        await createQuestionService(questionData);
        toast({
          title: "Success",
          description: "Question created successfully.",
        });
      }

      fetchQuestions();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save question:", error);
      toast({
        title: "Error",
        description: "Failed to save question. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      await deleteQuestionService(selectedQuestion._id);
      toast({
        title: "Success",
        description: "Question deleted successfully.",
      });
      fetchQuestions();
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      questionText: "",
      options: [""],
      correctAnswer: "",
      explanation: "",
      tags: "",
      subject: "",
      difficulty: "easy",
    });
    setEditingQuestion(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (question) => {
    setFormData({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      tags: question.tags.join(", "),
      subject: question.subject,
      difficulty: question.difficulty,
    });
    setEditingQuestion(question);
    setDialogOpen(true);
  };

  // Add option to form
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  // Update option
  const updateOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option),
    }));
  };

  // Remove option
  const removeOption = (index) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  // Get unique subjects for filter
  const subjects = [...new Set(questions.map(q => q.subject))];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Question Bank Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage questions that instructors can use in their quizzes.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by tags..."
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Questions Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No questions found
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={question.questionText}>
                        {question.questionText}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          question.difficulty === "easy" ? "default" :
                          question.difficulty === "medium" ? "secondary" : "destructive"
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(question.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(question)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedQuestion(question);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Create New Question"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <Textarea
                value={formData.questionText}
                onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))}
                placeholder="Enter the question..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {formData.options.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                Add Option
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Correct Answer</label>
              <Select
                value={formData.correctAnswer}
                onValueChange={(value) => setFormData(prev => ({ ...prev, correctAnswer: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {formData.options.map((option, index) => (
                    option.trim() && (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain the correct answer..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., Mathematics, Programming"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (Optional)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Comma-separated tags..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingQuestion ? "Update" : "Create"} Question
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question
              and remove it from the question bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuestion} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default QuestionBankManagement;