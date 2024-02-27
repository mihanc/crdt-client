import { Component, OnInit } from '@angular/core';
import { RoomsService } from '../../services/rooms.service';
import * as Y from 'yjs';
import { FormsModule } from '@angular/forms';
import { fromUint8Array } from 'js-base64';
import { BehaviorSubject } from 'rxjs';
import { Room } from '../../interfaces/rooms.interface';
import { AsyncPipe, JsonPipe, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [FormsModule, NgForOf, AsyncPipe, RouterLink, JsonPipe],
  templateUrl: './rooms.component.html',
})
export class RoomsComponent implements OnInit {
  public roomName!: string;
  public rooms$: BehaviorSubject<Room[]> = new BehaviorSubject<Room[]>([]);
  constructor(private readonly roomService: RoomsService) {}

  public createRoom(): void {
    const yDoc = new Y.Doc();
    const room = { name: this.roomName, yDoc: fromUint8Array(Y.encodeStateAsUpdate(yDoc)) };
    this.roomService.createRoom(room).subscribe(() => {
      console.log(`Room ${this.roomName} has been successfully created!`);
    });
  }

  public ngOnInit(): void {
    this.roomService.getRooms().subscribe((res) => {
      this.rooms$.next(res);
    });
  }
}
