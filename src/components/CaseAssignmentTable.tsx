import React, { useState } from 'react';
import { FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [increaseCases, setIncreaseCases] = useState(1);
  const [decreaseCases, setDecreaseCases] = useState(0);
  const [increaseDefendants, setIncreaseDefendants] = useState(0);
  const [decreaseDefendants, setDecreaseDefendants] = useState(0);
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


  const handleCasesChange = (action: 'increase' | 'decrease', type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      if (action === 'increase') {
        setIncreaseCases(prev => prev + 1);
      } else {
        setIncreaseCases(prev => Math.max(1, prev - 1));
      }
    } else {
      if (action === 'increase') {
        setDecreaseCases(prev => prev + 1);
      } else {
        setDecreaseCases(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Tính tổng số vụ và bị cáo
  const totalCases = increaseCases + decreaseCases;
  const totalDefendants = increaseDefendants + decreaseDefendants;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLeaderId) {
      alert('Vui lòng chọn lãnh đạo phụ trách!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const assignmentData = {
        case_name: caseData.case_name.trim() || `Vụ án ${totalCases} vụ, ${totalDefendants} bị cáo`,
        law_articles: caseData.law_articles.trim() || 'Chưa xác định',
        case_type: caseData.case_type,
        defendants_count: totalDefendants,
        assigned_leader_id: selectedLeaderId
      };
      
      await onAssignCase(assignmentData);
      
      // Reset form
      setCaseData({
        case_name: '',
        law_articles: '',
        case_type: 'Hình sự'
      });
      setIncreaseDefendants(0);
      setDecreaseDefendants(0);
      setIncreaseCases(1);
      setDecreaseCases(0);
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
          
          {/* Cột 1: Quản lý số vụ/bị cáo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Quản lý số vụ/bị cáo
            </h3>
            
            {/* Dòng 1: Tăng số vụ/bị cáo */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">Tăng số vụ/bị cáo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Số vụ án
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCasesChange('increase', 'increase')}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      +
                    </button>
                    <span className="bg-white px-3 py-2 border border-green-300 rounded-lg min-w-[60px] text-center">
                      {increaseCases}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCasesChange('decrease', 'increase')}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                      disabled={increaseCases <= 1}
                    >
                      -
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Số bị cáo
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={increaseDefendants}
                      onChange={(e) => setIncreaseDefendants(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-white px-3 py-2 border border-green-300 rounded-lg min-w-[60px] text-center focus:border-green-500 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIncreaseDefendants(prev => prev + 1)}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dòng 2: Giảm số vụ/bị cáo */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-3">Giảm số vụ/bị cáo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Số vụ án
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCasesChange('decrease', 'decrease')}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                      disabled={decreaseCases <= 0}
                    >
                      -
                    </button>
                    <span className="bg-white px-3 py-2 border border-red-300 rounded-lg min-w-[60px] text-center">
                      {decreaseCases}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCasesChange('increase', 'decrease')}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Số bị cáo
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={decreaseDefendants}
                      onChange={(e) => setDecreaseDefendants(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-white px-3 py-2 border border-red-300 rounded-lg min-w-[60px] text-center focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setDecreaseDefendants(prev => prev + 1)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiển thị tổng */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Tổng kết</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{totalCases}</div>
                  <div className="text-blue-700">Tổng vụ án</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{totalDefendants}</div>
                  <div className="text-blue-700">Tổng bị cáo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 2: Thông tin vụ án (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Thông tin vụ án <span className="text-sm text-gray-500 font-normal">(Tùy chọn)</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên vụ án
                </label>
                <textarea
                  className="input-field text-lg resize-none"
                  rows={3}
                  placeholder="Nhập tên vụ án (tùy chọn)..."
                  value={caseData.case_name}
                  onChange={(e) => setCaseData({ ...caseData, case_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều luật áp dụng
                </label>
                <input
                  type="text"
                  className="input-field text-lg"
                  placeholder="VD: Điều 174 BLHS, Luật Dân sự 2015... (tùy chọn)"
                  value={caseData.law_articles}
                  onChange={(e) => setCaseData({ ...caseData, law_articles: e.target.value })}
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

          {/* Cột 3: Lãnh đạo viện */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Chọn lãnh đạo viện
            </h3>
            
            <div className="space-y-4">
              {/* Danh sách lãnh đạo - có thể click để chọn */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Danh sách lãnh đạo ({leaders.length}) - Click để chọn
                </h4>
                <div className="space-y-2">
                  {leaders
                    .sort((a, b) => a.cases_this_year - b.cases_this_year)
                    .map(leader => (
                      <div 
                        key={leader.id} 
                        className={`flex justify-between items-center py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedLeaderId === leader.id 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                            : 'bg-white hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                        }`}
                        onClick={() => setSelectedLeaderId(leader.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedLeaderId === leader.id ? 'bg-white' : 'bg-blue-400'
                          }`}></div>
                          <span className={`font-medium ${
                            selectedLeaderId === leader.id ? 'text-white' : 'text-gray-700'
                          }`}>
                            {leader.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                            selectedLeaderId === leader.id 
                              ? 'bg-white text-blue-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {leader.cases_this_year} vụ
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                selectedLeaderId === leader.id 
                                  ? 'bg-white' 
                                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(100, (leader.cases_this_year / Math.max(...leaders.map(l => l.cases_this_year), 1)) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Hiển thị thông tin ngắn gọn về lãnh đạo được chọn */}
              {selectedLeader && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <span className="font-semibold text-emerald-800">
                        Đã chọn: {selectedLeader.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-emerald-600">
                        {selectedLeader.cases_this_year} → <span className="font-bold text-emerald-700">{selectedLeader.cases_this_year + totalCases}</span> vụ
                      </div>
                    </div>
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
              disabled={isSubmitting || !selectedLeaderId}
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
