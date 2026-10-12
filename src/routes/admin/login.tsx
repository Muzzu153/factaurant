import { createFileRoute } from '@tanstack/react-router';
import { getTenant } from '@/modules/tenant/tenant.server';
import { LoginForm } from '@/modules/auth/ui/LoginForm';

export const Route = createFileRoute('/admin/login')({
  loader: async () => {
    // Resolve tenant brand so login screen has the right restaurant title
    const tenant = await getTenant();
    return { tenant };
  },
  component: LoginPage,
});

function LoginPage() {
  const { tenant } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <LoginForm tenantName={tenant.name} />
    </div>
  );
}