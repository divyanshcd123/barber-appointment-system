import { FiMoreVertical, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { format } from 'date-fns';

const ROLE_COLORS = {
  customer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  barber: 'bg-gold-500/10 text-gold-500 border-gold-500/20',
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const UserTable = ({ users, onToggle, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-gray-400 font-medium py-3 px-4">User</th>
            <th className="text-left text-gray-400 font-medium py-3 px-4 hidden md:table-cell">Role</th>
            <th className="text-left text-gray-400 font-medium py-3 px-4 hidden lg:table-cell">Joined</th>
            <th className="text-left text-gray-400 font-medium py-3 px-4">Status</th>
            <th className="text-right text-gray-400 font-medium py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-xs font-bold text-dark-300 shrink-0">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[user.role]}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell text-gray-400 text-xs">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </td>
              <td className="py-3 px-4">
                <span className={`text-xs font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {user.isActive ? '● Active' : '● Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {user.role !== 'admin' && (
                    <>
                      <button
                        id={`toggle-user-${user._id}`}
                        onClick={() => onToggle(user._id)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gold-500 transition-all"
                      >
                        {user.isActive ? <FiToggleRight size={16} className="text-green-400" /> : <FiToggleLeft size={16} />}
                      </button>
                      <button
                        id={`delete-user-${user._id}`}
                        onClick={() => onDelete(user._id)}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
