declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_ID: string;
            CHANNEL_ID: string;
            SERVER_ID: string;
            TIMEOUT_MINUTES: number;
        }
    }
}

export {}
