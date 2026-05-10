import { Injectable, NestMiddleware } from "node_modules/@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: (error?: any) => void) {
        console.log("GetUserMiddleware: Checking for JWT token in request headers...");
        console.log("Request headers:", req.headers);
        const authJwtToken = (req.headers as any).authorization;
        console.log("Extracted JWT token:", authJwtToken);
        if(!authJwtToken) {
            console.log("No JWT token found in request headers.");

            next();
            return;
        }

        try {
            const user = jwt.verify(authJwtToken, process.env.JWT_S);
            if(user) {
                console.log("User found in JWT token:", user);
                req["user"] = user;
            }
        } catch (error) {
            console.error("Error verifying JWT token:", error);
        }
        next();
    }

  
}