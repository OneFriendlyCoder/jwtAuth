import express from 'express';
import jwt, {Secret} from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

interface AuthenticatedRequest extends express.Request {
    user?: any;
}

const posts = [{
    username: 'ram',
    title: 'post1'
},
{
    username: 'shayam',
    title: 'post2'
}
]

let refreshTokens: string[] = [];

app.get('/posts', authenticateToken ,(req: AuthenticatedRequest, res: express.Response) => { 
    res.json(posts.filter(post => post.username === req.user.name));
})

//refresh token is used to create a new access token
app.post('/token', (req: AuthenticatedRequest, res: express.Response) => {
    const refreshToken = req.body.token;
    if(refreshToken == null) res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret, (err: Error | null, user: any)=>{
        if(err) res.sendStatus(403);
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken});
})
})

app.post('/login', (req: express.Request, res: express.Response) => {
    // user has already been authenticated

    const username = req.body.username;
    const user = {name: username};
    const accessToken  = generateAccessToken(user);   // no expiration date of the accessToken
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as Secret);    //this is used to create a new authorization token
    refreshTokens.push(refreshToken);
    res.json({accessToken: accessToken, refreshToken: refreshToken});
})


app.delete('/logout', (req: express.Request, res: express.Response) => {
    refreshTokens = refreshTokens.filter(token =>token !== req.body.token)
    res.sendStatus(204);
})

function generateAccessToken(user: {name: string}){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as Secret, {expiresIn: '30s'})
}



function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

app.listen(3000);