import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/userServices';
import { Leave } from '../model/leave';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../model/user';
import { Time } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private UserService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  successMessage: string | null = null;
  errorMessage: string | null = null;
  leaves: Leave[] = [];
  resultPage: number = 1;
  resultSize: number = 10;
  hasMoreResult: boolean = true;
  fetchingResult: boolean = false;
  private subscriptions: Subscription[] = [];
  leave: any;
  isSidebarExpanded: boolean = true;
  pendingCount: number = 0;
  pendingLeaves: any;
  isVisible: boolean = false;
  users: any[] = [];
  selectedUserId: any | null = null;
  timeSheets: Time[] = [];

  ngOnInit() {
    this.loadLeaves(this.resultPage);
    this.getUsers();
  }

  onToggleSidebar(expanded: boolean) {
    this.isSidebarExpanded = expanded;
  }

  dismissSuccessMessage() {
    this.successMessage = null;
  }

  dismissErrorMessage() {
    this.errorMessage = null;
  }

  loadLeaves(currentPage: number) {
    this.subscriptions.push(
      this.UserService.getAllLeaves(currentPage, this.resultSize).subscribe(
        (l: Leave[]) => {
          this.leaves = [...l, ...this.leaves];
          this.leave = this.leaves;
          this.leave = this.leaves;
          this.pendingCount = this.leave.filter(
            (leave: any) => leave.status === 'PENDING'
          ).length;

          this.pendingLeaves = this.leave.filter(
            (leave: any) => leave.status === 'PENDING'
          );
          if (this.leaves.length <= 0 && this.resultPage === 1) {
            this.hasMoreResult = false;
          }
          this.fetchingResult = false;
          this.resultPage++;
        },
        (error) => {
          console.log(error.error.message);
        }
      )
    );
  }

  showNotifications() {
    this.router.navigate(['/leave']);
  }
  toggleVisibility() {
    if (this.pendingLeaves.length > 3) {
      this.router.navigate(['/leave']);
    } else {
      this.isVisible = !this.isVisible;
    }
  }

  getUsers(): void {
    this.UserService.getAllUsersList().subscribe((data) => {
      this.users = data;
    });
  }

  onUserChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedUserId = Number(selectElement.value);
    alert(this.selectedUserId);
  }

  loadTimeSheet(eId: number): void {
    if (eId) {
      this.subscriptions.push(
        this.UserService.getTimeSheetById(eId).subscribe(
          (t: Time[]) => {
            this.timeSheets.push(...t);
            this.resultPage++;
          },
          (error) => {
            console.error('Error fetching time sheets:', error);
          }
        )
      );
    } else {
      console.error('No UserId selected');
    }
  }

  navigateToTs(data: number): void {
    this.router.navigate(['/timesheet', { eId: data }], {
      relativeTo: this.route,
      queryParams: { eId: data }, 
    });
  }
}

