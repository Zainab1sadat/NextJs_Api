// middleware/auth.js
import { verify } from 'jsonwebtoken';

export function authenticate(handler) { return async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = verify(token, 'v0wGAmmriDzGJ_06XFTGWdFh70'); // Replace with your secret key
    req.user = decoded;
    return handler(req, res);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};     }
