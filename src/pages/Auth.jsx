import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, UserPlus, LogIn, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            } else {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                // If signup is successful and auto-confirm is off, they might need to check email.
                // But for now assuming default settings or auto-login.
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    AT
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Bantoto Classrooms
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? 'Teacher Login' : 'Create Teacher Account'}
                </p>

                <div className="mt-6 flex justify-center">
                    <Link to="/join" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors">
                        <GraduationCap className="-ml-1 mr-2 h-5 w-5" />
                        I'm a Student
                    </Link>
                </div>

                <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 dark:bg-zinc-950 text-gray-500">Or sign in as teacher</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-zinc-800 transition-colors duration-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white py-2"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white py-2"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                            Error
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                {isLogin ? 'Sign in' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                                    {isLogin ? 'New to Attendance Taker?' : 'Already have an account?'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                {isLogin ? (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create an account
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Sign in instead
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
