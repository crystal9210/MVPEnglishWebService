"use client";
import { useSession } from "next-auth/react";

export default function DashBoard() {
    const { data: session } = useSession();

    if (!session || session.user!.role !== "admin") {
        return (
            <div>You\&apos;re an admin. Welcome!</div>
        )
    } else {
        return (
            <div>You\&apos;re not authorized to view this page.Please login!</div>
        )
    }

}