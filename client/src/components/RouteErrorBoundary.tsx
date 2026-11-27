import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useLocation, useRouteError } from 'react-router-dom';
import { Button } from './ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  let title = 'Something went wrong';
  let description = 'An unexpected error occurred while loading this page.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText || 'Page Error'}`;
    description = typeof error.data === 'string' ? error.data : description;
  } else if (error instanceof Error) {
    if (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed')
    ) {
      title = 'New Version Available';
      description =
        'A newer version of the application was deployed. Please reload the page to fetch the latest assets.';
    } else if (error.message) {
      description = error.message;
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F6FA] px-4 py-12">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 text-center ring-1 ring-zinc-950/10 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display text-xl font-bold text-zinc-950">{title}</h1>
          <p className="text-sm leading-relaxed text-zinc-700">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('chunk_reload_attempted');
              window.location.reload();
            }}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            <RotateCw className="h-4 w-4" /> Reload Page
          </Button>
          <Link to={isAdmin ? '/admin' : '/'}>
            <Button type="button" variant="secondary" className="text-zinc-950">
              <Home className="h-4 w-4" /> {isAdmin ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
