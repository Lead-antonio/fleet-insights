import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users as UsersIcon, Shield, UserCircle, MoreHorizontal, Trash2, Pencil, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';

interface Permission {
  id: string;
  name: string;
  // autres champs selon ton entité Permission
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  createdAt: string;
  is_active: boolean;
  number: string | null;
  country: string | null;
  state: string | null;
  role: Role;
}

const Users = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    number: '',
    country: '',
    state: '',
    role_id: null as number | null,
  });
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);


  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.response);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/users");
      console.log('Fetched users:', res.data.response);
      setUsers(res.data.response);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };


  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.number || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.country || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.state || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      await fetchUsers();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await api.post('/users', newUser);
      await fetchUsers();
      setCreateDialogOpen(false);
      setNewUser({ email: '', password: '', first_name: '', last_name: '', number: '', country: '', state: '', role_id: null });
      toast.success(t.users?.[response.data?.message], {
        style: { background: '#22c55e', color: 'white', border: '1px solid #16a34a' }
      });
    } catch (err: any) {
      toast.error(t.users?.[err.response?.data?.message], {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' }
      });
    }
  };

  const handleEdit = async (data: Partial<User>) => {
    if (!selectedUser) return;
    try {
      const { first_name, last_name, email, number, country, state, role } = selectedUser;
      const response = await api.put(`/users/update-user/${selectedUser.id}`, {
        first_name,
        last_name,
        email,
        number,
        country,
        state,
        role_id: role?.id || null,
      });
      await fetchUsers();
      setEditDialogOpen(false);
      toast.success(t.users?.[response.data?.message], {
        style: { background: '#22c55e', color: 'white', border: '1px solid #16a34a' }
      });
    } catch (err) {
      toast.error(t.users?.[err.response?.data?.message], {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' }
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      await fetchUsers();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getBadgeVariant = (name: string):
  | "default"
  | "secondary"
  | "destructive"
  | "outline" => {
  const key = name.toLowerCase();
  switch (key) {
    case "administrateur":
      return "default";
    case "utilisateur":
    case "user":
      return "secondary";
    case "root":
    case "manager":
      return "destructive";
    default:
      return "outline";
  }
};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.users.title}</h1>
          <p className="text-muted-foreground">{t.users.subtitle}</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">{t.users.totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.role?.name === 'Administrateur').length}</p>
              <p className="text-sm text-muted-foreground">{t.users.admins}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.role?.name === 'Utilisateur').length}</p>
              <p className="text-sm text-muted-foreground">{t.users.standardUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.users.userList}</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t.users.addUser}
            </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">{t.common.loading}</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t.common.noData}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>{t.users.name}</TableHead>
                  <TableHead>{t.users.email}</TableHead>
                  <TableHead>{t.users.country}</TableHead>
                  <TableHead>{t.users.number}</TableHead>
                  <TableHead>{t.users.role}</TableHead>
                  <TableHead>{t.users.joinDate}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Avatar className="w-10 h-10 text-1xl">
                        <AvatarFallback className="bg-primary text-primary-foreground text-1xl font-bold">
                          {u.first_name?.charAt(0)}{u.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {u.first_name || u.last_name
                        ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                        : '—'}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.country}, {u.state}</TableCell>
                    <TableCell>{u.number || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(u.role?.name)}>
                        {t.users[u.role?.name] || u.role?.name || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    {u.id !== user?.id && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedUser(u); setEditDialogOpen(true); }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { setSelectedUser(u); setDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.users.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.users.deleteConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.users.editUser}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t.users.first_name}</Label>
                <Input
                  defaultValue={selectedUser?.first_name || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t.users.last_name}</Label>
                <Input
                  defaultValue={selectedUser?.last_name || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t.users.email}</Label>
                <Input
                  defaultValue={selectedUser?.email || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t.users.number}</Label>
                <Input
                  defaultValue={selectedUser?.number || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, number: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t.users.country}</Label>
                <Input
                  defaultValue={selectedUser?.country || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, country: e.target.value } : null)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t.users.state}</Label>
                <Input
                  defaultValue={selectedUser?.state || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, state: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t.users.role}</Label>
              <Select
                value={selectedUser?.role?.id?.toString() || ''}
                onValueChange={(val) => setSelectedUser(prev => prev ? { ...prev, role: { ...prev.role, id: parseInt(val) } } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.users.selectRole} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={() => handleEdit(selectedUser!)}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.users.addUser}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t.users.first_name}</Label>
                <Input
                  value={newUser.first_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t.users.last_name}</Label>
                <Input
                  value={newUser.last_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t.users.email}</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t.users.password}</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t.users.country}</Label>
                <Input
                  value={newUser.country}
                  onChange={(e) => setNewUser(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t.users.state}</Label>
                <Input
                  value={newUser.state}
                  onChange={(e) => setNewUser(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t.users.number}</Label>
                <Input
                  value={newUser.number}
                  onChange={(e) => setNewUser(prev => ({ ...prev, number: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t.users.role}</Label>
                <Select
                  value={newUser.role_id?.toString() || ''}
                  onValueChange={(val) => setNewUser(prev => ({ ...prev, role_id: parseInt(val) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.users.selectRole} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreate}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
