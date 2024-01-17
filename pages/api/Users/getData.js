// import { authOptions } from '../auth/login';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';
import { db } from '../../firebase'; // this file contains the database initialization code
import { collection, getDocs } from 'firebase/firestore';
// import { authenticate } from '../../../middleware/auth';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    try {
      // Check if the user is authenticated
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        res.status(401).json({ message: "You must logged in" })
      }
      // Fetch data from Firestore collection
      const data = [];
      const querySnapshot = await getDocs(collection(db, 'Users'));

      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({ totalUsers: data.length, data });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
