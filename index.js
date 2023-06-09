import express from "express";
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, documentId, getDoc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
const app = express();
import cors from 'cors'
import * as dotenv from 'dotenv'
import bodyParser from "body-parser";

app.use(bodyParser.json());

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


const fire = initializeApp(firebaseConfig);

const db = getFirestore(fire);

app.use(cors())

// Define a route to get all products from the database
app.get("/products", async (req, res) => {

    try {
        console.log("Request received", req);
        const products = [];
        const querySnapshot = await getDocs(query(collection(db, "products"), orderBy("title")));
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        res.json(products);
    } catch (error) {
        console.error("Error while retrieving products:", error);
        res.status(500).json({ error: "Error while retrieving products" });
    }
});

// Define a route to get a single product from the database
app.get("/products/:id", async (req, res) => {
    try {
        const docRef = doc(db, "products", req.params.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            res.status(404).json({ error: "Product not found" });
        } else {
            res.json({
                id: docSnap.id,
                ...docSnap.data(),
            });
        }
    } catch (error) {
        console.error("Error while retrieving product:", error);
        res.status(500).json({ error: "Error while retrieving product" });
    }
});

app.get("/bestseller", async (req, res) => {
    try {
        console.log("Request received", req);
        const products = [];
        const querySnapshot = await getDocs(
            query(
                collection(db, "products"),
                where("rating", ">=", 4.5),
                orderBy("rating", "desc"),
                limit(4)
            )
        );
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        res.json(products);
    } catch (error) {
        console.error("Error while retrieving bestseller products:", error);
        res.status(500).json({ error: "Error while retrieving bestseller products" });
    }
});

app.get("/latest", async (req, res) => {
    console.log("Request received", req);
    try {
        const products = [];
        const querySnapshot = await getDocs(
            query(
                collection(db, "products"),
                orderBy("timestamp", "desc"),
                limit(4)
            )
        );
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        res.json(products);
    } catch (error) {
        console.error("Error retrieving latest products:", error);
        res.status(500).json({ error: "Error retrieving latest products" });
    }
});

app.post('/newsletter', async (req, res) => {
    const { email } = req.body;

    // Check if email already exists in database
    const querySnapshot = await getDocs(
        query(collection(db, "emails"), where("email", "==", email))
    );

  if (!querySnapshot.empty) {
        res.status(400).send("This email is already registered.");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "emails"), {
            email,
            timestamp: serverTimestamp(),
        });
        console.log("Email saved to database with ID: ", docRef.id);
        res.status(200).json({ message: "Email saved successfully" })
    } catch (error) {
        console.error("Error saving email: ", error);
        res.status(500).json({ error: "Error saving email" });
    }
});


/* app.post('/promotional-code', async (req, res) => {
    const { code } = req.body;

    try {
        const currentDate = new Date();
        const currentDateStr = currentDate.toISOString().substring(0, 10);

        console.log(currentDateStr)

        const promoCodesRef = collection(db, 'Promo Codes');
        const querySnapshot = await getDocs(promoCodesRef);

        let promoCodeData;

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.code === code && data.startDate <= currentDateStr && data.endDate >= currentDateStr) {
                promoCodeData = data;
            }
        });

        if (!promoCodeData) {
            res.status(404).json({ error: 'Invalid promotional code' });
        } else {
            const { discount, startDate, endDate } = promoCodeData;
            res.status(200).json({ valid: true, discount, code, startDate, endDate });
        }
    } catch (error) {
        console.error('Error while verifying the promotional code:', error);
        res.status(500).json({ error: 'Error while verifying the promotional code' });
    }
}); */

app.post('/promotional-code', async (req, res) => {
    const { code } = req.body;

    try {
        const currentDate = new Date();
        const currentDateStr = currentDate.toISOString().substring(0, 10);

        console.log(currentDateStr);

        const promoCodesRef = collection(db, 'Promo Codes');

        //Get the date from the collection where the code is equal to the code in collection
        const querySnapshot = await getDocs(
            query(promoCodesRef, where('code', '==', code))
        );

        // Filter the querySnapshot based on startDate and endDate conditions
        const promoCodeData = querySnapshot.docs
            .filter(doc => doc.data().startDate <= currentDateStr)
            .filter(doc => doc.data().endDate >= currentDateStr)[0]?.data();

        if (!promoCodeData) {
            res.status(404).json({ error: 'Invalid promotional code' });
        } else {
            const { discount } = promoCodeData;
            console.log(discount);
            res.status(200).json({ valid: true, discount });
        }
    } catch (error) {
        console.error('Error while verifying the promotional code:', error);
        res.status(500).json({ error: 'Error while verifying the promotional code' });
    }
});




// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
