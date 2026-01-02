// Test API route to check Snowflake connection
import { NextResponse } from 'next/server';

export async function GET() {
    const env = {
        SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
        SNOWFLAKE_USERNAME: process.env.SNOWFLAKE_USERNAME,
        SNOWFLAKE_AUTHENTICATOR: process.env.SNOWFLAKE_AUTHENTICATOR,
        SNOWFLAKE_WAREHOUSE: process.env.SNOWFLAKE_WAREHOUSE,
        SNOWFLAKE_DATABASE: process.env.SNOWFLAKE_DATABASE,
        SNOWFLAKE_SCHEMA: process.env.SNOWFLAKE_SCHEMA,
    };

    return NextResponse.json({
        message: "Snowflake Environment Check",
        envVarsFound: Object.fromEntries(
            Object.entries(env).map(([key, value]) => [key, !!value])
        ),
        env
    });
}
