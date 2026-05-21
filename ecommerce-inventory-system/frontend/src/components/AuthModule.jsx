import { useState } from "react";
import { Shield, User, Key, CheckCircle, AlertTriangle, LogOut, Lock } from "lucide-react";

const AuthModule = ({ user, onLogin, onLogout }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        onLogin({
          username: data.username,
          role: data.role,
          token: data.token,
        });
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.warn("Backend unavailable. Performing local fallback login.");
      // Fail-safe offline fallback
      if (formData.username === "admin" && formData.password === "admin") {
        onLogin({ username: "admin", role: "Admin", token: "fallback-admin" });
      } else if (formData.username === "employee" && formData.password === "employee") {
        onLogin({ username: "employee", role: "Employee", token: "fallback-employee" });
      } else {
        setError("Invalid username or password. (Use admin/admin or employee/employee)");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    onLogin({ username: "Guest User", role: "Guest", token: "guest" });
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center animate-scaleIn">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You are logged in!</h2>
        <p className="text-gray-600 mb-6">
          Signed in as <span className="font-semibold text-gray-900">{user.username}</span>
        </p>

        <div className="p-4 bg-gray-50 rounded-12 border border-border mb-6 text-left space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Role-Based Permissions:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`chip ${user.role === "Admin" ? "chip-primary" : "chip-gray"}`}>
              Admin Role: All features unlocked
            </span>
            <span className={`chip ${user.role === "Employee" ? "chip-primary" : "chip-gray"}`}>
              Employee Role: Read & partial operations
            </span>
            <span className={`chip ${user.role === "Guest" ? "chip-primary" : "chip-gray"}`}>
              Guest: View-only
            </span>
          </div>
        </div>

        <button onClick={onLogout} className="btn-secondary w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto card p-8 animate-slideUp">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-16 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="text-sm text-gray-500 mt-1">Access E-Commerce Inventory Control System</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter username (e.g. admin)"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input w-full pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="Enter password (e.g. admin)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input w-full pl-10"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <button onClick={handleGuestAccess} className="btn-tertiary w-full py-3">
        Continue as Guest (Read-Only)
      </button>

      <div className="mt-6 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-8 border border-border">
        <p className="font-semibold mb-1">🔑 Demo Accounts:</p>
        <p>Admin Access: <span className="font-mono">admin</span> / <span className="font-mono">admin</span></p>
        <p>Employee Access: <span className="font-mono">employee</span> / <span className="font-mono">employee</span></p>
      </div>
    </div>
  );
};

export default AuthModule;
