

import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUrl } from '../../../lib/googleAuth';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { configId } = req.query;
    
    if (!configId || typeof configId !== 'string') {
      return res.status(400).json({ error: 'Missing configId' });
    }

    const url = getAuthUrl(configId);
    res.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
}