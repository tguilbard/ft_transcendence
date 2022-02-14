import { Injectable, NestMiddleware } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  
  use(req: Request, res: Response, next: () => void) {
    console.log('path = ', req.path);
    const path = req.path;
    console.log("path = ", path);
    if (path != '/users/login') {
      try {
        const { cookies } = req;
		// console.log(cookies);
        /* On vérifie que le JWT est présent dans les cookies de la requête */
        if (!cookies || !cookies.access_token) {
          // if (path == '/users/isLogin')
          // {
          //   console.log("middleware return no conncected");
          //   return res.send({ log: false });
          // }
          // else if (path == '/users/guest' && req.method == "POST" )
          //   return next();
          // return res.status(401).json({ message: 'Missing token in cookie' });
          return next();

        }

        if (cookies && cookies.access_token) {
          const accessToken = cookies.access_token;
          /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
          const decodedToken = jwt.verify(accessToken, 'secret', {
            algorithms: ['HS256']
          });

          const session = decodedToken['ses'];
          // console.log('session = ', session);
          // console.log('sessionToken = ', req.sessionID);
          // if (session != req.sessionID && path != '/users/isRegister') {
          //   res.clearCookie("access_token");
          //   return res.status(401).json({ message: 'Problem de session' });
          // }

          const state = decodedToken['state'];
          const login = decodedToken['login'];
          const guest = decodedToken['guest'];
          const username = decodedToken['username'];
          // console.log("just before state == guest");
          // if (state == "guest") {
          //   const user = { login: login, state: state };
          //   req.User = user;
          //   return next();
          // }
          // console.log("just after state == guest");

          const id = decodedToken['id'];
          if ((state != "register" && path == '/users/register') ||
            (state != "2fa" && state != "register" && state != "ok" && path.search('/2fa') == 0)
          ) {
            // if (path == "/users/isLogin" || path == "/user/isRegister")
            //   return res.send({ log: false });
            // return res.status(401).json({ message: 'Vous devez vous loger pour acceder a ce contenu' });
            return next();

          }
          const user = { login: login, state: state, id: id, guest: guest, username: username};

          req.User = user; // username;
        }

      } catch (err) {
        return res.status(500).json({ message: 'Internal error' });
      }
    }
    console.log('middleware passed');
    return next();
  }
}
