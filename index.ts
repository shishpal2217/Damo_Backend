import app from './src/app'
import {config} from './src/config/config'

import {Db} from './src/config/db'

const startServer=async()=>{

   await Db.connectDb();

    const port = config.port
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}

 
startServer();