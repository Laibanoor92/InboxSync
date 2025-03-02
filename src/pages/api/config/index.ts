import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const configs = await prisma.emailConfig.findMany();
      res.json(configs);
    } else if (req.method === 'POST') {
      const config = await prisma.emailConfig.create({
        data: req.body,
      });
      res.json(config);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}