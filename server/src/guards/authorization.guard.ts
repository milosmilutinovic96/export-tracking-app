import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "node_modules/@nestjs/common";


@Injectable()
export class AuthorizationGuard implements CanActivate {

    constructor(private allowedRoles: string[]) {}

    canActivate(context: ExecutionContext): boolean {
        const host = context.switchToHttp();
        const request = host.getRequest();
        const user = request.user;
        
       const allowed = user && user.roles && this.isAllowed(user.roles);
        console.log("AuthorizationGuard: Checking if user has required roles...");
        console.log("User from request:", user);
        console.log("Allowed roles for this route:", this.allowedRoles);
        console.log("Does user have required roles?", allowed);
        if(!allowed) {
            console.log("User does not have required roles. Access denied.");
            throw new ForbiddenException("User does not have permission to access this resource");
        }

        return true;
    }

    isAllowed(userRoles: string[]): boolean {
        return userRoles.some(role => this.allowedRoles.includes(role));
    }

}