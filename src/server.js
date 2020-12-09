const express = require("express");
const cors = require("cors");
const redis = require("redis");
const jwt = require("./jwtController");

const PORT = process.env.PORT || 3000;
const keysAllowed = 'salamesalame';

const client = redis.createClient({
    host: "redis-19405.c246.us-east-1-4.ec2.cloud.redislabs.com",
    port: 19405,
    password: "xDKSqMrQ0VdXFwAiOE1kOEZoSTf0xnNy"
});
client.on("error", err => {
    console.log(error, err);
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/newsession/:username', newSession);
app.put('/refreshsession/:username', refreshSession);

try {
    app.listen(PORT, () => {
        console.log(`Server en puerto ${PORT}`);
    });
} catch (error) {
    console.log(`Fallo en puerto ${PORT}`, error);
}

async function newSession(req, res){
    const { username } = req.params;
    const apiKey = req.headers['api-key'];
    if(apiKey == keysAllowed){
        const token = jwt.tokenGeneration();
        client.setex(username, 1800, token);
        return res.json({ok: true, token: token});
    }else{
        return res.json({ok: false, error: 'invalid-key'});
    }
}

async function refreshSession(req, res){
    const { username } = req.params;
    const token = req.headers['access-token'];
    if(token && username){
        if(jwt.checkToken(token)){
            client.get(username, (err, data) => {
                if(!err && data !== null){
                    const token = jwt.tokenGeneration();
                    client.setex(username, 1800, token);
                    return res.json({ok: true, token: token});
                }else if(err){
                    return res.status(500);
                }else{
                    return res.json({ok: false, error: 'invalid-username'});
                }
            })
        }else{
            return res.json({ok: false, error: 'bad-token'});
        }
    }else{
        return res.json({ok: false, error: 'no-creds'});
    }
}