// pages/api/login.js
import { sign } from 'jsonwebtoken';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

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

        const { email, password } = req.body;
        if (
            typeof email !== 'string' || !isValidEmail(email)
        ) {
            return res.status(400).json({ error: 'Invalid email provided.' });
        }
        // Password Validation: Check if password meets certain criteria (length, uppercase, lowercase, numbers, special characters)
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=.*[a-zA-Z]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must contain at least 8 characters, including uppercase, lowercase letters, numbers, and special characters like @#$%^&+='
            });
        }

        try {
            // Fetch the user document based on the provided email
            const userQuery = query(collection(db, 'adminUser'), where('email', '==', email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                return res.status(400).json({ error: 'User not found' });
            }

            const userData = userSnapshot.docs[0].data();
            const hashedPassword = userData.password;

            // Compare the provided password with the hashed password from the database
            const isMatch = await bcrypt.compare(password, hashedPassword);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token after successful login
            const token = sign({ username: userData.username, role: userData.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Set the token in an HttpOnly cookie
            res.setHeader(
                'Set-Cookie',
                cookie.serialize('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'true', // Set secure to true in production
                    sameSite: 'strict',
                    maxAge: 3600, // 1 hour expiration, in seconds
                    path: '/', // Set the cookie path
                })
            );
            return res.status(200).json({ success: true });
            // return res.status(200).json({ token });

        } catch (error) {
            console.error('Error logging in user:', error);
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