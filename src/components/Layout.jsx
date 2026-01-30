import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-gray-900 font-sans">
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                                    AT
                                </div>
                                <span className="font-bold text-lg tracking-tight text-gray-900">Bantoto Classrooms</span>
                            </Link>
                        </div>
                        <div className="flex space-x-4 items-center">
                            {/* Add simplified nav items if needed, or just keep it clean */}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
