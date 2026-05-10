import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "node_modules/@nestjs/common";

@Injectable()
export class AuthenticationGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const host = context.switchToHttp();
        const request = host.getRequest();
        const user = request.user;
        // console.log("AuthenticationGuard: Checking if user is authenticated...");
        // console.log("User from request:", user);
        if(!user) {
            console.log("No user found in request. Access denied.");
            throw new UnauthorizedException("User is not authenticated");
        }
        console.log("User is authenticated. Access granted.");
        return true;
    }

}