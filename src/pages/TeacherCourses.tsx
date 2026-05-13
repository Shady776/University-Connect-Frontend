import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, BookOpen, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BASE_URL } from "@/components/api/api";

const DEPARTMENTS = [
    { value: 'CSC', label: 'Computer Science (CSC)' },
    { value: 'SEN', label: 'Software Engineering (SEN)' },
    { value: 'IFT', label: 'Information Technology (IFT)' },
    { value: 'CYB', label: 'Cybersecurity (CYB)' }
];

const SEMESTERS = [
    { value: '1st', label: '1st Semester' },
    { value: '2nd', label: '2nd Semester' }
];

interface Course {
    id: string;
    title: string;
    course_code: string;
    description?: string;
    department: string;
    semester: string;
    schedule?: string;
    location?: string;
    credits: number;
    is_active: boolean;
    enrolled_count?: number;
    assignments_count?: number;
}

const TeacherCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [teacherName, setTeacherName] = useState("");

    const [courseForm, setCourseForm] = useState({
        title: "",
        course_code: "",
        description: "",
        department: "",
        semester: "",
        schedule: "",
        location: "",
        credits: 3
    });

    useEffect(() => {
        fetchTeacherProfile();
        fetchCourses();
    }, []);

    const fetchTeacherProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setTeacherName(data.full_name || data.username);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            // Fetch courses with enrollment and assignment counts
            const response = await fetch(`${BASE_URL}/assignments/courses-list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!courseForm.title || !courseForm.course_code || !courseForm.department || !courseForm.semester) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/courses/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create course');
            }

            toast.success("Course created successfully!");
            setIsCreateDialogOpen(false);
            resetForm();
            await fetchCourses();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCourse = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCourse || !courseForm.title || !courseForm.course_code || !courseForm.department || !courseForm.semester) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/courses/${selectedCourse.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update course');
            }

            toast.success("Course updated successfully!");
            setIsEditDialogOpen(false);
            setSelectedCourse(null);
            resetForm();
            await fetchCourses();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;

        setSubmitting(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/courses/${selectedCourse.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete course');
            }

            toast.success("Course deleted successfully!");
            setIsDeleteDialogOpen(false);
            setSelectedCourse(null);
            await fetchCourses();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditDialog = (course: Course) => {
        setSelectedCourse(course);
        setCourseForm({
            title: course.title,
            course_code: course.course_code,
            description: course.description || "",
            department: course.department,
            semester: course.semester,
            schedule: course.schedule || "",
            location: course.location || "",
            credits: course.credits
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (course: Course) => {
        setSelectedCourse(course);
        setIsDeleteDialogOpen(true);
    };

    const resetForm = () => {
        setCourseForm({
            title: "",
            course_code: "",
            description: "",
            department: "",
            semester: "",
            schedule: "",
            location: "",
            credits: 3
        });
    };

    if (loading) {
        return (
            <DashboardLayout role="teacher" userName={teacherName}>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="teacher" userName={teacherName}>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">My Courses</h1>
                        <p className="text-muted-foreground mt-1">Manage your active courses and curriculum</p>
                    </div>

                    <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4" /> Create New Course
                    </Button>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-50 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted-foreground">No courses yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Create your first course to get started</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card className="h-full flex flex-col group overflow-hidden border-border/50 hover:border-primary/20 transition-all hover:shadow-lg">
                                    <div className="h-24 bg-primary/10 relative p-6 flex justify-between items-center">
                                        <span className="text-xs font-medium bg-background/50 backdrop-blur px-2 py-1 rounded border border-border/10">
                                            {course.course_code}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(course)}>
                                                    <Edit className="w-4 h-4" /> Edit Course
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => openDeleteDialog(course)}>
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {course.department} • {course.semester}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="flex-grow pb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                    <Users className="w-3.5 h-3.5" /> Students
                                                </div>
                                                <span className="text-xl font-bold">{course.enrolled_count || 0}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                    <BookOpen className="w-3.5 h-3.5" /> Assignments
                                                </div>
                                                <span className="text-xl font-bold">{course.assignments_count || 0}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Course Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Course</DialogTitle>
                        <DialogDescription>
                            Add a new course to your curriculum. Fill in all required fields.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCourse}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">
                                        Department <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={courseForm.department}
                                        onValueChange={(value) => setCourseForm({ ...courseForm, department: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEPARTMENTS.map(dept => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="semester">
                                        Semester <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={courseForm.semester}
                                        onValueChange={(value) => setCourseForm({ ...courseForm, semester: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEMESTERS.map(sem => (
                                                <SelectItem key={sem.value} value={sem.value}>
                                                    {sem.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="course_code">
                                        Course Code <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="course_code"
                                        value={courseForm.course_code}
                                        onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                                        placeholder="e.g. CSC 301"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="credits">
                                        Credits <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={courseForm.credits}
                                        onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Course Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    placeholder="e.g. Data Structures and Algorithms"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    placeholder="Brief course description..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="schedule">Schedule</Label>
                                    <Input
                                        id="schedule"
                                        value={courseForm.schedule}
                                        onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
                                        placeholder="e.g. Mon/Wed 10:00 AM"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={courseForm.location}
                                        onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                                        placeholder="e.g. Room 201"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Course"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Course Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>
                            Update course information. Fill in all required fields.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditCourse}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-department">
                                        Department <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={courseForm.department}
                                        onValueChange={(value) => setCourseForm({ ...courseForm, department: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEPARTMENTS.map(dept => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-semester">
                                        Semester <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={courseForm.semester}
                                        onValueChange={(value) => setCourseForm({ ...courseForm, semester: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEMESTERS.map(sem => (
                                                <SelectItem key={sem.value} value={sem.value}>
                                                    {sem.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="edit-course_code">
                                        Course Code <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="edit-course_code"
                                        value={courseForm.course_code}
                                        onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                                        placeholder="e.g. CSC 301"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-credits">
                                        Credits <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="edit-credits"
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={courseForm.credits}
                                        onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-title">
                                    Course Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit-title"
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    placeholder="e.g. Data Structures and Algorithms"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    placeholder="Brief course description..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-schedule">Schedule</Label>
                                    <Input
                                        id="edit-schedule"
                                        value={courseForm.schedule}
                                        onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
                                        placeholder="e.g. Mon/Wed 10:00 AM"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                        id="edit-location"
                                        value={courseForm.location}
                                        onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                                        placeholder="e.g. Room 201"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedCourse(null); resetForm(); }} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Course"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course "{selectedCourse?.title}" and all associated assignments and enrollments. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourse}
                            disabled={submitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default TeacherCourses;