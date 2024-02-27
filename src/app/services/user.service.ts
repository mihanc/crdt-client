import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public userInfo$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  //ToDo: replace with normal auth
  public initUser(): void {
    if (!JSON.parse(localStorage.getItem('user')!)) {
      const user = { username: 'user' + Math.floor(Math.random() * 100), uuid: self.crypto.randomUUID() };
      localStorage.setItem('user', JSON.stringify(user));
      this.userInfo$.next(user);
    } else {
      const user = JSON.parse(localStorage.getItem('user')!) ?? null;
      this.userInfo$.next(user);
    }
  }
}
