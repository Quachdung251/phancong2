import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Scale, 
  Settings, 
  LogOut,
  Menu,
  X,
  Upload,
  Download
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProsecutorManagement from './components/ProsecutorManagement';
import CaseAssignment from './components/CaseAssignment';
import type { Prosecutor, Case, AssignmentHistory } from './types';
import { localStorage, exportData, importData } from './lib/supabase';

// Mock data để demo
// Generate mock data for 50 prosecutors
const generateMockProsecutors = (): Prosecutor[] => {
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Minh', 'Hữu', 'Đình', 'Quốc', 'Thanh', 'Anh', 'Thu', 'Kim', 'Hồng', 'Xuân'];
  const lastNames = ['An', 'Bình', 'Cường', 'Dung', 'Đức', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Hùng', 'Hương', 'Khánh', 'Khoa', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Nga', 'Nhung', 'Phong', 'Phúc', 'Quang', 'Sơn', 'Thành', 'Trang', 'Tuấn', 'Tuyết', 'Vân', 'Việt'];
  const positions: ('Kiểm sát viên' | 'Kiểm tra viên' | 'Chuyên viên')[] = ['Kiểm sát viên', 'Kiểm tra viên', 'Chuyên viên'];
  const specializations = ['Hình sự', 'Dân sự', 'Hành chính', 'Kinh tế', 'Tham nhũng', 'Môi trường', 'Lao động', 'Gia đình', 'Bất động sản', 'Tài chính'];

  return Array.from({ length: 50 }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${middleName} ${lastName}`;
    
    const position = positions[Math.floor(Math.random() * positions.length)];
    const experienceYears = Math.floor(Math.random() * 20) + 1; // 1-20 years
    const numSpecializations = Math.floor(Math.random() * 3) + 1; // 1-3 specializations
    const selectedSpecializations = [...specializations]
      .sort(() => 0.5 - Math.random())
      .slice(0, numSpecializations);
    
    const currentCases = Math.floor(Math.random() * 20) + 1; // 1-20 cases
    const currentDefendants = Math.floor(Math.random() * 40) + currentCases; // at least as many as cases
    
    // Random assignment date in last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const lastAssignmentDate = new Date();
    lastAssignmentDate.setDate(lastAssignmentDate.getDate() - daysAgo);
    
    return {
      id: (index + 1).toString(),
      name,
      position,
      experience_years: experienceYears,
      specialization_tags: selectedSpecializations,
      current_cases: currentCases,
      current_defendants: currentDefendants,
      last_assignment_date: Math.random() > 0.1 ? lastAssignmentDate.toISOString() : undefined, // 90% have assignment dates
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };
  });
};

const mockProsecutors: Prosecutor[] = generateMockProsecutors();

const mockCases: Case[] = [
  {
    id: '1',
    case_number: '01/2024/VKSND-TP',
    case_name: 'Vụ án lừa đảo chiếm đoạt tài sản',
    case_type: 'Hình sự',
    law_articles: 'Điều 174 BLHS',
    defendants_count: 3,
    status: 'Chờ phân công',
    description: 'Vụ án lừa đảo qua mạng xã hội với số tiền lớn',
    created_at: '2024-01-16T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '2',
    case_number: '02/2024/VKSND-TP',
    case_name: 'Tranh chấp hợp đồng mua bán',
    case_type: 'Dân sự',
    law_articles: 'Luật Dân sự 2015',
    defendants_count: 1,
    status: 'Chờ phân công',
    description: 'Tranh chấp về việc thực hiện hợp đồng mua bán nhà đất',
    created_at: '2024-01-17T00:00:00Z',
    updated_at: '2024-01-17T00:00:00Z'
  }
];

function App() {
  const [prosecutors, setProsecutors] = useState<Prosecutor[]>(mockProsecutors);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [assignments, setAssignments] = useState<AssignmentHistory[]>([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load data from localStorage on startup
  useEffect(() => {
    const savedProsecutors = localStorage.get('prosecutors');
    const savedCases = localStorage.get('cases');
    const savedAssignments = localStorage.get('assignments');

    if (savedProsecutors) setProsecutors(savedProsecutors);
    if (savedCases) setCases(savedCases);
    if (savedAssignments) setAssignments(savedAssignments);
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.set('prosecutors', prosecutors);
  }, [prosecutors]);

  useEffect(() => {
    localStorage.set('cases', cases);
  }, [cases]);

  useEffect(() => {
    localStorage.set('assignments', assignments);
  }, [assignments]);

  const handleAddProsecutor = (prosecutorData: Omit<Prosecutor, 'id' | 'created_at' | 'updated_at'>) => {
    const newProsecutor: Prosecutor = {
      ...prosecutorData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProsecutors([...prosecutors, newProsecutor]);
  };

  const handleUpdateProsecutor = (id: string, updates: Partial<Prosecutor>) => {
    setProsecutors(prosecutors.map(p => 
      p.id === id 
        ? { ...p, ...updates, updated_at: new Date().toISOString() }
        : p
    ));
  };

  const handleDeleteProsecutor = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kiểm sát viên này?')) {
      setProsecutors(prosecutors.filter(p => p.id !== id));
    }
  };

  const handleAddCase = (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => {
    const newCase: Case = {
      ...caseData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCases([...cases, newCase]);
  };

  const handleAssignCase = (caseId: string, prosecutorId: string, notes?: string) => {
    // Update case status and assigned prosecutor
    setCases(cases.map(c => 
      c.id === caseId 
        ? { 
            ...c, 
            assigned_prosecutor_id: prosecutorId, 
            status: 'Đang giải quyết',
            assigned_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        : c
    ));

    // Update prosecutor workload
    const assignedCase = cases.find(c => c.id === caseId);
    if (assignedCase) {
      setProsecutors(prosecutors.map(p => 
        p.id === prosecutorId 
          ? { 
              ...p, 
              current_cases: p.current_cases + 1,
              current_defendants: p.current_defendants + assignedCase.defendants_count,
              last_assignment_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : p
      ));

      // Add to assignment history
      const newAssignment: AssignmentHistory = {
        id: Date.now().toString(),
        case_id: caseId,
        prosecutor_id: prosecutorId,
        assigned_at: new Date().toISOString(),
        assigned_by: 'System', // Would be current user in real app
        notes
      };
      setAssignments([...assignments, newAssignment]);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file);
      setProsecutors(data.prosecutors as Prosecutor[] || []);
      setCases(data.cases as Case[] || []);
      setAssignments(data.assignments as AssignmentHistory[] || []);
      alert('Dữ liệu đã được import thành công!');
    } catch (error) {
      alert('Lỗi khi import dữ liệu: ' + (error as Error).message);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const menuItems = [
    { id: 'dashboard', name: 'Bảng Điều Khiển', icon: BarChart3 },
    { id: 'prosecutors', name: 'Quản Lý Cán Bộ', icon: Users },
    { id: 'assignment', name: 'Phân Công Án', icon: Scale },
    { id: 'settings', name: 'Cài Đặt', icon: Settings },
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard prosecutors={prosecutors} onRefresh={() => window.location.reload()} />;
      case 'prosecutors':
        return (
          <ProsecutorManagement
            prosecutors={prosecutors}
            onAdd={handleAddProsecutor}
            onUpdate={handleUpdateProsecutor}
            onDelete={handleDeleteProsecutor}
          />
        );
      case 'assignment':
        return (
          <CaseAssignment
            prosecutors={prosecutors}
            cases={cases}
            onAssignCase={handleAssignCase}
            onAddCase={handleAddCase}
          />
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Cài Đặt</h1>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sao Lưu & Khôi Phục Dữ Liệu
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Xuất Dữ Liệu</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tải xuống tất cả dữ liệu dưới định dạng JSON để sao lưu.
                  </p>
                  <button
                    onClick={exportData}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Xuất Dữ Liệu
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Nhập Dữ Liệu</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Khôi phục dữ liệu từ file JSON đã sao lưu trước đó.
                  </p>
                  <label className="btn-secondary flex items-center gap-2 cursor-pointer inline-flex">
                    <Upload className="h-4 w-4" />
                    Chọn File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Thống Kê Hệ Thống</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Kiểm sát viên:</span>
                      <span className="ml-2 font-medium">{prosecutors.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vụ án:</span>
                      <span className="ml-2 font-medium">{cases.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lịch sử phân công:</span>
                      <span className="ml-2 font-medium">{assignments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-yellow-50 border-yellow-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Chế Độ Local
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="p-4 bg-yellow-100 rounded-lg">
                  <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Dữ liệu được lưu trữ trên trình duyệt của bạn (Local Storage)</li>
                    <li>Dữ liệu có thể bị mất khi xóa cache trình duyệt</li>
                    <li>Không thể chia sẻ dữ liệu giữa các máy tính khác nhau</li>
                    <li>Hãy thường xuyên xuất dữ liệu để sao lưu</li>
                  </ul>
                </div>
                <p><strong>Để sử dụng đồng bộ đám mây:</strong> Cấu hình Supabase trong file .env</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Về Phần Mềm
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Phần mềm Quản lý Phân công Án</strong></p>
                <p>Phiên bản: 1.0.0</p>
                <p>Dành cho: Viện Kiểm sát Nhân dân</p>
                <p>Tính năng: Quản lý cán bộ, phân công án thông minh, thống kê báo cáo</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard prosecutors={prosecutors} onRefresh={() => window.location.reload()} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">Phân Công Án</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-600 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-6">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">A</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Admin</div>
              <div className="text-xs text-gray-500">Quản trị viên</div>
            </div>
            <button className="p-1 text-gray-600 hover:text-gray-800">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 text-gray-600 hover:text-gray-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {menuItems.find(item => item.id === currentPage)?.name}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </header>

        {/* Local Mode Banner */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-800">
                <strong>Chế độ Local:</strong> Dữ liệu được lưu trữ tại máy tính của bạn. 
                Sử dụng tính năng Xuất/Nhập để sao lưu dữ liệu.
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
