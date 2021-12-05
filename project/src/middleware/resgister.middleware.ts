import { Body, Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { request, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'
import { strictEqual } from 'assert';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private userService: UsersService){}
  
  use(req: Request, res: Response, next: () => void) {
    console.log('path = ', req.path)
    const path = req.path;
    if (path != '/user/isRegister' && path != '/user/login')
    {
      try {
        const { cookies, headers } = req;
     
        /* On vérifie que le JWT est présent dans les cookies de la requête */
        if (!cookies || !cookies.access_token && path != '/user/isLogin') {
          console.log('problem de cookies');
          return res.status(401).json({ message: 'Missing token in cookie' });
        }
        

        if (cookies && cookies.access_token)
        {
          console.log('je suis dans is cookies de middleware');

          const accessToken = cookies.access_token;
       
          /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
          const decodedToken = jwt.verify(accessToken, 'secret', {
            algorithms: ['HS256']
          });

          const session = decodedToken['id'];
          console.log('session = ', session);
          console.log('sessionToken = ', req.sessionID);
            if (session != req.sessionID && path != '/user/isRegister' && path != '/user/isLogin')
              return res.status(401).json({ message: 'Problem de session'});
            
            const username = decodedToken['login'];
            console.log('user middleware = ', username);

            const state = decodedToken['state'];
            if (!username || (!state && path != '/user/upload' && path != '/user/register' && path != '/user/isRegister' && path != '/user/isLogin'))
              return res.status(401).json({ message: 'Vous devez vous loger pour acceder a ce contenu' });
            res.set('User', username);
            res.set('State', state);
        }
     
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
