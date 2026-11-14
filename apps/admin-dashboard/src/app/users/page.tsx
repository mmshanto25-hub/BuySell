import { Card, CardContent, Badge, Button } from '@marketplace/ui';
import { UserCheck, ShieldAlert, Lock, Search } from 'lucide-react';

const USERS_LIST = [
  {
    id: 'usr_1',
    name: 'Super Administrator',
    email: 'admin@marketplace.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    twoFactor: true,
    lastLogin: '10 mins ago',
  },
  {
    id: 'usr_2',
    name: 'Sarah Rahman',
    email: 'sarah@marketplace.com',
    role: 'PRODUCT_MANAGER',
    status: 'ACTIVE',
    twoFactor: true,
    lastLogin: '25 mins ago',
  },
  {
    id: 'usr_3',
    name: 'Apex Footwear Merchant',
    email: 'merchant@apexfootwear.com',
    role: 'SELLER',
    status: 'ACTIVE',
    twoFactor: true,
    lastLogin: '1 hour ago',
  },
  {
    id: 'usr_4',
    name: 'Rahim Chowdhury',
    email: 'rahim@gmail.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    twoFactor: false,
    lastLogin: '2 hours ago',
  },
  {
    id: 'usr_5',
    name: 'Kamal Hossain',
    email: 'kamal99@yahoo.com',
    role: 'CUSTOMER',
    status: 'SUSPENDED',
    twoFactor: false,
    lastLogin: '3 days ago',
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">User & Access Management</h1>
          <p className="text-xs text-[#667085]">Role assignments, security credentials, and account suspension controls</p>
        </div>
      </div>

      <Card className="border-[#E4E7EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name / Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">2FA Security</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {USERS_LIST.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#101828] text-sm">{user.name}</p>
                      <span className="text-[#667085] text-xs font-mono">{user.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-semibold text-[#3563E9] bg-[#EFF4FF] px-2 py-0.5 rounded border border-[#DBE7FE]">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.twoFactor ? (
                        <Badge variant="success">TOTP Enabled</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-[#667085]">{user.lastLogin}</td>
                    <td className="p-4 text-right">
                      {user.status === 'ACTIVE' ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]">
                          Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="primary" className="h-7 text-xs">
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
