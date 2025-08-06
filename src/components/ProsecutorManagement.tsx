import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  X,
  Save,
  UserPlus,
  FileText
} from 'lucide-react';
import type { Prosecutor, FilterCriteria } from '../types';

interface ProsecutorManagementProps {
  prosecutors: Prosecutor[];
  onAdd: (prosecutor: Omit<Prosecutor, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdate: (id: string, prosecutor: Partial<Prosecutor>) => void;
  onDelete: (id: string) => void;
}

const ProsecutorManagement: React.FC<ProsecutorManagementProps> = ({ 
  prosecutors, 
  onAdd, 
  onUpdate, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProsecutor, setSelectedProsecutor] = useState<Prosecutor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add'>('view');
  const [formData, setFormData] = useState<Partial<Prosecutor>>({});

  // Lọc và tìm kiếm prosecutors
  const filteredProsecutors = useMemo(() => {
    return prosecutors.filter(prosecutor => {
      // Tìm kiếm theo tên
      if (searchTerm && !prosecutor.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Lọc theo chức vụ
      if (filters.position && prosecutor.position !== filters.position) {
        return false;
      }

      // Lọc theo chuyên môn
      if (filters.specialization && !prosecutor.specialization_tags.some(tag => 
        tag.toLowerCase().includes(filters.specialization!.toLowerCase())
      )) {
        return false;
      }

      // Lọc theo kinh nghiệm
      if (filters.experience_min && prosecutor.experience_years < filters.experience_min) {
        return false;
      }

      if (filters.experience_max && prosecutor.experience_years > filters.experience_max) {
        return false;
      }

      // Lọc theo tải công việc
      if (filters.workload_max && prosecutor.current_cases > filters.workload_max) {
        return false;
      }

      return true;
    });
  }, [prosecutors, searchTerm, filters]);

  const handleOpenModal = (type: 'view' | 'edit' | 'add', prosecutor?: Prosecutor) => {
    setModalType(type);
    setSelectedProsecutor(prosecutor || null);
    setFormData(prosecutor || {
      name: '',
      position: 'Kiểm sát viên',
      experience_years: 0,
      specialization_tags: [],
      current_cases: 0,
      current_defendants: 0
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (modalType === 'add') {
      onAdd(formData as Omit<Prosecutor, 'id' | 'created_at' | 'updated_at'>);
    } else if (modalType === 'edit' && selectedProsecutor) {
      onUpdate(selectedProsecutor.id, formData);
    }
    setShowModal(false);
  };

  const handleUpdateCaseload = (prosecutorId: string, cases: number, defendants: number) => {
    onUpdate(prosecutorId, { 
      current_cases: cases, 
      current_defendants: defendants,
      last_assignment_date: new Date().toISOString()
    });
  };

  const positions = ['Kiểm sát viên', 'Kiểm tra viên', 'Chuyên viên'];
  const specializations = ['Hình sự', 'Dân sự', 'Hành chính', 'Kinh tế', 'Tham nhũng', 'Môi trường'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Cán Bộ</h1>
        <button 
          onClick={() => handleOpenModal('add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm Kiểm Sát Viên
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên kiểm sát viên..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Bộ Lọc
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức vụ
                </label>
                <select
                  className="input-field"
                  value={filters.position || ''}
                  onChange={(e) => setFilters({...filters, position: e.target.value || undefined})}
                >
                  <option value="">Tất cả</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên môn
                </label>
                <select
                  className="input-field"
                  value={filters.specialization || ''}
                  onChange={(e) => setFilters({...filters, specialization: e.target.value || undefined})}
                >
                  <option value="">Tất cả</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kinh nghiệm tối thiểu (năm)
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="0"
                  value={filters.experience_min || ''}
                  onChange={(e) => setFilters({...filters, experience_min: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tải công việc tối đa
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="0"
                  value={filters.workload_max || ''}
                  onChange={(e) => setFilters({...filters, workload_max: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilters({})}
                className="btn-secondary text-sm"
              >
                Xóa Bộ Lọc
              </button>
              <span className="text-sm text-gray-500 px-2 py-2">
                Tìm thấy {filteredProsecutors.length} / {prosecutors.length} kiểm sát viên
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Prosecutors List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Chức vụ</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Kinh nghiệm</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Chuyên môn</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Vụ án</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Bị can</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProsecutors.map((prosecutor) => (
                <tr key={prosecutor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold">
                          {prosecutor.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{prosecutor.name}</div>
                        {prosecutor.last_assignment_date && (
                          <div className="text-sm text-gray-500">
                            Lần cuối: {new Date(prosecutor.last_assignment_date).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{prosecutor.position}</td>
                  <td className="py-3 px-4 text-center">{prosecutor.experience_years} năm</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {prosecutor.specialization_tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {prosecutor.specialization_tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{prosecutor.specialization_tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${prosecutor.current_cases > 15 ? 'text-red-600' : 'text-gray-900'}`}>
                      {prosecutor.current_cases}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${prosecutor.current_defendants > 40 ? 'text-red-600' : 'text-gray-900'}`}>
                      {prosecutor.current_defendants}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal('view', prosecutor)}
                        className="p-1 text-gray-600 hover:text-primary-600"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal('edit', prosecutor)}
                        className="p-1 text-gray-600 hover:text-yellow-600"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(prosecutor.id)}
                        className="p-1 text-gray-600 hover:text-red-600"
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

          {filteredProsecutors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy kiểm sát viên nào
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {modalType === 'add' ? 'Thêm Kiểm Sát Viên' : 
                 modalType === 'edit' ? 'Chỉnh Sửa Thông Tin' : 
                 'Thông Tin Chi Tiết'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {modalType !== 'view' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và Tên *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chức vụ *
                    </label>
                    <select
                      className="input-field"
                      value={formData.position || 'Kiểm sát viên'}
                      onChange={(e) => setFormData({...formData, position: e.target.value as Prosecutor['position']})}
                    >
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số năm kinh nghiệm *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      value={formData.experience_years || 0}
                      onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chuyên môn (nhấn Enter để thêm)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.specialization_tags || []).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = [...(formData.specialization_tags || [])];
                              newTags.splice(index, 1);
                              setFormData({...formData, specialization_tags: newTags});
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Nhập chuyên môn và nhấn Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value && !(formData.specialization_tags || []).includes(value)) {
                            setFormData({
                              ...formData, 
                              specialization_tags: [...(formData.specialization_tags || []), value]
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số vụ án hiện tại
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={formData.current_cases || 0}
                        onChange={(e) => setFormData({...formData, current_cases: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số bị can hiện tại
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={formData.current_defendants || 0}
                        onChange={(e) => setFormData({...formData, current_defendants: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {modalType === 'add' ? 'Thêm' : 'Lưu'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {selectedProsecutor && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-xl">
                            {selectedProsecutor.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{selectedProsecutor.name}</h3>
                          <p className="text-gray-600">{selectedProsecutor.position}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="card">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Thông tin cơ bản
                          </h4>
                          <p><strong>Kinh nghiệm:</strong> {selectedProsecutor.experience_years} năm</p>
                          <p><strong>Chuyên môn:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProsecutor.specialization_tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-primary-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="card">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tải công việc
                          </h4>
                          <p><strong>Vụ án:</strong> {selectedProsecutor.current_cases}</p>
                          <p><strong>Bị can:</strong> {selectedProsecutor.current_defendants}</p>
                          <p><strong>Lần cuối nhận án:</strong> {
                            selectedProsecutor.last_assignment_date 
                              ? new Date(selectedProsecutor.last_assignment_date).toLocaleDateString('vi-VN')
                              : 'Chưa có'
                          }</p>
                        </div>
                      </div>

                      {/* Quick Update Caseload */}
                      <div className="card">
                        <h4 className="font-semibold mb-2">Cập nhật nhanh tải công việc</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Số vụ án
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              defaultValue={selectedProsecutor.current_cases}
                              id="cases-input"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Số bị can
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              defaultValue={selectedProsecutor.current_defendants}
                              id="defendants-input"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                const casesInput = document.getElementById('cases-input') as HTMLInputElement;
                                const defendantsInput = document.getElementById('defendants-input') as HTMLInputElement;
                                const cases = parseInt(casesInput.value) || 0;
                                const defendants = parseInt(defendantsInput.value) || 0;
                                handleUpdateCaseload(selectedProsecutor.id, cases, defendants);
                                setShowModal(false);
                              }}
                              className="btn-primary w-full"
                            >
                              Cập nhật
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProsecutorManagement;
