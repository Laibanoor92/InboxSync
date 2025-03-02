
export interface EmailConfig {
  id?: number;
  name: string;
  type: string;
  username: string;
  password: string;
  host: string;
  port: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PdfMetadata {
  filename: string;
  date: Date;
  size: number;
}

export interface StatusMessage {
  type: 'success' | 'error';
  message: string;
}