// pages/api/deleteData.js
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase"; // this file contains the database initialization code

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // check if the request method is DELETE
  if (req.method === "DELETE") {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    // get the document id from the query parameters
    const { id } = req.query;
    try {
      // delete the document from the collection
      await deleteDoc(doc(db, "Users", id));
      // return a success response
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      // return an error response
      res.status(500).json({ error: error.message });
    }
  } else {
    // return a method not allowed response
    res.status(405).json({ error: "Method not allowed" });
  }
}
