// pages/api/Users/ActiveUsers.js
import { getServerSession } from 'next-auth';
import {authOptions} from '../auth/[...nextauth]';
import { db } from '../../firebase'; // this file contains the database initialization code
import { collection, getDocs } from 'firebase/firestore';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    try {
        // Check if the user is authenticated
       const session = await getServerSession(req, res, authOptions);
       if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Query the Firestore collection 'Users' to get all documents
      const querySnapshot = await getDocs(collection(db, 'Users'));
      
      let totalActiveUsers = 0;
      querySnapshot.forEach((doc) => {
        // assume a user is active if they have provided all the required fields
        const userData = doc.data();
        if (userData.name && userData.lastname && userData.email && userData.city && userData.phone) {
          totalActiveUsers++;
        }
      });

      // Return the total number of active users
      res.status(200).json({ totalActiveUsers });
      
    } catch (error) {
      console.error('Error fetching active users: ', error);
      res.status(500).json({ error: 'Failed to fetch active users.' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
