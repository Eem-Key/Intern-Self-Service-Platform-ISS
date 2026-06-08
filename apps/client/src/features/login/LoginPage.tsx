import logo from '../../assets/images/logo.png';
import bg1 from '../../assets/images/bg1.png';
import LoginForm from './components/LoginForm';
import { useEffect } from 'react';

function LoginPage() {
    
    useEffect(() => {
    document.title = 'Login | Intern Self Service';
    }, []);

    return (
        <main className="min-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-2">
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-[360px]">
            <div className="mb-8 flex justify-center">
                <img
                src={logo}
                alt="Equicom Logo"
                className="h-30 w-auto object-contain"
                />
            </div>

            <div className="mb-12 text-center">
                <h1 className="text-[35px] font-bold leading-none text-black">
                Welcome!
                </h1>
                <p className="mt-1 text-sm text-black">
                Log in to your Account
                </p>
            </div>

            <LoginForm />
            </div>
        </section>


        <section className="relative hidden min-h-screen overflow-hidden lg:block">
            <img
            src={bg1}
            alt="Intern Self Service"
            className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b448b]/40 to-[#003d8f]" />

            <div className="absolute bottom-16 left-12">
            <h2 className="text-[56px] font-bold leading-tight text-white">
                Intern
                <br />
                Self Service
            </h2>
            </div>
        </section>
        </main>
    );
}

export default LoginPage;