import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { store } from "~root/state";


@Injectable()
export class AuthorizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.ENV === 'development') {
      return next();
    }


    if(!req.header('X-API-KEY') || !req.header('X-CLIENT-ID')) {
     return  res.status(401).send('Unauthorized 1')
    }

    const found = store.getState().clients.find(client => client.authKey === req.header('X-API-KEY') && client.slug === req.header('X-CLIENT-ID'));

    if (!found) {
      return  res.status(401).send('Unauthorized 2')
    }

    (req.session as any).clientId =req.header('X-CLIENT-ID');
    (req.session as any).client = found;

   next();

  }
}
