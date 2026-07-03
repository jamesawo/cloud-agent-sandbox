import { NextRequest, NextResponse } from "next/server";
import {
  getWeatherReport,
  weatherErrorResponse,
} from "@/features/weather/weather-provider";
import {
  weatherReportSchema,
  weatherSearchSchema,
} from "@/features/weather/weather-schema";

export async function GET(request: NextRequest) {
  try {
    const parsed = weatherSearchSchema.parse({
      city: request.nextUrl.searchParams.get("city") ?? "",
    });
    const report = await getWeatherReport(parsed.city);
    return NextResponse.json(weatherReportSchema.parse(report));
  } catch (error) {
    return weatherErrorResponse(error);
  }
}
