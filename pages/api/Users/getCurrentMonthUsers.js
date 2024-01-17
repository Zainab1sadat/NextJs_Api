// pages/api/getCurrentMonthUsers.js
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Get the start and end of the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0); // Setting the day to 0 gets the last day of the previous month


    const usersRef = collection(db, 'Users');
    const q = query(
      usersRef,
      where('signupTimestamp', '>=', firstDayOfMonth),
      where('signupTimestamp', '<=', lastDayOfMonth)
    );

    const querySnapshot = await getDocs(q);
    const userCount = querySnapshot.size;

    res.status(200).json({ count: userCount });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

