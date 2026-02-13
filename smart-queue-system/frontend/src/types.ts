export interface Service {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    counters: Counter[];
    staff?: number[];
  }
  
  export interface Counter {
    id: number;
    name: string;
    is_active: boolean;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'student' | 'staff' | 'admin';
    password?: string;
  }
  
  export interface QueueEntry {
    id: number;
    user: User;
    service: Service;
    counter: Counter | null;
    token_number: number;
    status: 'waiting' | 'in_progress' | 'completed' | 'skipped' | 'rejected';
    created_at: string;
  }
  