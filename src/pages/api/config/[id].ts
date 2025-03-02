import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const configId = parseInt(id as string);

  try {
    switch (req.method) {
      case 'GET':
        const config = await prisma.emailConfig.findUnique({
          where: { id: configId },
        });
        if (!config) {
          return res.status(404).json({ error: 'Configuration not found' });
        }
        return res.json(config);

      case 'PUT':
        const updatedConfig = await prisma.emailConfig.update({
          where: { id: configId },
          data: req.body,
        });
        return res.json(updatedConfig);

      case 'DELETE':
        await prisma.emailConfig.delete({
          where: { id: configId },
        });
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}