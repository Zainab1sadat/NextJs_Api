// pages/api/register.js
import { db } from '../../firebase';
import { collection, getDocs, query, where, Timestamp, addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

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

        const { email, username, password, role } = req.body;

        if (
            typeof username !== 'string' || username.trim() === '' ||
            typeof email !== 'string' || !isValidEmail(email)
        ) {
            return res.status(400).json({ error: 'Invalid input provided.' });
        }
        // Password Validation: Check if password meets certain criteria (length, uppercase, lowercase, numbers, special characters)
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=.*[a-zA-Z]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must contain at least 8 characters, including uppercase, lowercase letters, numbers, and special characters like @#$%^&+='
            });
        }

        try {

            // Check if the username already exists in the database
            const existingUserQuery = query(collection(db, 'adminUser'), where('email', '==', email));
            const existingUserSnapshot = await getDocs(existingUserQuery);

            if (!existingUserSnapshot.empty) {
                return res.status(400).json({ error: 'email already exists' });
            }

            // Hash the password before storing it in the database
            const hashPassword = await bcrypt.hash(password, 10);

            // Create a new document in Firestore collection 'adminUser'
            const docRef = await addDoc(collection(db, "adminUser"), {
                email: email,
                username: username,
                password: hashPassword,
                role: role || 'user', // Default role is 'user' if not specified
                signupTimestamp: Timestamp.fromDate(new Date()),
            });


            return res.status(201).json({ id: docRef.id });

        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ error: 'Internal server error' });
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
