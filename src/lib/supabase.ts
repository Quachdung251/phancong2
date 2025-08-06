// Tạm thời vô hiệu hóa Supabase - chạy local only
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions for localStorage as backup
export const localStorage = {
  get: (key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: (key: string, value: unknown) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Export and import functions
export const exportData = () => {
  const prosecutors = localStorage.get('prosecutors') || [];
  const cases = localStorage.get('cases') || [];
  const assignments = localStorage.get('assignments') || [];
  
  const exportObject = {
    prosecutors,
    cases,
    assignments,
    exported_at: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(exportObject, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `phancong-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

export const importData = (file: File): Promise<{
  prosecutors: unknown[];
  cases: unknown[];
  assignments: unknown[];
  exported_at: string;
  version: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.prosecutors || !data.cases || !data.assignments) {
          throw new Error('Invalid file format');
        }
        
        // Store in localStorage
        localStorage.set('prosecutors', data.prosecutors);
        localStorage.set('cases', data.cases);
        localStorage.set('assignments', data.assignments);
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
