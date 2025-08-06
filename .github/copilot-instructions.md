<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Phân Công Án Application

This is a React TypeScript application for managing case assignments for prosecutors (Kiểm sát viên). 

## Key Features:
- Dashboard with charts and statistics
- Staff management system for prosecutors
- Intelligent case assignment algorithm
- Advanced filtering and search capabilities
- Supabase integration for authentication and data storage

## Technology Stack:
- React 18 with TypeScript
- Vite for build tooling
- Supabase for backend services
- Chart.js or similar for data visualization
- Tailwind CSS for styling

## Code Standards:
- Use TypeScript strictly with proper type definitions
- Follow React functional components with hooks
- Use proper error handling and loading states
- Implement responsive design principles
- Use Vietnamese language for UI text and comments where appropriate
- Follow Vietnamese naming conventions for prosecutor roles and legal terms

## Data Models:
- Prosecutor (Kiểm sát viên): name, position, experience, specialization tags, current caseload
- Case (Vụ án): case number, type, defendants, assigned prosecutor, status
- Assignment history and statistics

## Security:
- Implement proper authentication with Supabase
- Use row-level security for data access
- Validate all user inputs
- Handle sensitive legal data appropriately
