export interface Repository {
  id: number;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  url: string;
  private: boolean;
  owner: string;
}

export interface PaginationData {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
export interface ConnectRepositoryModalProps {
  trigger?: React.ReactNode;
}

export interface GithubStatus {
  isConnected: boolean;
  username: string | null;
  tokenValid: boolean;
  tokenError?: string | null;
  githubData?: {
    username: string;
    connectedAt: Date;
    connected: boolean;
  } | null;
}