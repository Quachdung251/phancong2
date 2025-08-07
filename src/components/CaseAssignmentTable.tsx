import React, { useState } from 'react';
import { Plus, Minus, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import type { Leader, Prosecutor } from '../types';

interface CaseAssignmentTableProps {
  leaders: Leader[];
  prosecutors: Prosecutor[];
  onAssignCase: (caseData: {
    case_name: string;
    law_articles: string;
    defendants_count: number;
    assigned_leader_id: string;
    case_type: 'Hình sự' | 'Dân sự' | 'Hành chính' | 'Kinh tế';
  }) => void;
}

const CaseAssignmentTable: React.FC<CaseAssignmentTableProps> = ({
  leaders,
  prosecutors,
  onAssignCase
}) => {
  const [defendantsCount, setDefendantsCount] = useState(1);
  const [caseData, setCaseData] = useState<{
    case_name: string;
    law_articles: string;
    case_type: 'Hình sự' | 'Dân sự' | 'Hành chính' | 'Kinh tế';
  }>({
    case_name: '',
    law_articles: '',
    case_type: 'Hình sự'
  });
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAssignment, setLastAssignment] = useState<string | null>(null);

  const handleDefendantsChange = (change: number) => {
    const newCount = defendantsCount + change;
    if (newCount >= 1) {
      setDefendantsCount(newCount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseData.case_name.trim() || !caseData.law_articles.trim() || !selectedLeaderId) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const assignmentData = {
        ...caseData,
        defendants_count: defendantsCount,
        assigned_leader_id: selectedLeaderId
      };
      
      await onAssignCase(assignmentData);
      
      // Reset form
      setCaseData({
        case_name: '',
        law_articles: '',
        case_type: 'Hình sự'
      });
      setDefendantsCount(1);
      setSelectedLeaderId('');
      
      // Hiển thị thông báo thành công
      const selectedLeader = leaders.find(l => l.id === selectedLeaderId);
      setLastAssignment(`Đã phân công thành công cho ${selectedLeader?.name}`);
      setTimeout(() => setLastAssignment(null), 3000);
      
    } catch (error) {
      console.error('Lỗi khi phân công:', error);
      alert('Có lỗi xảy ra khi phân công!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLeader = leaders.find(l => l.id === selectedLeaderId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Phân Công Án</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>{leaders.length} lãnh đạo • {prosecutors.length} KSV</span>
        </div>
      </div>

      {/* Thông báo thành công */}
      {lastAssignment && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">{lastAssignment}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông Tin Phân Công</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PHẦN 1: Tăng/Giảm Án */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              1. Số Lượng Bị Cáo
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-6">
                <button
                  type="button"
                  onClick={() => handleDefendantsChange(-1)}
                  disabled={defendantsCount <= 1}
                  className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="h-6 w-6 text-red-600" />
                </button>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{defendantsCount}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {defendantsCount === 1 ? 'bị cáo' : 'bị cáo'}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleDefendantsChange(1)}
                  className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="h-6 w-6 text-green-600" />
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Tối thiểu: 1 bị cáo
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 2: Tên Vụ Án & Điều Luật */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              2. Thông Tin Vụ Án
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên vụ án *
                </label>
                <textarea
                  className="input-field text-lg resize-none"
                  rows={3}
                  placeholder="Nhập tên vụ án..."
                  value={caseData.case_name}
                  onChange={(e) => setCaseData({ ...caseData, case_name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều luật áp dụng *
                </label>
                <input
                  type="text"
                  className="input-field text-lg"
                  placeholder="VD: Điều 174 BLHS, Luật Dân sự 2015..."
                  value={caseData.law_articles}
                  onChange={(e) => setCaseData({ ...caseData, law_articles: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại vụ án
                </label>
                <select
                  className="input-field text-lg"
                  value={caseData.case_type}
                  onChange={(e) => setCaseData({ ...caseData, case_type: e.target.value as typeof caseData.case_type })}
                >
                  <option value="Hình sự">Hình sự</option>
                  <option value="Dân sự">Dân sự</option>
                  <option value="Hành chính">Hành chính</option>
                  <option value="Kinh tế">Kinh tế</option>
                </select>
              </div>
            </div>
          </div>

          {/* PHẦN 3: Chọn Lãnh Đạo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              3. Chọn Lãnh Đạo Viện
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lãnh đạo phụ trách *
                </label>
                <select
                  className="input-field text-lg"
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn lãnh đạo --</option>
                  {leaders
                    .sort((a, b) => a.cases_this_year - b.cases_this_year) // Sắp xếp theo số án ít nhất
                    .map(leader => (
                      <option key={leader.id} value={leader.id}>
                        {leader.name} ({leader.cases_this_year} vụ)
                      </option>
                    ))}
                </select>
              </div>
              
              {/* Thông tin lãnh đạo được chọn */}
              {selectedLeader && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Thông Tin Lãnh Đạo</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Tên:</span>
                      <span className="font-medium text-blue-900">{selectedLeader.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Số vụ từ đầu năm:</span>
                      <span className="font-bold text-blue-900">{selectedLeader.cases_this_year} vụ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Sau khi phân công:</span>
                      <span className="font-bold text-green-600">{selectedLeader.cases_this_year + 1} vụ</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Thống kê tổng quan lãnh đạo */}
              {leaders.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Tổng Quan Lãnh Đạo</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {leaders
                      .sort((a, b) => a.cases_this_year - b.cases_this_year)
                      .map(leader => (
                        <div key={leader.id} className="flex justify-between items-center py-1">
                          <span className="text-gray-700 text-sm">{leader.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${leaders.length > 0 ? (leader.cases_this_year / Math.max(...leaders.map(l => l.cases_this_year), 1)) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                              {leader.cases_this_year}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút submit */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>Vui lòng kiểm tra kỹ thông tin trước khi phân công</span>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !caseData.case_name.trim() || !caseData.law_articles.trim() || !selectedLeaderId}
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang phân công...
                </>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  Phân Công Án
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CaseAssignmentTable;
