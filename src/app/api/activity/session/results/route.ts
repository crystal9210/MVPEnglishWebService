import { NextResponse } from "next/server";
import { container } from "@/containers/diContainer";
import { IActivityService } from "@/interfaces/services/IActivityService";
import { ActivitySessionSchema } from "@/schemas/serverSide/activitySessionSchema";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parseResult = ActivitySessionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ message: "Invalid data", errors: parseResult.error.errors }, { status: 400 });
        }

        const activitySession = parseResult.data;

        const activityService = container.resolve<IActivityService>("IActivityService");

        await activityService.saveActivitySession(activitySession);

        return NextResponse.json({ message: "Activity session saved successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error saving activity session:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
