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
app.get('/posts', authenticateToken ,(req: AuthenticatedRequest, res: express.Response) => { 
    res.json(posts.filter(post => post.username === req.user.name));
})

app.post('/login', (req: express.Request, res: express.Response) => {
    // user has already been authenticated

    const username = req.body.username;
    const user = {name: username};
    const accessToken  = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as Secret);         // no expiration date of the accessToken
    res.json({accessToken: accessToken});
})

/*
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
*/
app.listen(3000);