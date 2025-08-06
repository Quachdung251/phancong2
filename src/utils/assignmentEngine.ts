import type { Prosecutor, Case, CaseAssignmentSuggestion } from '../types';

export class CaseAssignmentEngine {
  private static calculateWorkloadScore(prosecutor: Prosecutor): number {
    // Điểm dựa trên tải công việc hiện tại (càng ít việc càng cao điểm)
    const maxCases = 20;
    const maxDefendants = 50;
    
    const caseScore = Math.max(0, (maxCases - prosecutor.current_cases) / maxCases);
    const defendantScore = Math.max(0, (maxDefendants - prosecutor.current_defendants) / maxDefendants);
    
    return (caseScore + defendantScore) / 2;
  }

  private static calculateExperienceScore(prosecutor: Prosecutor, caseType: string): number {
    // Điểm dựa trên kinh nghiệm
    const experienceScore = Math.min(prosecutor.experience_years / 10, 1); // Max 10 năm = điểm tối đa
    
    // Bonus nếu có chuyên môn phù hợp
    const hasSpecialization = prosecutor.specialization_tags.some(tag => 
      tag.toLowerCase().includes(caseType.toLowerCase()) ||
      caseType.toLowerCase().includes(tag.toLowerCase())
    );
    
    return hasSpecialization ? experienceScore + 0.3 : experienceScore;
  }

  private static calculateTimeScore(prosecutor: Prosecutor): number {
    // Điểm dựa trên thời gian nhận án gần nhất
    if (!prosecutor.last_assignment_date) {
      return 1; // Chưa được phân công bao giờ = điểm tối đa
    }
    
    const lastAssignment = new Date(prosecutor.last_assignment_date);
    const now = new Date();
    const daysSinceLastAssignment = Math.floor((now.getTime() - lastAssignment.getTime()) / (1000 * 60 * 60 * 24));
    
    // Sau 30 ngày = điểm tối đa
    return Math.min(daysSinceLastAssignment / 30, 1);
  }

  private static calculatePositionScore(prosecutor: Prosecutor, caseComplexity: 'low' | 'medium' | 'high'): number {
    const positionWeights = {
      'Kiểm sát viên': { low: 1, medium: 1, high: 1 },
      'Kiểm tra viên': { low: 0.8, medium: 0.9, high: 0.7 },
      'Chuyên viên': { low: 0.6, medium: 0.7, high: 0.5 }
    };
    
    return positionWeights[prosecutor.position][caseComplexity];
  }

  public static suggestAssignments(
    prosecutors: Prosecutor[], 
    caseInfo: Partial<Case>,
    options: {
      count?: number;
      excludeOverloaded?: boolean;
      preferSpecialization?: boolean;
    } = {}
  ): CaseAssignmentSuggestion[] {
    const { count = 3, excludeOverloaded = true } = options;
    
    let eligibleProsecutors = [...prosecutors];
    
    // Lọc bỏ những người quá tải
    if (excludeOverloaded) {
      eligibleProsecutors = eligibleProsecutors.filter(p => 
        p.current_cases < 20 && p.current_defendants < 50
      );
    }
    
    if (eligibleProsecutors.length === 0) {
      return [];
    }
    
    const caseType = caseInfo.case_type || '';
    const caseComplexity: 'low' | 'medium' | 'high' = 
      (caseInfo.defendants_count || 0) > 5 ? 'high' :
      (caseInfo.defendants_count || 0) > 2 ? 'medium' : 'low';
    
    const suggestions = eligibleProsecutors.map(prosecutor => {
      const workloadScore = this.calculateWorkloadScore(prosecutor) * 0.4;
      const experienceScore = this.calculateExperienceScore(prosecutor, caseType) * 0.3;
      const timeScore = this.calculateTimeScore(prosecutor) * 0.2;
      const positionScore = this.calculatePositionScore(prosecutor, caseComplexity) * 0.1;
      
      const totalScore = workloadScore + experienceScore + timeScore + positionScore;
      
      const reasons: string[] = [];
      
      if (workloadScore > 0.3) {
        reasons.push(`Tải công việc thấp (${prosecutor.current_cases} vụ, ${prosecutor.current_defendants} bị can)`);
      }
      
      if (experienceScore > 0.4) {
        reasons.push(`Kinh nghiệm phù hợp (${prosecutor.experience_years} năm)`);
      }
      
      if (prosecutor.specialization_tags.some(tag => 
        tag.toLowerCase().includes(caseType.toLowerCase()))) {
        reasons.push(`Chuyên môn ${caseType.toLowerCase()}`);
      }
      
      if (timeScore > 0.5) {
        const daysSince = prosecutor.last_assignment_date ? 
          Math.floor((Date.now() - new Date(prosecutor.last_assignment_date).getTime()) / (1000 * 60 * 60 * 24)) : 
          999;
        reasons.push(`Lâu chưa nhận án (${daysSince > 999 ? 'chưa bao giờ' : daysSince + ' ngày'})`);
      }
      
      return {
        prosecutor,
        score: Math.round(totalScore * 100) / 100,
        reasons
      };
    });
    
    // Sắp xếp theo điểm số giảm dần
    suggestions.sort((a, b) => b.score - a.score);
    
    return suggestions.slice(0, count);
  }

  public static getWorkloadDistribution(prosecutors: Prosecutor[]): {
    prosecutor: Prosecutor;
    cases: number;
    defendants: number;
    workloadPercentage: number;
  }[] {
    const maxCases = Math.max(...prosecutors.map(p => p.current_cases), 1);
    const maxDefendants = Math.max(...prosecutors.map(p => p.current_defendants), 1);
    
    return prosecutors.map(prosecutor => {
      const casePercentage = (prosecutor.current_cases / maxCases) * 100;
      const defendantPercentage = (prosecutor.current_defendants / maxDefendants) * 100;
      const workloadPercentage = Math.round((casePercentage + defendantPercentage) / 2);
      
      return {
        prosecutor,
        cases: prosecutor.current_cases,
        defendants: prosecutor.current_defendants,
        workloadPercentage
      };
    }).sort((a, b) => b.workloadPercentage - a.workloadPercentage);
  }
}
