/// <reference types="vite/client" />

declare global {
    interface Window {
        process: {
            env: {
                NODE_ENV: 'development' | 'production';
                [key: string]: string | undefined;
            }
        }
    }
}

export {};
