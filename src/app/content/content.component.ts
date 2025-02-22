import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RbacService } from '../data/rbac.service';
import { ScenarioService } from '../data/scenario.service';
import { CourseService } from '../data/course.service';
import { Scenario } from '../data/scenario';
import { Course } from '../data/course';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  constructor(
    public rbacService: RbacService,
    private route: Router,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.contentNavigation();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.contentNavigation();
  }

  navigateScenarios() {
    this.route.navigate(['scenarios'], { relativeTo: this.activateRoute });
  }
  navigateCourses() {
    this.route.navigate(['courses'], {
      relativeTo: this.activateRoute,
    });
  }
  contentNavigation() {
    this.rbacService
      .Grants('scenarios', 'list')
      .then((scenarioAllowed: boolean) => {
        if (scenarioAllowed) {
          this.navigateScenarios();
        } else {
          this.rbacService
            .Grants('courses', 'list')
            .then((courseAllowed: boolean) => {
              if (courseAllowed) {
                this.navigateCourses();
              }
            });
        }
      });
  }
}
