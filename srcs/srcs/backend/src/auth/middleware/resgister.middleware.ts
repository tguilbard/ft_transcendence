import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
		private readonly chatService: ChatService
	){}
  use(req: Request, res: Response, next: () => void) {
    const path = req.path;
	// console.log("path = ", path);
    if (path != '/')
    {
      try {
        const { cookies } = req;
        /* On vérifie que le JWT est présent dans les cookies de la requête */
        if (!cookies || !cookies.access_token) {
          if (path == '/users/isLogin')
          {
            return res.send({ log: false });   
          }
          else if (path == '/users/guest' && req.method == "POST" )
            return next();
          // return res.status(401).json({ message: 'Missing token in cookie' });
          return next();
        }

        if (cookies && cookies.access_token) {
          const accessToken = cookies.access_token;
          /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
          const decodedToken = jwt.verify(accessToken, process.env.SESSION_SECRET, {
            algorithms: ['HS256']
          });

          const session = decodedToken['ses'];
          // if (session != req.sessionID && path != '/users/isRegister') {
          //   res.clearCookie("access_token");
          //   return res.status(401).json({ message: 'Problem de session' });
          // }

          const state = decodedToken['state'];
          const login = decodedToken['login'];
          const guest = decodedToken['guest'];
          const username = decodedToken['username'];
          const id = decodedToken['id'];
          const user = { login: login, state: state, id: id, guest: guest, username: username};

          req.User = user; // username;
        }

      } catch (err) {
        return res.status(500).json({ message: 'Internal error' });
      }
    }
    return next();
  }
}