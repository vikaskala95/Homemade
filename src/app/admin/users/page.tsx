"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchUsers();
  }, [session, status, page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const updateRole = async (userId: string, role: string) => {
    setUpdatingId(userId);
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      fetchUsers();
    } catch {} finally { setUpdatingId(null); }
  };

  const roleColor: Record<string, string> = { ADMIN: "destructive", VENDOR: "secondary", CUSTOMER: "default" };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button type="submit" variant="outline">Search</Button>
          </form>
          <select className="px-3 py-2 border rounded-lg text-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><Users className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No users found</p></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Orders</th>
                      <th className="p-4 font-medium">Reviews</th>
                      <th className="p-4 font-medium">Joined</th>
                      <th className="p-4 font-medium">Change Role</th>
                    </tr></thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b last:border-0">
                          <td className="p-4">
                            <p className="font-medium">{u.name || "—"}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </td>
                          <td className="p-4"><Badge variant={roleColor[u.role] as any || "default"}>{u.role}</Badge></td>
                          <td className="p-4">{u._count?.orders || 0}</td>
                          <td className="p-4">{u._count?.reviews || 0}</td>
                          <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="p-4">
                            <select
                              className="px-2 py-1 border rounded text-xs"
                              value={u.role}
                              onChange={(e) => updateRole(u.id, e.target.value)}
                              disabled={updatingId === u.id || u.id === session?.user?.id}
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="VENDOR">Vendor</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 p-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
