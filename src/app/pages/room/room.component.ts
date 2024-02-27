import { Component, OnDestroy, OnInit } from '@angular/core';
import { RoomsService } from '../../services/rooms.service';
import { ActivatedRoute } from '@angular/router';
import * as Y from 'yjs';
import { Doc } from 'yjs';
import { AsyncPipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { WebsocketProvider } from 'y-websocket';
import { toUint8Array } from 'js-base64';
import { User, Username } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { USER_COLORS } from '../../consts/colors.const';
import { Cursor } from '../../interfaces/rooms.interface';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [NgForOf, NgIf, AsyncPipe, NgStyle],
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  public ytext!: Y.Text;
  public ycursor!: Y.Map<Cursor>;
  public connectedUsers: Username[] = [];
  public cursors: Cursor[] = [];
  public userInfo: User = this.userService.userInfo$.value!;
  public isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private ydoc: Doc = new Y.Doc();
  private provider!: WebsocketProvider;
  private myUsername!: Username;

  constructor(
    private readonly roomService: RoomsService,
    private readonly router: ActivatedRoute,
    private readonly userService: UserService
  ) {}

  public ngOnInit(): void {
    this.initRoom();
  }

  private initRoom(): void {
    const roomId = this.router.snapshot.params['id'];
    this.roomService.getRoom(roomId).subscribe((response) => {
      Y.applyUpdate(this.ydoc, toUint8Array(response.yDoc));
      this.ytext = this.ydoc.getText('inputText');
      this.ycursor = this.ydoc.getMap('cursors');
      this.provider = new WebsocketProvider('ws://localhost:3000', 'yjs', this.ydoc, {
        params: {
          roomId: response.name,
        },
        connect: true,
      });
      this.initUsername();
      this.trackCursor();
      this.isLoaded$.next(true);
    });
  }

  private initUsername(): void {
    const myUsername = this.connectedUsers.find((user) => user.id === this.userInfo.uuid);
    if (!myUsername) {
      const user = {
        id: this.userInfo.uuid,
        clientId: this.provider.awareness.clientID,
        name: this.userInfo.username,
        color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
      };
      this.provider.awareness.setLocalStateField('user', user);
      this.myUsername = user;
    }
    this.provider.awareness.getStates().forEach((state: any) => {
      if (state.user) {
        this.connectedUsers.push({ ...state.user });
      }
    });
    this.listenUsernamesChanges();
  }

  private listenUsernamesChanges(): void {
    this.provider.awareness.on('change', (e: any) => {
      if (e.removed.length) {
        this.connectedUsers = this.connectedUsers.filter((user) => user.clientId !== e.removed[0]);
        this.cursors = this.cursors.filter((cursor) => cursor.clientId !== e.removed[0]);
      }
      this.provider.awareness.getStates().forEach((state: { [p: string]: any }) => {
        if (state['user']) {
          const myUsername = state['user'].id === this.userInfo.uuid;
          if (!myUsername) {
            const userExist = this.connectedUsers.find((user) => user.name === state['user'].name);
            if (!userExist) {
              this.connectedUsers.push({ ...state['user'] });
            }
          }
        }
      });
    });
  }

  private trackCursor(): void {
    document.addEventListener('mousemove', (event: MouseEvent) => {
      this.ycursor.set('user-cursor', {
        x: event.pageX,
        y: event.pageY,
        id: this.userInfo.uuid,
        clientId: this.provider.awareness.clientID,
        username: this.userInfo.username,
        color: this.myUsername.color,
      });
    });
    this.ycursor.observe(() => {
      this.cursors = [];
      this.ycursor.forEach((value: any) => {
        this.cursors.push(value);
      });
    });
  }

  public clearInput(): void {
    this.ytext.delete(0, this.ytext.toString().length);
  }

  public onInputChange(event: any): void {
    this.ytext.delete(0, this.ytext.toString().length);
    this.ytext.insert(0, event.target.value);
  }

  public ngOnDestroy(): void {
    this.provider.disconnect();
  }
}
