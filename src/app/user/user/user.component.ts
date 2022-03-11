import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/data/user.service';
import { User } from 'src/app/data/user';
import { ServerResponse } from 'src/app/data/serverresponse';
import { UserEmailFilter } from 'src/app/user-email-filter';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { EditAccessCodesComponent } from '../edit-access-codes/edit-access-codes.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {
  public users: User[] = [];

  public selectedUser: User = new User();

  constructor(
    public userService: UserService
  ) { }

  public emailFilter: UserEmailFilter = new UserEmailFilter();

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.userService.getUsers()
      .subscribe(
        (u: User[]) => {
          this.users = u;
        },
        (s: ServerResponse) => {
          // do something about failure
        }
      )
  }

}
