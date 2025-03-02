import { NextApiRequest, NextApiResponse } from 'next';
import { getTokens } from '../../../../lib/googleAuth';
import { prisma } from '../../../../lib/prismaClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    if (!state || typeof state !== 'string') {
      return res.status(400).json({ error: 'Missing state parameter' });
    }

    // Get tokens from Google
    const tokens = await getTokens(code);

    // Update the email configuration with the tokens
    await prisma.emailConfig.update({
      where: { id: parseInt(state) },
      data: { token: tokens },
    });

    // Redirect back to the main page
    res.redirect('/?auth=success');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?auth=error');
  }
}