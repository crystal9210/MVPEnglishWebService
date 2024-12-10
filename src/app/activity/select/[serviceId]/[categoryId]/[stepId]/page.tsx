"use client";
import React from "react";
import { useParams } from "next/navigation";
import ProblemSetSelector from "@/app/_components/problemSetSelector";

const SelectProblemSetPage = () => {
    const params = useParams();
    const { serviceId, categoryId, stepId } = params;

    if (!serviceId || !categoryId || !stepId) {
        return <p>Invalid selection parameters.</p>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Select Problem Set</h1>
            <ProblemSetSelector />
        </div>
    );
};

export default SelectProblemSetPage;
