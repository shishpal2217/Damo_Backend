import moongoose, { Mongoose } from 'mongoose';

import { config } from './config';

const connectDb = async () => {
    const { databaseUrl } = config;

    try{
        moongoose.connection.on('connected', () => {
            console.log('Mongoose is connected');
        })
    
        moongoose.connection.on('error', (error) => {
            console.log("Failed to connect database",error);
        })

        await moongoose.connect(databaseUrl as string);

    }catch(error){
        console.log("Failed to connect database",error);
        process.exit(1);
    }
   
};
export const Db = Object.freeze({ connectDb })