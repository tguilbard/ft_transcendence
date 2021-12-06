import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private userService: UsersService) { }

  use(req: Request, res: Response, next: () => void) {
    console.log('path = ', req.path)
    const path = req.path;
    if (path != '/users/isRegister' && path != '/users/login') {
      try {

          const { cookies, headers } = req;

        /* On vérifie que le JWT est présent dans les cookies de la requête */
            if (!cookies || !cookies.access_token && path != '/users/isLogin')
            {
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

              const session = decodedToken['ses'];
              console.log('session = ', session);
              console.log('sessionToken = ', req.sessionID);
            if (session != req.sessionID && path != '/users/isRegister' && path != '/users/isLogin')
              return res.status(401).json({ message: 'Problem de session' });

              const username = decodedToken['login'];
              const id = decodedToken['id'];
              console.log('user middleware = ', username);

              const state = decodedToken['state'];
            // if (!username || (!state && path != '/users/upload' && path != '/users/register' && path != '/users/isRegister' && path != '/users/isLogin'))
            //   return res.status(401).json({ message: 'Vous devez vous loger pour acceder a ce contenu' });
          console.log('set response');

          res.set('User', username);
          res.set('State', state);
          res.set('Id', id);
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
