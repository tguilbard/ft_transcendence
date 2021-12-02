import { Body, Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private userService: UsersService){}
  
  use(req: Request, res: Response, next: () => void) {
    console.log('path = ', req.path)
    if (req.path != '/' && req.path != '/login')
    {
      try {
        const { cookies, headers } = req;
     
        /* On vérifie que le JWT est présent dans les cookies de la requête */
        console.log("cookies middleware = ", req.cookies);
        if (!cookies || !cookies.access_token) {
          console.log('problem de cookies');
          return res.status(401).json({ message: 'Missing token in cookie' });
        }
        
        console.log('cookie = ', cookies.access_token);
        const accessToken = cookies.access_token;
     
        // /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
        // if (!headers || !headers['x-xsrf-token']) {
        //   console.log('problem header token');
        //   return res.status(401).json({ message: 'Missing XSRF token in headers' });
        // }
        
        // const xsrfToken = headers['x-xsrf-token'];
        // console.log('header token = ', xsrfToken);
     
        /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
        const decodedToken = jwt.verify(accessToken, 'secret', {
          algorithms: ['HS256']
        })['xsrfToken'];
     
        console.log('decode token = ', decodedToken);
        if (!decodedToken)
          return res.status(401).json({ message: 'Problem de token' });
        
        const username = jwt.verify(accessToken, 'secret', {
          algorithms: ['HS256']
        })['firstName'];
        console.log('user middleware = ', username);
        res.set('User', username);
        // /* On vérifie que le token CSRF correspond à celui présent dans le JWT  */
        // if (xsrfToken !== decodedToken) {
        //   return res.status(401).json({ message: 'Bad xsrf token' });
        // }
     
        /* On vérifie que l'utilisateur existe bien dans notre base de données */
       // const userId = decodedToken.sub;
        //const user = await User.findOne({ where: { id: userId } });
        // if (!user) {
        //   return res.status(401).json({ message: `User ${userId} not exists` });
        // }
     
        /* On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares */
        //req.user = user;
     
        /* On appelle le prochain middleware */
        
        return next();
      } catch (err) {
        return res.status(500).json({ message: 'Internal error' });
      }
    }
    console.log('middleware passed');
    next();
  }
}
