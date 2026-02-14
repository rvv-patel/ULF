import { useActionState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import projectLogo from '../../assets/project-logo.png';

// Define the state type for the action
interface LoginState {
    error: string | null;
}

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Form Action Handler
    const loginAction = async (_: LoginState, formData: FormData): Promise<LoginState> => {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            login(token, user);
            navigate('/');
            return { error: null };
        } catch (err: any) {
            return {
                error: err.response?.data?.message || 'Failed to login. Please check your credentials.'
            };
        }
    };

    // React 19 useActionState hook
    const [state, formAction, isPending] = useActionState(loginAction, { error: null });

    return (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[#eef2f6] relative">
            {/* 1. Dynamic Animated Background (The "World" behind the glass) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px] animate-bounce delay-700 duration-[10s]"></div>

                {/* Mesh Grid Pattern for Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            {/* 2. Grand Glass Card Container */}
            <div className="relative z-10 w-full max-w-[1280px] h-[85vh] mx-4 lg:mx-8 bg-white/40 backdrop-blur-2xl rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/50 flex overflow-hidden animate-in zoom-in-95 duration-700">

                {/* Left Side - The Branding (Glassy Blue) */}
                <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-md relative flex-col items-center justify-center p-12 text-center text-white overflow-hidden">
                    {/* Decorative Circles inside the Left Pane */}
                    <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-40 h-40 border border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 bg-blue-500/10 rotate-12 scale-150 transform origin-bottom-left"></div>

                    <div className="relative z-10 w-full max-w-sm">
                        {projectLogo && (
                            <div className="mb-12 flex justify-center">
                                {/* The "Pill" Logo Design - Optimized for Glass */}
                                <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] px-10 py-8 shadow-2xl shadow-blue-900/40 ring-4 ring-white/20 transform hover:scale-105 transition-transform duration-500 cursor-default">
                                    <img
                                        src={projectLogo}
                                        alt="Logo"
                                        className="h-20 w-auto object-contain drop-shadow-md"
                                    />
                                </div>
                            </div>
                        )}

                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight drop-shadow-md leading-tight">
                            Empowering Legal <br /> Excellence
                        </h1>
                        <p className="text-blue-50 text-base lg:text-lg font-light leading-relaxed mb-8 max-w-sm mx-auto opacity-90">
                            Simplify complex legal workflows with our advanced case management system.
                            Securely manage clients, track proceedings, and automate documentation with precision.
                        </p>

                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-900/30 rounded-full border border-blue-400/30 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md shadow-lg text-blue-50">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Secure Portal Environment
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form (Frosted White) */}
                <div className="w-full lg:w-[55%] bg-white/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 sm:p-16 relative">
                    <div className="w-full max-w-md space-y-8">

                        <div className="text-center lg:text-left space-y-2">
                            {/* Mobile Logo Logo */}
                            <div className="lg:hidden flex justify-center mb-6">
                                {projectLogo && <img src={projectLogo} className="h-16 w-auto object-contain" alt="Current Logo" />}
                            </div>
                            <h2 className="text-4xl font-bold text-gray-800 tracking-tight">Welcome</h2>
                            <p className="text-gray-500 font-medium">Please enter your credentials to access the portal.</p>
                        </div>

                        {state.error && (
                            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-center gap-4 animate-shake">
                                <div className="p-2 bg-red-100 rounded-full text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium text-red-600">{state.error}</p>
                            </div>
                        )}

                        <form className="mt-8 space-y-6" action={formAction}>
                            <div className="space-y-6">
                                <div className="group space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[11px]">Email Address</label>
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200/60 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm hover:bg-white/80"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[11px]">Password</label>
                                        <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
                                    </div>
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200/60 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm hover:bg-white/80"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <label className="flex items-center cursor-pointer group select-none relative">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                        />
                                        <div className="w-6 h-6 border-2 border-gray-300 rounded-lg bg-white/50 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:rotate-3 transition-all duration-300"></div>
                                        <CheckCircle2 className="w-4 h-4 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-50 peer-checked:scale-100" />
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Remember device</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full relative group flex items-center justify-center py-4 px-4 bg-gray-900 overflow-hidden text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-5 w-5 text-white/80" />
                                        <span>Authenticating...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign In
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Not a member?{' '}
                                <Link to="/register" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}
