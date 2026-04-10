import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { deleteUserByAdmin, getAdminActivity, getAdminStats, getAdminUsers, updateUserRole } from "../api";
import { usePlanStore } from "../store";

export default function AdminPanel() {
  const { user } = usePlanStore();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("email-asc");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, activityData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminActivity()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRecentActivity(activityData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (targetUser, role) => {
    try {
      setWorkingId(targetUser.id);
      setError("");
      await updateUserRole(targetUser.id, role);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to update role");
    } finally {
      setWorkingId("");
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const ok = window.confirm(`Delete user ${targetUser.email}?`);
    if (!ok) return;
    try {
      setWorkingId(targetUser.id);
      setError("");
      await deleteUserByAdmin(targetUser.id);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to delete user");
    } finally {
      setWorkingId("");
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    let list = users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return u.email.toLowerCase().includes(q) || String(u.id).toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "email-desc") return b.email.localeCompare(a.email);
      if (sortBy === "role") return a.role.localeCompare(b.role) || a.email.localeCompare(b.email);
      return a.email.localeCompare(b.email);
    });

    return list;
  }, [users, searchText, roleFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <p className="text-xs text-gray-500">Manage users and monitor usage</p>
          </div>
          <Link to="/" className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm">
            Back to Planner
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Users" value={stats?.totalUsers ?? "-"} />
          <MetricCard label="Admin Users" value={stats?.adminUsers ?? "-"} />
          <MetricCard label="Normal Users" value={stats?.normalUsers ?? "-"} />
          <MetricCard label="Total Plans" value={stats?.totalPlans ?? "-"} />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by email or user id"
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="all">All roles</option>
              <option value="admin">Admins only</option>
              <option value="user">Users only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="email-asc">Sort: Email A-Z</option>
              <option value="email-desc">Sort: Email Z-A</option>
              <option value="role">Sort: Role</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold">User Accounts</h2>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Role</th>
                  <th className="text-left px-4 py-2 font-medium">User ID</th>
                  <th className="text-left px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${
                            u.role === "admin"
                              ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{u.id}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {u.role !== "admin" ? (
                            <button
                              className="px-2 py-1 rounded-lg text-xs border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                              onClick={() => handleRoleChange(u, "admin")}
                              disabled={workingId === u.id}
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              className="px-2 py-1 rounded-lg text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                              onClick={() => handleRoleChange(u, "user")}
                              disabled={workingId === u.id || u.id === user.id}
                              title={u.id === user.id ? "You cannot demote yourself here" : ""}
                            >
                              Make User
                            </button>
                          )}
                          <button
                            className="px-2 py-1 rounded-lg text-xs border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                            onClick={() => handleDeleteUser(u)}
                            disabled={workingId === u.id || u.id === user.id}
                            title={u.id === user.id ? "You cannot delete yourself" : ""}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && filteredUsers.length === 0 && (
              <p className="px-4 py-4 text-gray-500 text-sm">No users found for current filters.</p>
            )}
            {loading && <p className="px-4 py-4 text-gray-500 text-sm">Loading admin data...</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="p-4">
            {recentActivity.length === 0 && !loading && (
              <p className="text-sm text-gray-500">No recent activity available.</p>
            )}
            <ul className="space-y-2">
              {recentActivity.map((item, idx) => (
                <li key={`${item.type}-${item.at}-${idx}`} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-sm text-gray-800">{item.message}</p>
                  <p className="text-xs text-gray-500">{new Date(item.at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
