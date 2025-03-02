
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prismaClient';
import { EmailClient } from '../../lib/emailClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { configId } = req.query;
    
    if (!configId || typeof configId !== 'string') {
      return res.status(400).json({ error: 'Missing configId' });
    }

    // Get email configuration
    const config = await prisma.emailConfig.findUnique({
      where: { id: parseInt(configId) },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Initialize email client
    const emailClient = new EmailClient(config);
    const pdfs = await emailClient.fetchPdfAttachments();

    res.json(pdfs);
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
}
