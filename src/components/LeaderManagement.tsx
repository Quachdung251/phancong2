import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, FileText } from 'lucide-react';
import type { Leader } from '../types';

interface LeaderManagementProps {
  leaders: Leader[];
  onAddLeader: (leader: Omit<Leader, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateLeader: (id: string, leader: Partial<Leader>) => void;
  onDeleteLeader: (id: string) => void;
}

const LeaderManagement: React.FC<LeaderManagementProps> = ({
  leaders,
  onAddLeader,
  onUpdateLeader,
  onDeleteLeader
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cases_this_year: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLeader) {
      // Cập nhật lãnh đạo
      onUpdateLeader(editingLeader.id, formData);
      setEditingLeader(null);
    } else {
      // Thêm lãnh đạo mới
      onAddLeader(formData);
      setShowAddForm(false);
    }
    
    setFormData({ name: '', cases_this_year: 0 });
  };

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setFormData({
      name: leader.name,
      cases_this_year: leader.cases_this_year
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLeader(null);
    setFormData({ name: '', cases_this_year: 0 });
  };

  const totalCases = leaders.reduce((sum, leader) => sum + leader.cases_this_year, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lãnh Đạo Viện</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm Lãnh Đạo
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng số lãnh đạo</p>
              <p className="text-3xl font-bold text-gray-900">{leaders.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng số vụ án</p>
              <p className="text-3xl font-bold text-gray-900">{totalCases}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Trung bình vụ/người</p>
              <p className="text-3xl font-bold text-gray-900">
                {leaders.length > 0 ? Math.round((totalCases / leaders.length) * 10) / 10 : 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Form thêm/sửa */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingLeader ? 'Sửa Thông Tin Lãnh Đạo' : 'Thêm Lãnh Đạo Mới'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lãnh đạo
                </label>
                <input
                  type="text"
                  className="input-field text-lg"
                  placeholder="Nhập tên lãnh đạo..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số vụ án đã nhận trong năm
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field text-lg"
                  placeholder="0"
                  value={formData.cases_this_year}
                  onChange={(e) => setFormData({ ...formData, cases_this_year: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingLeader ? 'Cập Nhật' : 'Thêm Lãnh Đạo'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách lãnh đạo */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Danh Sách Lãnh Đạo ({leaders.length})
        </h2>
        
        {leaders.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lãnh đạo nào</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm lãnh đạo đầu tiên.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-6 btn-primary"
            >
              Thêm Lãnh Đạo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-lg">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-700">STT</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">Tên Lãnh Đạo</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700">Số Vụ Án Trong Năm</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700">Tỷ Lệ</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {leaders
                  .sort((a, b) => b.cases_this_year - a.cases_this_year)
                  .map((leader, index) => (
                    <tr key={leader.id} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-lg font-semibold text-gray-900">{leader.name}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-bold text-blue-600 text-xl">{leader.cases_this_year}</div>
                        <div className="text-sm text-gray-500">vụ án</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${totalCases > 0 ? (leader.cases_this_year / totalCases) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {totalCases > 0 ? Math.round((leader.cases_this_year / totalCases) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(leader)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa lãnh đạo "${leader.name}"?`)) {
                                onDeleteLeader(leader.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderManagement;
