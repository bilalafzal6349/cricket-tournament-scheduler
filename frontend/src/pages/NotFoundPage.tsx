import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-9xl font-black text-gray-200">404</h1>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Page not found</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
      </div>
      <Link to="/">
        <Button>
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
