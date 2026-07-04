import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../api/auth';

export default function ResetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await confirmPasswordReset({
        uid: uid || '',
        token: token || '',
        new_password: newPassword,
        new_password2: newPassword2,
      });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        setError(firstMsg || 'Reset failed. The link may have expired.');
      } else {
        setError('Reset failed. The link may have expired.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Reset Password
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
