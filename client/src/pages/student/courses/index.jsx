import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import { ArrowUpDownIcon } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSeection =
      Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSeection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption.id],
      };

    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(
        getCurrentOption.id
      );

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption.id);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  const fetchAllStudentViewCourses = useCallback(async (filters, sort) => {
    const query = new URLSearchParams({
      ...filters,
      sortBy: sort,
    });
    const response = await fetchStudentViewCourseListService(query);
    if (response?.success) {
      setStudentViewCoursesList(response?.data);
      setLoadingState(false);
    } else {
      console.error("Failed to fetch courses:", response);
      setLoadingState(false);
    }
  }, [setStudentViewCoursesList, setLoadingState]);

  async function handleCourseNavigate(getCurrentCourseId) {
    navigate(`/course/details/${getCurrentCourseId}`);
  }


  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
    setLoadingState(true); // Set loading to true initially
  }, [setLoadingState]);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      fetchAllStudentViewCourses(filters, sort);
    }
  }, [filters, sort, fetchAllStudentViewCourses]);

  // Initial load effect
  useEffect(() => {
    fetchAllStudentViewCourses({}, "price-lowtohigh");
  }, [fetchAllStudentViewCourses]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);


  return (
    <div className="container mx-auto p-4 lg:p-8" role="main">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 hero-text">All Courses</h1>
        <p className="text-gray-600 text-base sm:text-lg">Discover your next learning adventure</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <aside className="w-full md:w-80 space-y-4 sm:space-y-6">
          <div className="glass-effect rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Filters</h2>
            {Object.keys(filterOptions).map((ketItem) => (
              <div key={ketItem} className="mb-4 sm:mb-6 pb-4 border-b border-gray-200 last:border-b-0">
                <h3 className="font-semibold mb-3 sm:mb-4 text-gray-700 uppercase text-xs sm:text-sm tracking-wide">{ketItem}</h3>
                <div className="grid gap-2 sm:gap-3">
                  {filterOptions[ketItem].map((option) => (
                    <Label key={option.id} className="flex font-medium items-center gap-2 sm:gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors text-sm">
                      <Checkbox
                        checked={
                          filters &&
                          Object.keys(filters).length > 0 &&
                          filters[ketItem] &&
                          filters[ketItem].indexOf(option.id) > -1
                        }
                        onCheckedChange={() =>
                          handleFilterOnChange(ketItem, option)
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                {studentViewCoursesList.length} {studentViewCoursesList.length === 1 ? 'Course' : 'Courses'} Found
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 glass-effect hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                >
                  <ArrowUpDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">Sort By: {sortOptions.find(s => s.id === sort)?.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                      className="cursor-pointer"
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <Card
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="course-card cursor-pointer group"
                  key={courseItem?._id}
                >
                  <CardContent className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                    <div className="w-full sm:w-48 lg:w-56 h-32 sm:h-36 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={courseItem?.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/banner-img.png'; // Fallback to banner image
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <CardTitle className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                          {courseItem?.title}
                        </CardTitle>
                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                          Created By{" "}
                          <span className="font-semibold text-blue-600">
                            {courseItem?.instructorName}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                            {courseItem?.level.toUpperCase()} Level
                          </span>
                          <span className="text-gray-500 text-sm">
                            {courseItem?.curriculum?.length} {courseItem?.curriculum?.length <= 1 ? "Lecture" : "Lectures"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <p className="font-bold text-xl sm:text-2xl text-blue-600">
                          ${courseItem?.pricing}
                        </p>
                        <Button className="btn-primary px-4 sm:px-6 py-2 w-full sm:w-auto">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : loadingState ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 sm:h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <h1 className="font-bold text-2xl sm:text-3xl text-gray-500 mb-2">No Courses Found</h1>
                <p className="text-gray-400 text-base sm:text-lg">Try adjusting your filters or check back later!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
