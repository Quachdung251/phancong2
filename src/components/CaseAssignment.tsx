import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Zap, 
  User,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import type { Prosecutor, Case, CaseAssignmentSuggestion } from '../types';
import { CaseAssignmentEngine } from '../utils/assignmentEngine';

interface CaseAssignmentProps {
  prosecutors: Prosecutor[];
  cases: Case[];
  onAssignCase: (caseId: string, prosecutorId: string, notes?: string) => void;
  onAddCase: (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => void;
}

const CaseAssignment: React.FC<CaseAssignmentProps> = ({ 
  prosecutors, 
  cases, 
  onAssignCase, 
  onAddCase 
}) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [suggestions, setSuggestions] = useState<CaseAssignmentSuggestion[]>([]);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [newCaseData, setNewCaseData] = useState<Partial<Case>>({
    case_number: '',
    case_name: '',
    case_type: 'Hình sự',
    law_articles: '',
    defendants_count: 1,
    status: 'Chờ phân công',
    description: ''
  });

  // Lấy danh sách vụ án chờ phân công
  const pendingCases = cases.filter(c => c.status === 'Chờ phân công');

  const handleCaseSelect = (caseItem: Case) => {
    setSelectedCase(caseItem);
    const suggestions = CaseAssignmentEngine.suggestAssignments(prosecutors, caseItem, {
      count: 5,
      excludeOverloaded: true
    });
    setSuggestions(suggestions);
  };

  const handleAssign = (prosecutorId: string) => {
    if (!selectedCase) return;
    
    onAssignCase(selectedCase.id, prosecutorId, assignmentNotes);
    setSelectedCase(null);
    setSuggestions([]);
    setAssignmentNotes('');
  };

  const handleAddCase = () => {
    if (!newCaseData.case_number || !newCaseData.case_name) return;
    
    onAddCase({
      ...newCaseData,
      defendants_count: newCaseData.defendants_count || 1,
      status: 'Chờ phân công'
    } as Omit<Case, 'id' | 'created_at' | 'updated_at'>);
    
    setShowNewCaseModal(false);
    setNewCaseData({
      case_number: '',
      case_name: '',
      case_type: 'Hình sự',
      law_articles: '',
      defendants_count: 1,
      status: 'Chờ phân công',
      description: ''
    });
  };

  const caseTypes = ['Hình sự', 'Dân sự', 'Hành chính', 'Kinh tế'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Phân Công Án</h1>
        <button 
          onClick={() => setShowNewCaseModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm Vụ Án
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danh sách vụ án chờ phân công */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vụ Án Chờ Phân Công ({pendingCases.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCase?.id === caseItem.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCaseSelect(caseItem)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{caseItem.case_number}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        caseItem.case_type === 'Hình sự' ? 'bg-red-100 text-red-800' :
                        caseItem.case_type === 'Dân sự' ? 'bg-primary-100 text-blue-800' :
                        caseItem.case_type === 'Hành chính' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {caseItem.case_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{caseItem.case_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {caseItem.defendants_count} bị can
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(caseItem.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  {selectedCase?.id === caseItem.id && (
                    <CheckCircle className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </div>
            ))}

            {pendingCases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>Không có vụ án nào chờ phân công</p>
              </div>
            )}
          </div>
        </div>

        {/* Gợi ý phân công */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Gợi Ý Phân Công
          </h2>

          {selectedCase ? (
            <div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{selectedCase.case_number}</h3>
                <p className="text-sm text-gray-600">{selectedCase.case_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    selectedCase.case_type === 'Hình sự' ? 'bg-red-100 text-red-800' :
                    selectedCase.case_type === 'Dân sự' ? 'bg-primary-100 text-blue-800' :
                    selectedCase.case_type === 'Hành chính' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedCase.case_type}
                  </span>
                  <span className="text-gray-600">{selectedCase.defendants_count} bị can</span>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.prosecutor.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                          <span className="text-primary-600 font-semibold text-sm">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {suggestion.prosecutor.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {suggestion.prosecutor.position}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {Math.round(suggestion.score * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">độ phù hợp</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>{suggestion.prosecutor.current_cases} vụ</span>
                      <span>{suggestion.prosecutor.current_defendants} bị can</span>
                      <span>{suggestion.prosecutor.experience_years} năm KN</span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {suggestion.reasons.map((reason, reasonIndex) => (
                        <div key={reasonIndex} className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {reason}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAssign(suggestion.prosecutor.id)}
                      className="w-full btn-primary text-sm py-2"
                    >
                      Phân Công
                    </button>
                  </div>
                ))}
              </div>

              {suggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>Không có kiểm sát viên phù hợp</p>
                  <p className="text-sm">Tất cả kiểm sát viên đang quá tải</p>
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú phân công (tùy chọn)
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Ghi chú về lý do phân công..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p>Chọn một vụ án để xem gợi ý phân công</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm vụ án */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Thêm Vụ Án Mới</h2>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số vụ án *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={newCaseData.case_number || ''}
                    onChange={(e) => setNewCaseData({...newCaseData, case_number: e.target.value})}
                    placeholder="VD: 01/2024/VKSND-TP"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại vụ án *
                  </label>
                  <select
                    className="input-field"
                    value={newCaseData.case_type || 'Hình sự'}
                    onChange={(e) => setNewCaseData({...newCaseData, case_type: e.target.value as Case['case_type']})}
                  >
                    {caseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên vụ án *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={newCaseData.case_name || ''}
                  onChange={(e) => setNewCaseData({...newCaseData, case_name: e.target.value})}
                  placeholder="Mô tả ngắn gọn về vụ án"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điều luật áp dụng
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={newCaseData.law_articles || ''}
                    onChange={(e) => setNewCaseData({...newCaseData, law_articles: e.target.value})}
                    placeholder="VD: Điều 123 BLHS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số bị can *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={newCaseData.defendants_count || 1}
                    onChange={(e) => setNewCaseData({...newCaseData, defendants_count: parseInt(e.target.value) || 1})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={newCaseData.description || ''}
                  onChange={(e) => setNewCaseData({...newCaseData, description: e.target.value})}
                  placeholder="Mô tả chi tiết về vụ án, đặc điểm, yêu cầu đặc biệt..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowNewCaseModal(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddCase}
                  className="btn-primary flex items-center gap-2"
                  disabled={!newCaseData.case_number || !newCaseData.case_name}
                >
                  <Plus className="h-4 w-4" />
                  Thêm Vụ Án
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseAssignment;
