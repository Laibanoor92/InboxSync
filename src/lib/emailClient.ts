import { EmailConfig, PdfMetadata } from '../types';
import { prisma } from './prismaClient';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class EmailClient {
  private config: EmailConfig;
  private imap: Imap | null = null;

  constructor(config: EmailConfig) {
    this.config = config;
    
    if (config.type === 'IMAP') {
      this.imap = new Imap({
        user: config.username,
        password: config.password!,
        host: config.host!,
        port: config.port!,
        tls: true,
        tlsOptions: { rejectUnauthorized: false } // Ignore self-signed certificate errors
      });
    }
  }

  async fetchPdfAttachments(): Promise<PdfMetadata[]> {
    if (this.config.type === 'IMAP') {
      return this.fetchImapPdfAttachments();
    } else if (this.config.type === 'GMAIL') {
      return this.fetchGmailPdfAttachments();
    }
    throw new Error(`Unsupported email type: ${this.config.type}`);
  }

  private async fetchImapPdfAttachments(): Promise<PdfMetadata[]> {
    if (!this.imap) {
      throw new Error('IMAP client not initialized');
    }

    return new Promise((resolve, reject) => {
      const pdfs: PdfMetadata[] = [];

      this.imap!.once('ready', () => {
        this.imap!.openBox('INBOX', false, (err, box) => {
          if (err) {
            reject(err);
            return;
          }

          // Search for emails from the last 24 hours
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          this.imap!.search(['SINCE', yesterday], (err, results) => {
            if (err) {
              reject(err);
              return;
            }

            if (results.length === 0) {
              this.imap!.end();
              resolve([]);
              return;
            }

            const fetch = this.imap!.fetch(results, {
              bodies: '',
              struct: true,
            });

            fetch.on('message', (msg) => {
              msg.on('body', async (stream) => {
                try {
                  const parsed = await simpleParser(stream);
                  
                  if (parsed.attachments) {
                    for (const attachment of parsed.attachments) {
                      if (attachment.contentType === 'application/pdf') {
                        // Create pdfs directory if it doesn't exist
                        const pdfDir = path.join(process.cwd(), 'pdfs');
                        if (!fs.existsSync(pdfDir)) {
                          fs.mkdirSync(pdfDir);
                        }

                        const filename = `${Date.now()}-${attachment.filename || 'unnamed.pdf'}`;
                        const filepath = path.join(pdfDir, filename);

                        // Save PDF to disk
                        await fs.promises.writeFile(filepath, attachment.content);

                        // Create metadata
                        const metadata: PdfMetadata = {
                          filename,
                          emailSubject: parsed.subject || 'No Subject',
                          sender: parsed.from?.text || 'Unknown',
                          receivedAt: parsed.date || new Date(),
                          fileSize: attachment.size,
                          path: filepath,
                          configId: this.config.id!
                        };

                        // Save metadata to database
                        await prisma.pdfMetadata.create({
                          data: metadata
                        });

                        pdfs.push(metadata);
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error processing message:', error);
                }
              });
            });

            fetch.once('error', (err) => {
              console.error('Fetch error:', err);
              reject(err);
            });

            fetch.once('end', () => {
              this.imap!.end();
              resolve(pdfs);
            });
          });
        });
      });

      this.imap!.once('error', (err) => {
        console.error('IMAP error:', err);
        reject(err);
      });

      this.imap!.once('end', () => {
        console.log('IMAP connection ended');
      });

      // Connect to the IMAP server
      try {
        this.imap!.connect();
      } catch (error) {
        console.error('Connection error:', error);
        reject(error);
      }
    });
  }

  private async fetchGmailPdfAttachments(): Promise<PdfMetadata[]> {
    if (!this.config.token) {
      throw new Error('Gmail configuration requires OAuth token');
    }

    const oauth2Client = new OAuth2Client(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET
    );

    oauth2Client.setCredentials(this.config.token);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const pdfs: PdfMetadata[] = [];

    try {
      // Get messages from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `after:${yesterday.getTime() / 1000} has:attachment`
      });

      const messages = response.data.messages || [];

      for (const message of messages) {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });

        const attachments = messageDetails.data.payload?.parts?.filter(
          part => part.mimeType === 'application/pdf'
        ) || [];

        for (const attachment of attachments) {
          if (attachment.body?.attachmentId) {
            const attachmentData = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: message.id!,
              id: attachment.body.attachmentId
            });

            // Create pdfs directory if it doesn't exist
            const pdfDir = path.join(process.cwd(), 'pdfs');
            if (!fs.existsSync(pdfDir)) {
              fs.mkdirSync(pdfDir);
            }

            const filename = `${Date.now()}-${attachment.filename || 'unnamed.pdf'}`;
            const filepath = path.join(pdfDir, filename);

            // Convert base64 to buffer and save
            const buffer = Buffer.from(attachmentData.data.data!, 'base64');
            await fs.promises.writeFile(filepath, buffer);

            const headers = messageDetails.data.payload?.headers || [];
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const date = new Date(parseInt(messageDetails.data.internalDate!));

            const metadata: PdfMetadata = {
              filename,
              emailSubject: subject,
              sender: from,
              receivedAt: date,
              fileSize: buffer.length,
              path: filepath,
              configId: this.config.id!
            };

            // Save metadata to database
            await prisma.pdfMetadata.create({
              data: metadata
            });

            pdfs.push(metadata);
          }
        }
      }

      return pdfs;
    } catch (error) {
      console.error('Error fetching Gmail PDFs:', error);
      throw new Error('Failed to fetch PDFs from Gmail');
    }
  }

  private ensurePdfDirectory() {
    const pdfDir = path.join(process.cwd(), 'pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    return pdfDir;
  }

  private async savePdfToDisk(buffer: Buffer, filename: string): Promise<string> {
    const pdfDir = this.ensurePdfDirectory();
    const filepath = path.join(pdfDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return filepath;
  }
}

