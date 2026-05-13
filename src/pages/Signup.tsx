import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Lock, Mail, ArrowRight, User, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "@/components/api/api";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        matricNumber: "",
        department: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<{
        checking: boolean;
        available: boolean | null;
        message: string;
    }>({
        checking: false,
        available: null,
        message: ''
    });

    // Department options
    const departments = [
        { value: 'CSC', label: 'Computer Science' },
        { value: 'SEN', label: 'Software Engineering' },
        { value: 'IFT', label: 'Information Technology' },
        { value: 'CYB', label: 'Cybersecurity' },
    ];

    // Debounced username check
    useEffect(() => {
        if (!formData.username || formData.username.length < 3) {
            setUsernameStatus({ checking: false, available: null, message: '' });
            return;
        }

        const timeoutId = setTimeout(() => {
            checkUsernameAvailability(formData.username);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username]);

    const checkUsernameAvailability = async (username: string) => {
        setUsernameStatus({ checking: true, available: null, message: '' });

        try {
            const response = await fetch(`${BASE_URL}/auth/check-username/${username.toLowerCase()}`);
            const data = await response.json();

            if (response.ok) {
                if (data.available) {
                    setUsernameStatus({
                        checking: false,
                        available: true,
                        message: 'Username is available'
                    });
                } else {
                    setUsernameStatus({
                        checking: false,
                        available: false,
                        message: 'Username is already taken'
                    });
                }
            } else {
                setUsernameStatus({
                    checking: false,
                    available: null,
                    message: ''
                });
            }
        } catch (err) {
            console.error('Error checking username:', err);
            setUsernameStatus({
                checking: false,
                available: null,
                message: ''
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDepartmentChange = (value: string) => {
        setFormData(prev => ({ ...prev, department: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!formData.matricNumber) {
            toast.error('Matric number is required');
            return;
        }

        if (!formData.department) {
            toast.error('Please select a department');
            return;
        }

        // Check if username is available before submitting
        if (usernameStatus.available === false) {
            toast.error('Please choose a different username');
            return;
        }

        if (usernameStatus.checking) {
            toast.error('Please wait while we check username availability');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                email: formData.email,
                username: formData.username.toLowerCase(),
                full_name: formData.fullName,
                matric_number: formData.matricNumber,
                department: formData.department,
                role: "student",
                password: formData.password
            };

            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }

            toast.success('Registration successful! Please sign in with your credentials.');
            
            // Redirect to login page after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err: any) {
            toast.error(err.message);
            console.error('Signup error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="flex items-center justify-center p-8 bg-background order-2 lg:order-1">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/30">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-display font-bold">Create an account</h1>
                        <p className="text-muted-foreground">Join the academic portal today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="John Doe"
                                    className="pl-9 bg-background"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-9 bg-background"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="johndoe"
                                    className={`pl-9 pr-9 bg-background ${
                                        usernameStatus.available === true ? 'border-green-500' :
                                        usernameStatus.available === false ? 'border-red-500' : ''
                                    }`}
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                                <div className="absolute right-3 top-3">
                                    {usernameStatus.checking && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {!usernameStatus.checking && usernameStatus.available === true && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    {!usernameStatus.checking && usernameStatus.available === false && (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                </div>
                            </div>
                            {usernameStatus.message && (
                                <p className={`text-xs ${
                                    usernameStatus.available ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {usernameStatus.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="matricNumber">Matric Number</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="matricNumber"
                                    name="matricNumber"
                                    placeholder="KDU/2024/001"
                                    className="pl-9 bg-background"
                                    value={formData.matricNumber}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Select
                                value={formData.department}
                                onValueChange={handleDepartmentChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.value} value={dept.value}>
                                            {dept.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className="pl-9 pr-9 bg-background"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="pl-9 pr-9 bg-background"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                            {isLoading ? "Creating account..." : (
                                <>
                                    Create account <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-muted/30 p-12 text-center order-1 lg:order-2">
                <h2 className="text-4xl font-display font-bold mb-6">Join Our Community</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
                    Unlock a world of possibilities. Seamless collaboration, instant resource access, and more.
                </p>
                <img
                    src="/placeholder.svg"
                    alt="Illustration"
                    className="w-full max-w-md mx-auto rounded-2xl shadow-2xl shadow-primary/10 opacity-80"
                />
            </div>
        </div>
    );
};

export default Signup;