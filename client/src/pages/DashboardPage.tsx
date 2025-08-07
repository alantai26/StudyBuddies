import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Plus, GraduationCap, X, AlertTriangle, Eclipse, Twitter, Linkedin, Instagram, Github } from "lucide-react";
import toast from 'react-hot-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Section {
  id: string;
  crn: string;
  course: CourseSummary;
}

interface CourseSummary {
  id: string;
  name: string;
  courseCode: string;
}

interface Course extends CourseSummary {
  sections: { id: string, crn: string }[];
}

interface Classmate {
  id: string;
  name: string;
  email: string;
  bio?: string;
  socials?: any;
}


const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve((reader.result as string).split(',')[1]);
  reader.onerror = error => reject(error);
});

export default function DashboardPage() {
  const { user, token, refetchUser } = useAuth();
  const [enrolledSections, setEnrolledSections] = useState<Section[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCrn, setNewCrn] = useState('');
  const [isClassmatesModalOpen, setIsClassmatesModalOpen] = useState(false);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [isFetchingClassmates, setIsFetchingClassmates] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [classmatesCourse, setClassmatesCourse] = useState<CourseSummary | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    socials: { linkedin: '', instagram: '', github: '' }
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchData = () => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([
      fetch('http://localhost:3001/api/profile/sections', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
    ])
      .then(async ([enrolledRes, availableRes]) => {
        if (!enrolledRes.ok || !availableRes.ok) throw new Error('Failed to fetch data');
        const enrolledData: Section[] = await enrolledRes.json();
        const allCoursesData: Course[] = await availableRes.json();

        setEnrolledSections(enrolledData);
        const enrolledCourseIds = new Set(enrolledData.map(s => s.course.id));
        setAvailableCourses(allCoursesData.filter(c => !enrolledCourseIds.has(c.id)));
      })
      .catch(() => toast.error("Could not load course data."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [token]);


  const openProfileModal = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        socials: {
          linkedin: user.socials?.linkedin || '',
          instagram: user.socials?.instagram || '',
          github: user.socials?.github || ''
        }
      });
      setIsProfileModalOpen(true);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingProfile(true);
    const toastId = toast.loading("Saving profile...");

    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error("Failed to save profile.");

      await response.json();
      toast.success("Profile saved!", { id: toastId });
      refetchUser();
      setIsProfileModalOpen(false);
    } catch (error) {
      toast.error("Could not save profile.", { id: toastId });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      socials: { ...prev.socials, [name]: value }
    }));
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleEnrollCourse = async (sectionId: string, showToast = true) => {
    const hasSeenWarning = localStorage.getItem('hasSeenPrivacyWarning');
    if (!hasSeenWarning) {
      setActionToConfirm(() => () => executeEnrollment(sectionId, showToast));
      setIsPrivacyModalOpen(true);
      return;
    }

    executeEnrollment(sectionId, showToast);
  };

  const executeEnrollment = async (sectionId: string, showToast = true) => {
    if (!token) return toast.error("Please log in to enroll.");
    setIsProcessing(sectionId);
    try {
      const response = await fetch(`http://localhost:3001/api/sections/${sectionId}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Enrollment failed");
      if (showToast) {
        toast.success("Successfully enrolled!");
      }
      setIsSectionModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("An error occurred while enrolling.");
    } finally {
      setIsProcessing(null);
    }
  };


  const handleAddNewSectionAndEnroll = () => {
    const hasSeenWarning = localStorage.getItem('hasSeenPrivacyWarning');
    if (!hasSeenWarning) {
      setActionToConfirm(() => () => executeAddNewSectionAndEnroll());
      setIsPrivacyModalOpen(true);
      return;
    }
    executeAddNewSectionAndEnroll();
  };

  const executeAddNewSectionAndEnroll = async () => {
    if (!newCrn || !selectedCourse || !token) return;
    setIsProcessing('new-crn');
    try {
      const createResponse = await fetch('http://localhost:3001/api/sections', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ crn: newCrn, courseId: selectedCourse.id }),
      });
      if (!createResponse.ok) throw new Error("Failed to create section. CRN might already exist.");
      const newSection = await createResponse.json();
      await executeEnrollment(newSection.id);
      setNewCrn('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add new CRN.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUnenrollCourse = async (sectionId: string) => {
    if (!token) return toast.error("Please log in to unenroll.");

    setIsProcessing(sectionId);
    try {
      const response = await fetch(`http://localhost:3001/api/sections/${sectionId}/unenroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unenrollment failed");
      }
      toast.success("Successfully unenrolled!");
      fetchData();
    } catch (error) {
      toast.error("An error occurred while enrolling.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleShowClassmates = async (section: Section) => {
    if (!token) return toast.error("Please log in.");
    setClassmatesCourse(section.course);
    setIsClassmatesModalOpen(true);
    setIsFetchingClassmates(true);
    try {
      const response = await fetch(`http://localhost:3001/api/sections/${section.id}/classmates`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch classmates.");
      const data = await response.json();
      setClassmates(data);
    } catch (error) {
      toast.error("Could not load classmates.");
      setIsClassmatesModalOpen(false);
    } finally {
      setIsFetchingClassmates(false);
    }
  };

  const handleScheduleScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasSeenWarning = localStorage.getItem('hasSeenPrivacyWarning');
    if (!hasSeenWarning) {
      setActionToConfirm(() => () => executeScheduleScan(event));
      setIsPrivacyModalOpen(true);
      event.target.value = '';
      return;
    }
    executeScheduleScan(event);
  };

  const executeScheduleScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      toast.error("OpenAI API key is not configured.");
      return;
    }

    setIsScanning(true);
    const toastId = toast.loading('Scanning your schedule...');

    try {
      const base64ImageData = await toBase64(file);
      const imageUrl = `data:${file.type};base64,${base64ImageData}`;
      const prompt = "Analyze this image of a student's class schedule. For each course, extract the course name (from the 'Title' column), the CRN (from the 'CRN' column), and the course ID (from the 'Details' column, e.g., 'CS 2500'). Return the data as a valid JSON object with a single key 'courses' which holds an array of objects. Each object should have three keys: 'name', 'crn', and 'id'. For example: {\"courses\": [{\"name\": \"Fundamentals of Computer Science 1\", \"crn\": \"10786\", \"id\": \"CS 2500\"}]}";
      const aiPayload = {
        model: "gpt-4o",
        messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: imageUrl } }] }],
        max_tokens: 500,
        response_format: { type: "json_object" }
      };

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(aiPayload)
      });

      if (!aiResponse.ok) {
        let errorMessage = "The AI model returned an error.";
        try {
          const errorBody = await aiResponse.clone().json();
          errorMessage = errorBody.error?.message || JSON.stringify(errorBody);
        } catch {
          errorMessage = await aiResponse.text();
        }
        throw new Error(errorMessage);
      }

      const aiResult = await aiResponse.json();
      const content = aiResult.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      const scannedCourses: { name: string, crn: string, id: string }[] = parsedContent.courses;

      if (!scannedCourses || !Array.isArray(scannedCourses) || scannedCourses.length === 0) {
        throw new Error("No courses could be identified.");
      }

      toast.loading(`Found ${scannedCourses.length} courses. Updating database...`, { id: toastId });

      const upsertResponse = await fetch('http://localhost:3001/api/courses/upsert-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scannedCourses)
      });

      if (!upsertResponse.ok) {
        throw new Error("Failed to add scanned courses to the database.");
      }

      const sectionsToEnroll: Section[] = await upsertResponse.json();
      toast.loading(`Enrolling you in ${sectionsToEnroll.length} courses...`, { id: toastId });

      let enrolledCount = 0;
      for (const section of sectionsToEnroll) {
        if (!enrolledSections.some(es => es.id === section.id)) {
          await handleEnrollCourse(section.id, false)
          enrolledCount++;
        }
      }

      if (enrolledCount > 0) {
        toast.success(`Successfully enrolled you in ${enrolledCount} new courses!`, { id: toastId });
      } else {
        toast.error("You are already enrolled in all scanned courses or courses do not exist", { id: toastId });
      }

      fetchData();

    } catch (error) {
      if (error instanceof Error) {
        const message = error.message || "An unknown network error occurred. Please check your API key and network connection.";
        toast.error(`Scan failed: ${message}`, { id: toastId });
      } else {
        toast.error("An unknown error occurred during the scan.", { id: toastId });
      }
    } finally {
      setIsScanning(false);
      event.target.value = '';
    }
  };

  const handlePrivacyConfirm = () => {
    localStorage.setItem('hasSeenPrivacyWarning', 'true');
    if (actionToConfirm) {
      actionToConfirm();
    }

    setIsPrivacyModalOpen(false);
    setActionToConfirm(null);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  const openSectionModal = (course: Course) => {
    setSelectedCourse(course);
    setIsSectionModalOpen(true);
  };

  return (
    <TooltipProvider>

      {/* Welcome & Profile Section*/}
      <div className="min-h-screen bg-[#FFFBF5]">
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl flex items-center justify-center gap-3">
              Hi {user?.name}!
            </h2>
            <button onClick={openProfileModal} className="mx-auto cursor-pointer group">
              <img
                src={`https://placehold.co/160x160/E63946/FFF?text=${user?.name.charAt(0)}`}
                alt={`${user?.name}'s profile picture`}
                className="w-40 h-40 rounded-full items-center transition-transform group-hover:scale-105 mt-3"
              />
            </button>
            {user && !user?.bio && !user?.socials ? (
              <h2 className="text-xl font-bold tracking-tighter sm:text-lg md:text-xl flex items-center justify-center gap-3 mt-3">
                Make sure to add your bio and socials by clicking your profile picture above!
              </h2>
            ) : (
              <h2 className="text-2xl font-bold tracking-tighter sm:text-lg md:text-2xl flex items-center justify-center gap-3 mt-3">
                Click your profile picture to customize your profile!
              </h2>
            )}
          </div>
        </section>

        {/* Scan Schedule Section */}
        <section className="w-full py-12 md:py-16 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl flex items-center justify-center gap-3">
              <Upload className="w-8 h-8 text-northeasternRed" />
              Scan Your Schedule
            </h2>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed mt-4">
              Have a screenshot of your schedule? Upload it here to automatically enroll in all your classes at once.
            </p>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xs/relaxed mt-4">
              Make sure to include your CRN Numbers, Class ID (e.g., CS 2500), and FULL class names in the screenshot.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="bg-northeasternRed text-white hover:bg-northeasternRed-darker cursor-pointer" disabled={isScanning}>
                <label htmlFor="schedule-upload">
                  {isScanning ? 'Scanning...' : 'Upload Screenshot'}
                </label>
              </Button>
              <input
                type="file"
                id="schedule-upload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleScheduleScan}
                disabled={isScanning}
              />
            </div>
          </div>
        </section>

        {/* My Courses Section */}
        <section className="w-full py-12 md:py-16 bg-white bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl flex items-center justify-center gap-3">
                  <BookOpen className="w-8 h-8 text-northeasternRed" />
                  My Courses
                </h2>
                <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
                  Check out your classmates profiles and connect with them!
                </p>
              </div>

              {enrolledSections.length > 0 ? (
                <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(320px,1fr))] max-w-6xl mx-auto">
                  {enrolledSections.map((section) => (
                    <Card key={section.crn} className="relative hover:shadow-lg transition-shadow border-2 hover:border-northeasternRed/20 flex flex-col">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600"
                            onClick={() => handleUnenrollCourse(section.id)}
                            disabled={isProcessing === section.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unenroll</p>
                        </TooltipContent>
                      </Tooltip>

                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">{section.course.courseCode} ({section.course.name})</CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-700 ">
                          CRN: {section.crn}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-grow flex flex-col justify-end space-y-2">
                        <Button
                          className="w-full bg-gray-700 text-white hover:bg-gray-800"
                          onClick={() => handleShowClassmates(section)}>
                          View Classmates
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses enrolled yet</h3>
                  <p className="text-gray-500">Start by enrolling in courses below!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Find More Courses Section */}
        <section className="w-full py-12 md:py-16 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl flex items-center justify-center gap-3">
                  <Plus className="w-8 h-8 text-northeasternRed" />
                  Find More Courses
                </h2>
                <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
                  Can't find your course? Try scanning your schedule above!
                </p>
              </div>

              {availableCourses.length > 0 ? (
                <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(320px,1fr))] max-w-6xl mx-auto">
                  {availableCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow border-2 hover:border-northeasternRed/20">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">{course.name}</CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-700 mt-1">
                          {course.courseCode}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full bg-northeasternRed text-white hover:bg-northeasternRed/90 disabled:opacity-50"
                          onClick={() => openSectionModal(course)}
                          disabled={isProcessing === course.id}
                        >
                          {isProcessing === course.id ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">All courses enrolled!</h3>
                  <p className="text-gray-500">You're enrolled in all available courses.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Section Selection Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Section for {selectedCourse?.name}</DialogTitle>
            <DialogDescription>
              Choose the CRN for the section you are in. If you don't see yours, add it below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedCourse?.sections && selectedCourse.sections.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {selectedCourse.sections.map(section => (
                  <Button
                    key={section.id}
                    variant="outline"
                    onClick={() => handleEnrollCourse(section.id)}
                    disabled={!!isProcessing}
                  >
                    {isProcessing === section.id ? "..." : section.crn}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center text-gray-500">No sections have been added for this course yet. Be the first!</p>
            )}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Input
                placeholder="Can't find yours? Add CRN"
                value={newCrn}
                onChange={(e) => setNewCrn(e.target.value)}
              />
              <Button onClick={handleAddNewSectionAndEnroll} disabled={!newCrn || !!isProcessing}>
                {isProcessing === 'new-crn' ? "..." : "Add & Enroll"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Classmates Modal */}
      <Dialog open={isClassmatesModalOpen} onOpenChange={setIsClassmatesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Classmates in {classmatesCourse?.name}</DialogTitle>
            <DialogDescription>
              Click on a student's name to view their bio and social links.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isFetchingClassmates ? (
              <p>Loading classmates...</p>
            ) : (
              <div>
                {classmates.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {classmates.map(classmate => (
                      <AccordionItem value={classmate.id} key={classmate.id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(classmate.name)}&background=E63946&color=FFF&rounded=true&bold=true`}
                              alt={`${classmate.name}'s profile picture`}
                              className="w-10 h-10 rounded-full"
                            />
                            <span className="font-semibold text-gray-800">{classmate.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-2 space-y-4">
                            {classmate.bio ? (
                              <p className="text-sm text-gray-700 italic border-l-2 border-gray-200 pl-3">
                                {classmate.bio}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No bio provided.</p>
                            )}

                            {/* Social Links Section */}
                            <div className="space-y-3 pt-2">
                              {classmate.socials?.linkedin && (
                                <a href={classmate.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                  <Linkedin className="h-4 w-4" /> LinkedIn Profile
                                </a>
                              )}
                              {classmate.socials?.github && (
                                <a href={classmate.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-800 hover:underline">
                                  <Github className="h-4 w-4" /> GitHub Profile
                                </a>
                              )}
                              {classmate.socials?.instagram && (
                                <a href={classmate.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                                  <Instagram className="h-4 w-4" /> Instagram Profile
                                </a>
                              )}
                            </div>

                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center text-gray-500 py-4">You're the first one here!</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Confirmation Modal */}
      <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Privacy Notice
            </DialogTitle>
            <DialogDescription className="pt-2">
              By enrolling in a course, you agree to make your profile (name and email address) visible to other students in that same course. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPrivacyModalOpen(false)}>Cancel</Button>
            <Button className="bg-northeasternRed text-white hover:bg-northeasternRed-darker" onClick={handlePrivacyConfirm}>
              Yes, I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Profile Edit Modal --- */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
            <DialogDescription>
              This information will be visible to your classmates. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSave} className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={profileData.name} onChange={handleProfileInputChange} required />
            </div>
            <div className="space-y-2 border-color{#000000}">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Tell others about yourself! (Major, year, hobbies, etc.)" value={profileData.bio} onChange={handleProfileInputChange} />
            </div>
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Social Links</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <Input name="linkedin" placeholder="LinkedIn URL" value={profileData.socials.linkedin} onChange={handleSocialsChange} />
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-gray-500" />
                  <Input name="instagram" placeholder="Instagram URL" value={profileData.socials.instagram} onChange={handleSocialsChange} />
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-gray-500" />
                  <Input name="github" placeholder="GitHub URL" value={profileData.socials.github} onChange={handleSocialsChange} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-northeasternRed text-white" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}


