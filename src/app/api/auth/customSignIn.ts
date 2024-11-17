"use server";
import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { signIn } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

export default async function customSignIn(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Invalid method." })
    }

    const { email, processType, provider } = req.body;
    
}
