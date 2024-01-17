// pages/api/postData.js
import { db } from '../../firebase' // this file contains the database initialization code
import { collection, addDoc, Timestamp} from 'firebase/firestore';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    try {
      const { name, lastname, email, city, phone } = req.body;

      // Validate input
      // if (!name || !lastname || !email || !city || !phone ) {
      //   return res.status(400).json({ error: 'name and email and phone are required.' });
      // }
      if (
        typeof name !== 'string' || name.trim() === '' ||
        typeof lastname !== 'string' || lastname.trim() === '' ||
        typeof email !== 'string' || !isValidEmail(email) ||
        typeof city !== 'string' || city.trim() === '' ||
        typeof phone !== 'string' || !isValidPhone(phone)
      ) 
      {
        return res.status(400).json({ error: 'Invalid input provided.' });
      }

      // Create a new document in Firestore collection 'Users'
      const docRef = await addDoc(collection(db,"Users"), {
        name: name,
        lastname: lastname,
        email : email,
        city:city,
        phone : phone,
        signupTimestamp:Timestamp.fromDate(new Date()),
        // signupTimestamp: new Date().toISOString(),
      });

      // Return the ID of the newly created document
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error('Error adding document: ', error);
      res.status(500).json({ error: 'Failed to add User.' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

// Email validation function
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

// Phone validation function (as an example, let's assume the phone number should be 10 digits)
function isValidPhone(phone) {
  const regex = /^\d{10}$/;
  return regex.test(phone);
}
