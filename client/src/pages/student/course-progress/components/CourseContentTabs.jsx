import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Edit3, MessageSquare, Bell, CheckCircle } from "lucide-react";
import NotesSystem from "./NotesSystem";
import QnASection from "./QnASection";
import Announcements from "./Announcements";
import CertificateButton from "./CertificateButton";
import { calculateOverallProgress } from "@/lib/progressUtils";
import PropTypes from 'prop-types';

function CourseContentTabs({
  courseDetails,
  currentLecture,
  userProgress,
  progress,
  realTimeProgress,
  courseId,
  user
}) {
  const overallProgress = calculateOverallProgress(
    progress,
    courseDetails?.curriculum,
    currentLecture,
    realTimeProgress
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 h-14 rounded-t-xl">
          <TabsTrigger
            value="overview"
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-200 rounded-t-lg mx-1 first:ml-0 last:mr-0"
          >
            <Info className="h-4 w-4" />
            <span className="font-medium">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-200 rounded-t-lg mx-1 first:ml-0 last:mr-0"
          >
            <Edit3 className="h-4 w-4" />
            <span className="font-medium">Notes</span>
          </TabsTrigger>
          <TabsTrigger
            value="qna"
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-200 rounded-t-lg mx-1 first:ml-0 last:mr-0"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">Q&A</span>
          </TabsTrigger>
          <TabsTrigger
            value="announcements"
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-200 rounded-t-lg mx-1 first:ml-0 last:mr-0"
          >
            <Bell className="h-4 w-4" />
            <span className="font-medium">Announcements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {courseDetails?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Progress</span>
                    <span className="text-sm font-medium">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lectures Completed</span>
                    <span className="text-sm font-medium">
                      {userProgress?.completedLessons?.length || 0}/{courseDetails?.curriculum?.length || 0}
                    </span>
                  </div>

                  {userProgress?.lastUpdated && (
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(userProgress.lastUpdated).toLocaleString()}
                    </div>
                  )}

                  {userProgress?.isCompleted && userProgress?.completionDate && (
                    <div className="text-xs text-green-600 font-medium">
                      Completed on: {new Date(userProgress.completionDate).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Module Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {courseDetails?.curriculum?.map((lecture, index) => {
                      const isCompleted = userProgress?.completedLessons?.includes(lecture._id);
                      return (
                        <div key={lecture._id} className="flex items-center justify-between p-2 rounded-md border">
                          <div className="flex items-center space-x-2">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20"></div>
                            )}
                            <span className={`text-sm ${isCompleted ? 'text-green-700 font-medium' : 'text-foreground'}`}>
                              Module {index + 1}: {lecture.title}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                            {isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <CertificateButton
                  courseId={courseId}
                  isCompleted={userProgress?.isCompleted}
                  overallProgress={overallProgress}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="p-4">
          <NotesSystem
            lectureId={currentLecture?._id}
            courseId={courseId}
            lectureTitle={currentLecture?.title}
          />
        </TabsContent>

        <TabsContent value="qna" className="p-4">
          <QnASection
            courseId={courseId}
            lectureId={currentLecture?._id}
            user={user}
          />
        </TabsContent>

        <TabsContent value="announcements" className="p-4">
          <Announcements
            courseId={courseId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

CourseContentTabs.propTypes = {
  courseDetails: PropTypes.object,
  currentLecture: PropTypes.object,
  userProgress: PropTypes.object,
  progress: PropTypes.array,
  realTimeProgress: PropTypes.object,
  courseId: PropTypes.string,
  user: PropTypes.object,
};

export default CourseContentTabs;