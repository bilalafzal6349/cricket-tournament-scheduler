import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const formData = new FormData();
      formData.append('username', data.email);
      formData.append('password', data.password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      login(response.data.access_token, response.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or use the demo credentials provided below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Credentials
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-md text-xs">
                <p className="font-semibold text-gray-700">Admin</p>
                <p className="text-gray-600">admin@example.com</p>
                <p className="text-gray-600">admin123</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md text-xs">
                <p className="font-semibold text-gray-700">User</p>
                <p className="text-gray-600">user@example.com</p>
                <p className="text-gray-600">user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
