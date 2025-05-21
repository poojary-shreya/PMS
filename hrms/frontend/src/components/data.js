// Initial Data for Project Management App

export const initialProjects = [
    { id: 1, name: 'HRMS ', key: 'HRMS', description: 'Human Resource Management System Development' },
    { id: 2, name: 'Order Management', key: 'OMS', description: 'Customer Relationship Management Integration' },
  ];
  
  export const initialStatuses = ['To Do', 'In Progress', 'Review', 'Done'];
  export const getStatusColor = (status) => {
    // Example implementation
    switch (status) {
      case 'Open':
        return 'green';
      case 'In Progress':
        return 'orange';
      case 'Closed':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  export const initialPriorities = [
    { name: 'Highest', color: '#FF0000' },
    { name: 'High', color: '#FF8C00' },
    { name: 'Medium', color: '#FFFF00' },
    { name: 'Low', color: '#90EE90' },
    { name: 'Lowest', color: '#ADD8E6' },
  ];
  
  export const initialIssueTypes = [
    { name: 'Bug', icon: '🐞' },
    { name: 'Task', icon: '📋' },
    { name: 'Story', icon: '📚' },
    { name: 'Epic', icon: '🌟' },
  ];
  
  export const initialUsers = [
    { id: 1, name: 'John Doe', avatar: '👤', role: 'Developer' },
    { id: 2, name: 'Jane Smith', avatar: '👩', role: 'Designer' },
    { id: 3, name: 'Robert Brown', avatar: '👨', role: 'Product Owner' },
    { id: 4, name: 'Susan Wilson', avatar: '👩‍💼', role: 'Scrum Master' },
  ];
  
  export const initialIssues = [
    {
      id: 'HRMS-1',
      title: 'Setup authentication module',
      description: 'Implement user authentication system with role-based access',
      assignee: 1,
      reporter: 3,
      priority: 'High',
      type: 'Task',
      status: 'In Progress',
      projectId: 1,
      created: '2025-04-10T12:00:00Z',
      updated: '2025-04-12T15:30:00Z',
      comments: [
        { id: 1, user: 3, text: 'Please include 2FA support', timestamp: '2025-04-11T09:15:00Z' },
      ],
    },
    {
      id: 'HRMS-2',
      title: 'Design dashboard UI',
      description: 'Create wireframes and mockups for the main dashboard',
      assignee: 2,
      reporter: 4,
      priority: 'Medium',
      type: 'Story',
      status: 'To Do',
      projectId: 1,
      created: '2025-04-12T10:00:00Z',
      updated: '2025-04-12T10:00:00Z',
      comments: [],
    },
    {
      id: 'HRMS-3',
      title: 'Login page throws error',
      description: 'Users receive 500 error when trying to login with correct credentials',
      assignee: 1,
      reporter: 4,
      priority: 'Highest',
      type: 'Bug',
      status: 'To Do',
      projectId: 1,
      created: '2025-04-14T11:20:00Z',
      updated: '2025-04-14T11:20:00Z',
      comments: [],
    },
    {
      id: 'CRM-1',
      title: 'Setup API integration',
      description: 'Configure API endpoints to connect with the CRM system',
      assignee: 1,
      reporter: 3,
      priority: 'High',
      type: 'Task',
      status: 'To Do',
      projectId: 2,
      created: '2025-04-15T09:30:00Z',
      updated: '2025-04-15T09:30:00Z',
      comments: [],
    },
  ];
  
  // Utility functions for working with the data
  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  export const getPriorityColor = (priority) => {
    return initialPriorities.find((p) => p.name === priority)?.color || '#000000';
  };
  
  export const getTypeIcon = (type) => {
    return initialIssueTypes.find((t) => t.name === type)?.icon || '📄';
  };
  
  export const getUser = (users, userId) => {
    return users.find((user) => user.id === userId) || { name: 'Unassigned', avatar: '❓' };
  };