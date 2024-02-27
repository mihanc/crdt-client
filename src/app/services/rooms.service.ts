import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../interfaces/rooms.interface';

@Injectable({
  providedIn: 'root',
})
export class RoomsService {
  constructor(private readonly http: HttpClient) {}

  public createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>('http://localhost:3000/rooms', {
      ...room,
    });
  }

  public getRoom(roomId: string): Observable<Room> {
    return this.http.get<Room>('http://localhost:3000/rooms/' + roomId);
  }

  public getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>('http://localhost:3000/rooms');
  }
}
