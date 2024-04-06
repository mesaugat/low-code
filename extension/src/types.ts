export enum ChangeReason {
  UNDO = 'undo',
  REDO = 'redo',
  NONE = 'none',
}

export interface DocumentChangePayload {
  repo_url: string;
  repo_user: string;
  repo_user_email: string;
  repo_branch: string;
  repo_head: string;
  change_reason: ChangeReason;
  changed_file: string;
  range_start_line: number;
  range_end_line: number;
  timestamp: string;
  is_dirty: boolean;
}

export interface GitInfo {
  remote: string;
  getCurrentBranch: () => Promise<string>;
  getCurrentHead: () => Promise<string>;
  getUsername: () => Promise<string>;
  getUserEmail: () => Promise<string>;
}
