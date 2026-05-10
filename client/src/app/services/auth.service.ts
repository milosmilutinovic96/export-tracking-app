import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenFromJWT, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #userSignal = signal<User | null>(null);
  user = this.#userSignal.asReadonly();
  http = inject(HttpClient);
  router = inject(Router);

  constructor() {
    // Initialize from localStorage once when service starts
    this.loadUserFromStorage();
    
    // Optional: Sync to localStorage when user changes
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  private loadUserFromStorage(): void {
    const stringUser = localStorage.getItem('user');
    if (stringUser) {
      try {
        const user = JSON.parse(stringUser);
        this.#userSignal.set(user);
      } catch (error) {
        console.error('Failed to parse user', error);
        this.#userSignal.set(null);
      }
    }
  }

  async login(username: string, password: string): Promise<TokenFromJWT> {
    const login$ = this.http.post('/api/login', { username, password });
    const token: any = await firstValueFrom(login$);
    
    if (token.user) {
      this.#userSignal.set(token.user);
      localStorage.setItem('user', JSON.stringify(token.user)); // Save to storage
        localStorage.setItem('jwt', token.authJwtToken);
    }
    
    return token;
  }

  logout() {
    this.#userSignal.set(null);
    localStorage.removeItem('user'); // Clear from storage
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);

  }

  // ✅ Fixed: Pure computed that just reads the signal
  isLoggedIn = computed(() => {
    return this.user() !== null;
  });
}