import express from "express";
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore";
const app = express();
import cors from 'cors'
import * as dotenv from 'dotenv'

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

// Definisci una rotta per recuperare tutti i prodotti dal database
app.get("/products", async (req, res) => {

    try {
        console.log("Richiesta ricevuta", req);
        const products = [];
        const querySnapshot = await getDocs(query(collection(db, "products"), orderBy("id")));
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        res.json(products);
    } catch (error) {
        console.error("Errore durante il recupero dei prodotti:", error);
        res.status(500).json({ error: "Errore durante il recupero dei prodotti" });
    }
});

// Definisci una rotta per recuperare un singolo prodotto dal database
app.get("/products/:id", async (req, res) => {
    try {
        const docRef = doc(db, "products", req.params.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            res.status(404).json({ error: "Prodotto non trovato" });
        } else {
            res.json({
                id: docSnap.id,
                ...docSnap.data(),
            });
        }
    } catch (error) {
        console.error("Errore durante il recupero del prodotto:", error);
        res.status(500).json({ error: "Errore durante il recupero del prodotto" });
    }
});

app.get("/bestseller", async (req, res) => {
    try {
        console.log("Richiesta ricevuta", req);
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
        console.error("Errore durante il recupero dei prodotti bestseller:", error);
        res.status(500).json({ error: "Errore durante il recupero dei prodotti bestseller" });
    }
});

app.get("/latest", async (req, res) => {
    console.log("Richiesta ricevuta", req);
    try {
        const products = [];
        const querySnapshot = await getDocs(
            query(
                collection(db, "products"),
                orderBy("id", "desc"),
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
        console.error("Errore durante il recupero dei prodotti più recenti:", error);
        res.status(500).json({ error: "Errore durante il recupero dei prodotti più recenti" });
    }
});



// Avvia il server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server avviato sulla porta ${port}`);
});

