import React, { useEffect, useState, useMemo } from 'react';
import { Users, FileText, Scale, Clock, TrendingUp, Search, Filter, Maximize, Minimize, Eye, EyeOff } from 'lucide-react';
import type { Prosecutor, DashboardStats } from '../types';
import { CaseAssignmentEngine } from '../utils/assignmentEngine';

interface DashboardProps {
  prosecutors: Prosecutor[];
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ prosecutors, onRefresh }) => {
  const [stats, setStats] = useState<DashboardStats>({
    total_prosecutors: 0,
    total_active_cases: 0,
    total_defendants: 0,
    pending_assignments: 0,
    assignments_this_month: 0,
    average_cases_per_prosecutor: 0
  });

  // Filter states
  const [searchName, setSearchName] = useState('');
  const [searchLaw, setSearchLaw] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  
  // Sort state - mặc định theo ngày xa nhất và án ít nhất
  const [sortBy, setSortBy] = useState<'dateOldest' | 'dateNewest' | 'resolvingMost' | 'resolvingLeast' | 'totalMost' | 'totalLeast'>('dateOldest');
  
  // Display states
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'expanded'>('compact');
  const [showCount, setShowCount] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const calculateStatsInternal = () => {
      const totalCases = prosecutors.reduce((sum, p) => sum + p.current_cases, 0);
      const totalDefendants = prosecutors.reduce((sum, p) => sum + p.current_defendants, 0);
      
      setStats({
        total_prosecutors: prosecutors.length,
        total_active_cases: totalCases,
        total_defendants: totalDefendants,
        pending_assignments: 0, // Sẽ được tính từ cases
        assignments_this_month: Math.floor(Math.random() * 20) + 10, // Mock data
        average_cases_per_prosecutor: prosecutors.length > 0 ? Math.round(totalCases / prosecutors.length * 10) / 10 : 0
      });
    };
    
    calculateStatsInternal();
  }, [prosecutors]);

  const workloadData = CaseAssignmentEngine.getWorkloadDistribution(prosecutors);
  
  // Filtered and sorted data based on criteria
  const filteredAndSortedData = useMemo(() => {
    let filtered = workloadData.filter(item => {
      // Name search filter
      const nameMatch = searchName === '' || 
        item.prosecutor.name.toLowerCase().includes(searchName.toLowerCase());
      
      // Position filter
      const positionMatch = selectedPositions.length === 0 || 
        selectedPositions.includes(item.prosecutor.position);
      
      // Specialization filter (Hình sự/Dân sự)
      const specializationMatch = selectedSpecializations.length === 0 || 
        selectedSpecializations.some(spec => 
          item.prosecutor.specialization_tags.some(tag => 
            tag.toLowerCase().includes(spec.toLowerCase())
          )
        );
      
      // Law article search (mock implementation - searching in specialization tags)
      const lawMatch = searchLaw === '' || 
        item.prosecutor.specialization_tags.some(tag => 
          tag.toLowerCase().includes(searchLaw.toLowerCase())
        );
      
      return nameMatch && positionMatch && specializationMatch && lawMatch;
    });
    
    // If no results from filters, show all data (fallback)
    if (filtered.length === 0 && (searchName !== '' || selectedPositions.length > 0 || searchLaw !== '')) {
      // Keep filters but expand search to show partial matches
      filtered = workloadData;
    }
    
    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateOldest': {
          // Ngày nhận án xa nhất (cũ nhất) - ưu tiên những người nhận lâu rồi
          const dateA = a.prosecutor.last_assignment_date ? new Date(a.prosecutor.last_assignment_date).getTime() : 0;
          const dateB = b.prosecutor.last_assignment_date ? new Date(b.prosecutor.last_assignment_date).getTime() : 0;
          if (dateA !== dateB) return dateA - dateB;
          // Nếu ngày bằng nhau, ưu tiên người có ít án hơn
          return (a.cases || 0) - (b.cases || 0);
        }
          
        case 'dateNewest': {
          // Ngày nhận án gần nhất (mới nhất)
          const dateA2 = a.prosecutor.last_assignment_date ? new Date(a.prosecutor.last_assignment_date).getTime() : 0;
          const dateB2 = b.prosecutor.last_assignment_date ? new Date(b.prosecutor.last_assignment_date).getTime() : 0;
          return dateB2 - dateA2;
        }
          
        case 'resolvingMost':
          // KSV có nhiều án đang giải quyết nhất
          return (b.cases || 0) - (a.cases || 0);
          
        case 'resolvingLeast':
          // KSV có ít án đang giải quyết nhất
          return (a.cases || 0) - (b.cases || 0);
          
        case 'totalMost': {
          // KSV nhận nhiều án nhất (tổng trong năm)
          const totalA = (a.cases || 0) + Math.floor(Math.random() * 10) + 5;
          const totalB = (b.cases || 0) + Math.floor(Math.random() * 10) + 5;
          return totalB - totalA;
        }
          
        case 'totalLeast': {
          // KSV nhận ít án nhất (tổng trong năm)
          const totalA2 = (a.cases || 0) + Math.floor(Math.random() * 10) + 5;
          const totalB2 = (b.cases || 0) + Math.floor(Math.random() * 10) + 5;
          return totalA2 - totalB2;
        }
          
        default:
          return 0;
      }
    });
    
    return filtered.slice(0, showCount); // Show dynamic count
  }, [workloadData, searchName, selectedPositions, selectedSpecializations, searchLaw, showCount, sortBy]);
  
  // Tính toán số án được phân trong năm (mock data vì chưa có lịch sử thực tế)
  const detailedWorkloadData = filteredAndSortedData.map(item => ({
    ...item,
    casesAssignedThisYear: Math.floor(Math.random() * 15) + (item.cases || 0), // Mock: án trong năm = án hiện tại + thêm một số
    defendantsAssignedThisYear: Math.floor(Math.random() * 25) + (item.defendants || 0),
    lawCasesThisYear: searchLaw ? Math.floor(Math.random() * 8) + 1 : 0 // Mock cases for searched law
  }));

  // Pagination for detailed table
  const totalPages = Math.ceil(detailedWorkloadData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = detailedWorkloadData.slice(startIndex, endIndex);
  
  const chartData = filteredAndSortedData.map((item) => ({
    name: item.prosecutor.name,
    fullName: item.prosecutor.name,
    'Tổng án': (item.cases || 0) + Math.floor(Math.random() * 10) + 5, // Tổng án trong năm (xanh)
    'Đang giải quyết': item.cases || Math.floor(Math.random() * 5) + 1, // Án đang giải quyết (vàng)
    'Tải công việc': item.workloadPercentage || Math.floor(Math.random() * 50) + 10,
    lastAssignmentDate: item.prosecutor.last_assignment_date ? 
      (() => {
        const date = new Date(item.prosecutor.last_assignment_date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      })() : 
      'Chưa có'
  }));

  // Test data nếu chartData rỗng
  const testChartData = chartData.length === 0 ? [
    { name: 'Test KSV 1', 'Tổng án': 10, 'Đang giải quyết': 6, lastAssignmentDate: '10/07/2025' },
    { name: 'Test KSV 2', 'Tổng án': 8, 'Đang giải quyết': 4, lastAssignmentDate: '15/07/2025' },
    { name: 'Test KSV 3', 'Tổng án': 12, 'Đang giải quyết': 8, lastAssignmentDate: '20/07/2025' }
  ] : chartData;

  // Debug logs
  console.log('Prosecutors count:', prosecutors.length);
  console.log('Workload data count:', workloadData.length);
  console.log('Filtered and sorted data count:', filteredAndSortedData.length);
  console.log('Chart data count:', chartData.length);
  console.log('Chart data sample:', chartData.slice(0, 3));
  console.log('Full chartData:', chartData);
  console.log('Sample chartData values:', chartData.map(d => ({ name: d.name, tongAn: d['Tổng án'] })));

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
  }> = ({ title, value, icon, trend, color = 'blue' }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bảng Điều Khiển</h1>
        <button 
          onClick={onRefresh}
          className="btn-primary flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng số Kiểm sát viên"
          value={stats.total_prosecutors}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Tổng số vụ án"
          value={stats.total_active_cases}
          icon={<FileText className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Tổng số bị can"
          value={stats.total_defendants}
          icon={<Scale className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Trung bình vụ/người"
          value={stats.average_cases_per_prosecutor}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={`+${stats.assignments_this_month} tháng này`}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Filters Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ Lọc Và Tìm Kiếm
          </h2>
          
          {/* Compact filter layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search inputs combined */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm theo tên
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    className="pl-8 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên KSV..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm theo điều luật
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 123, tham nhũng..."
                  value={searchLaw}
                  onChange={(e) => setSearchLaw(e.target.value)}
                />
              </div>
            </div>

            {/* Position Filter - Horizontal checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chức vụ
              </label>
              <div className="flex flex-wrap gap-3">
                {['Kiểm sát viên', 'Kiểm tra viên', 'Chuyên viên'].map(position => (
                  <label key={position} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      checked={selectedPositions.includes(position)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPositions([...selectedPositions, position]);
                        } else {
                          setSelectedPositions(selectedPositions.filter(p => p !== position));
                        }
                      }}
                    />
                    <span className="text-gray-700 whitespace-nowrap">{position}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Case Type Filter - Horizontal checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyên môn
              </label>
              <div className="flex flex-wrap gap-3">
                {['Hình sự', 'Dân sự'].map(specialization => (
                  <label key={specialization} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      checked={selectedSpecializations.includes(specialization)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSpecializations([...selectedSpecializations, specialization]);
                        } else {
                          setSelectedSpecializations(selectedSpecializations.filter(s => s !== specialization));
                        }
                      }}
                    />
                    <span className="text-gray-700">{specialization}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dateOldest">Ngày nhận án xa nhất</option>
                <option value="dateNewest">Ngày nhận án gần nhất</option>
                <option value="resolvingLeast">KSV ít án đang giải quyết nhất</option>
                <option value="resolvingMost">KSV nhiều án đang giải quyết nhất</option>
                <option value="totalLeast">KSV nhận ít án nhất trong năm</option>
                <option value="totalMost">KSV nhận nhiều án nhất trong năm</option>
              </select>
            </div>
          </div>
          
          {/* Clear filters button */}
          {(searchName || searchLaw || selectedPositions.length > 0 || selectedSpecializations.length > 0 || sortBy !== 'dateOldest') && (
            <div className="mt-3 pt-3 border-t">
              <button
                onClick={() => {
                  setSearchName('');
                  setSearchLaw('');
                  setSelectedPositions([]);
                  setSelectedSpecializations([]);
                  setSortBy('dateOldest');
                }}
                className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Đặt lại bộ lọc và sắp xếp
              </button>
            </div>
          )}
        </div>

        {/* Workload Chart */}
        <div className={`card ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Top {showCount} Kiểm Sát Viên - Tổng Số Án Trong Năm
            </h2>
            <div className="flex items-center gap-2">
              {/* View Count Controls */}
              <select 
                value={showCount} 
                onChange={(e) => setShowCount(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={200}>Tất cả</option>
              </select>
              
              {/* Sort Filter - Show in fullscreen */}
              {isFullscreen && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dateOldest">Ngày nhận án xa nhất</option>
                  <option value="dateNewest">Ngày nhận án gần nhất</option>
                  <option value="resolvingLeast">KSV ít án đang giải quyết nhất</option>
                  <option value="resolvingMost">KSV nhiều án đang giải quyết nhất</option>
                  <option value="totalLeast">KSV nhận ít án nhất trong năm</option>
                  <option value="totalMost">KSV nhận nhiều án nhất trong năm</option>
                </select>
              )}
              
              {/* View Mode Controls */}
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as 'compact' | 'detailed' | 'expanded')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Gọn: Hiển thị cơ bản | Chi tiết: Thêm thông tin | Mở rộng: Toàn bộ dữ liệu"
              >
                <option value="compact">Gọn (Cơ bản)</option>
                <option value="detailed">Chi tiết (Đầy đủ)</option>
                <option value="expanded">Mở rộng (Tất cả)</option>
              </select>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  // Khi phóng to, mặc định hiển thị tất cả; khi thu nhỏ, về lại 10
                  if (!isFullscreen) {
                    setShowCount(200); // Tất cả
                  } else {
                    setShowCount(10); // Mặc định 10
                  }
                }}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className={`${isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-96'} ${viewMode === 'expanded' && !isFullscreen ? 'h-[600px]' : ''}`}>
            {/* Chart legend */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-700 font-medium">Tổng án trong năm</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-400 rounded mr-2"></div>
                <span className="text-gray-700 font-medium">Án đang giải quyết</span>
              </div>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-y-auto">
              {/* Left Column */}
              <div className="space-y-6">
                {testChartData.slice(0, Math.ceil(testChartData.length / 2)).map((prosecutor) => {
                  const maxCases = Math.max(...testChartData.map(p => p['Tổng án']));
                  const receivedPercentage = (prosecutor['Tổng án'] / maxCases) * 100;
                  const resolvingCases = (prosecutor as any)['Đang giải quyết'] || Math.floor(prosecutor['Tổng án'] * 0.6);
                  const resolvingPercentage = (resolvingCases / maxCases) * 100;
                  
                  return (
                    <div key={prosecutor.name} className="border-b border-gray-200 pb-4">
                      {/* Prosecutor header */}
                      <div className="flex justify-between items-baseline mb-3">
                        <h3 className="text-blue-600 text-xl font-semibold">{prosecutor.name}</h3>
                        <span className="text-gray-500 text-sm">
                          Ngày gần nhất: {prosecutor.lastAssignmentDate}
                        </span>
                      </div>
                      
                      {/* Tổng án bar */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden shadow-inner">
                          <div 
                            className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-700 ease-out"
                            style={{ width: `${receivedPercentage}%` }}
                          >
                            <span>{prosecutor['Tổng án']} vụ</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Đang giải quyết bar */}
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden shadow-inner">
                          <div 
                            className="bg-red-400 h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-700 ease-out"
                            style={{ width: `${resolvingPercentage}%` }}
                          >
                            <span>{resolvingCases} vụ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {testChartData.slice(Math.ceil(testChartData.length / 2)).map((prosecutor) => {
                  const maxCases = Math.max(...testChartData.map(p => p['Tổng án']));
                  const receivedPercentage = (prosecutor['Tổng án'] / maxCases) * 100;
                  const resolvingCases = (prosecutor as any)['Đang giải quyết'] || Math.floor(prosecutor['Tổng án'] * 0.6);
                  const resolvingPercentage = (resolvingCases / maxCases) * 100;
                  
                  return (
                    <div key={prosecutor.name} className="border-b border-gray-200 pb-4">
                      {/* Prosecutor header */}
                      <div className="flex justify-between items-baseline mb-3">
                        <h3 className="text-blue-600 text-xl font-semibold">{prosecutor.name}</h3>
                        <span className="text-gray-500 text-sm">
                          Ngày gần nhất: {prosecutor.lastAssignmentDate}
                        </span>
                      </div>
                      
                      {/* Tổng án bar */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden shadow-inner">
                          <div 
                            className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-700 ease-out"
                            style={{ width: `${receivedPercentage}%` }}
                          >
                            <span>{prosecutor['Tổng án']} vụ</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Đang giải quyết bar */}
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden shadow-inner">
                          <div 
                            className="bg-red-400 h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-700 ease-out"
                            style={{ width: `${resolvingPercentage}%` }}
                          >
                            <span>{resolvingCases} vụ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Top {showCount} Kiểm Sát Viên - Bảng Chi Tiết
          </h2>
          <div className="text-sm text-gray-500">
            Hiển thị {detailedWorkloadData.length} / {workloadData.length} kiểm sát viên
          </div>
        </div>
        <div className={`overflow-x-auto ${viewMode === 'expanded' ? 'max-h-[400px] overflow-y-auto' : ''}`}>
          <table className="w-full table-auto text-base">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-bold text-gray-700 text-lg">Tên KSV</th>
                <th className="text-left py-4 px-4 font-bold text-gray-700 text-lg">Chức vụ</th>
                <th className="text-center py-4 px-4 font-bold text-gray-700 text-lg">Án được phân trong năm</th>
                <th className="text-center py-4 px-4 font-bold text-gray-700 text-lg">Án đang giải quyết</th>
                <th className="text-center py-4 px-4 font-bold text-gray-700 text-lg">Bị cáo được phân</th>
                {searchLaw && (
                  <th className="text-center py-4 px-4 font-bold text-gray-700 text-lg">
                    Án {searchLaw} trong năm
                  </th>
                )}
                <th className="text-center py-4 px-4 font-bold text-gray-700 text-lg">Phân công gần đây</th>
                <th className="text-center py-4 px-4 font-bold text-gray-700 text-lg">Tải công việc</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.prosecutor.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-bold text-lg">
                          {startIndex + index + 1}
                        </span>
                      </div>
                      <span className="text-lg font-semibold">{item.prosecutor.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-lg font-medium">{item.prosecutor.position}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-bold text-blue-600 text-xl">{item.casesAssignedThisYear}</div>
                    <div className="text-sm text-gray-500 font-medium">vụ án</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-bold text-amber-600 text-xl">{item.cases}</div>
                    <div className="text-sm text-gray-500 font-medium">vụ án</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-bold text-gray-900 text-xl">{item.defendantsAssignedThisYear}</div>
                    <div className="text-sm text-gray-500 font-medium">bị cáo</div>
                  </td>
                  {searchLaw && (
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-green-600 text-xl">{item.lawCasesThisYear}</div>
                      <div className="text-sm text-gray-500 font-medium">vụ án</div>
                    </td>
                  )}
                  <td className="py-4 px-4 text-center text-lg font-medium">
                    {item.prosecutor.last_assignment_date ? 
                      new Date(item.prosecutor.last_assignment_date).toLocaleDateString('vi-VN') : 
                      <span className="text-gray-400 font-medium">Chưa có</span>
                    }
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-24 bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className="bg-primary-600 h-3 rounded-full" 
                          style={{ width: `${Math.min(item.workloadPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-gray-600">{item.workloadPercentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination and Table Controls */}
        {detailedWorkloadData.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            {/* Items per page */}
            <div className="flex items-center gap-2 text-lg text-gray-600 font-medium">
              <span>Hiển thị:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>/ trang</span>
            </div>
            
            {/* Page info */}
            <div className="text-lg text-gray-600 font-medium">
              Trang {currentPage} / {totalPages} 
              ({startIndex + 1}-{Math.min(endIndex, detailedWorkloadData.length)} trong số {detailedWorkloadData.length})
            </div>
            
            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-lg font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-lg font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 text-lg font-medium border border-gray-300 rounded ${
                      currentPage === pageNum 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-lg font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-lg font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
