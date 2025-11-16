import CommonForm from "@/components/common-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap, Loader2 } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    signInFieldErrors,
    signUpFieldErrors,
  } = useContext(AuthContext);

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  async function handleSignUpSubmit(event) {
    console.log("🔍 DEBUG: handleSignUpSubmit called");
    const result = await handleRegisterUser(event);
    console.log("🔍 DEBUG: handleRegisterUser result:", result);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setActiveTab("signin");
    } else {
      console.log("🔍 DEBUG: Registration failed, showing error toast");
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  async function handleSignInSubmit(event) {
    const result = await handleLoginUser(event);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      // Navigation will be handled by the route guard based on user role
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== "" &&
      signUpFormData.role !== ""
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="px-6 lg:px-8 h-16 flex items-center bg-white shadow-sm border-b border-gray-200">
        <Link to={"/"} className="flex items-center justify-center hover:opacity-80 transition-opacity duration-200">
          <GraduationCap className="h-8 w-8 mr-3 text-primary" />
          <span className="font-bold text-xl text-gray-900">LMS LEARN</span>
        </Link>
      </header>
      <div className="flex items-center justify-center flex-1 px-4 py-6 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md animate-slide-up">
          <Tabs
            value={activeTab}
            defaultValue="signin"
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-white shadow-sm">
              <TabsTrigger value="signin" className="text-xs sm:text-sm font-medium">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs sm:text-sm font-medium">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <Card className="shadow-lg border-0 bg-white bounce-in">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Welcome back</CardTitle>
                  <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommonForm
                    formControls={signInFormControls}
                    buttonText={"Sign In"}
                    formData={signInFormData}
                    setFormData={setSignInFormData}
                    isButtonDisabled={!checkIfSignInFormIsValid()}
                    handleSubmit={handleSignInSubmit}
                    fieldErrors={signInFieldErrors}
                  />
                  <div className="text-right">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm"
                      onClick={() => navigate('/auth/forgot-password')}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card className="shadow-lg border-0 bg-white bounce-in">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Create your account</CardTitle>
                  <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
                    Join LMS LEARN and start learning today
                  </CardDescription>
                  <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-200">
                    <strong className="text-sm font-medium text-blue-900">Username Requirements:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-800">
                      <li>3-50 characters long</li>
                      <li>Letters, numbers, and underscores only</li>
                      <li>No spaces or special characters</li>
                    </ul>
                    <p className="mt-2 text-xs text-blue-700">
                      Examples: user123, my_username, JohnDoe
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommonForm
                    formControls={signUpFormControls}
                    buttonText={"Create Account"}
                    formData={signUpFormData}
                    setFormData={setSignUpFormData}
                    isButtonDisabled={!checkIfSignUpFormIsValid()}
                    handleSubmit={handleSignUpSubmit}
                    fieldErrors={signUpFieldErrors}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
