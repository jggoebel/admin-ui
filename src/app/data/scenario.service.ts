import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpParameterCodec,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ServerResponse } from './serverresponse';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Scenario } from './scenario';
import { Step } from './step';
import { deepCopy } from '../deepcopy';
import { atou, utoa } from '../unicode';
import { BehaviorSubject, throwError } from 'rxjs';

class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ScenarioService {
  private cachedScenarioList: Scenario[] = [];
  private fetchedList = false;
  private startedFetchedList = false;
  private bh: BehaviorSubject<Scenario[]> = new BehaviorSubject(
    this.cachedScenarioList
  );

  constructor(public http: HttpClient) {}

  public watch() {
    return this.bh.asObservable();
  }

  public list(force = false) {
    if (!force && (this.fetchedList || this.startedFetchedList)) {
      return this.bh.pipe(first());
    } else {
      this.startedFetchedList = true;
      return this.http.get(environment.server + '/a/scenario/list').pipe(
        map((s: ServerResponse) => {
          let obj: Scenario[] = JSON.parse(atou(s.content)); // this doesn't encode a map though
          // so now we need to go vmset-by-vmset and build maps
          obj.forEach((s: Scenario) => {
            s.virtualmachines.forEach((v: Object) => {
              v = new Map(Object.entries(v));
            });
          });
          return obj;
        }),
        map((sList: Scenario[]) => {
          sList.forEach((s: Scenario) => {
            s.name = atou(s.name);
            s.description = atou(s.description);
            s.categories = s.categories ?? [];
            s.tags = s.tags ?? [];
          });
          return sList;
        }),
        tap((s: Scenario[]) => {
          this.set(s);
        })
      );
    }
  }

  public set(list: Scenario[]) {
    this.cachedScenarioList = list;
    this.fetchedList = true;
    this.bh.next(list);
  }

  public get(id: string) {
    return this.http.get(environment.server + '/a/scenario/' + id).pipe(
      map((s: ServerResponse) => {
        return JSON.parse(atou(s.content));
      }),
      map((s: Scenario) => {
        // atou all the relevant fields
        s.name = atou(s.name);
        s.description = atou(s.description);
        s.steps.forEach((st: Step) => {
          st.content = atou(st.content);
          st.title = atou(st.title);
        });
        s.categories = s.categories ?? [];
        s.tags = s.tags ?? [];
        //Admin Route in Garg ("/a/scenario") returns Scenarios without StepCount
        s.stepcount = s.steps.length;
        return s;
      })
    );
  }

  public update(iScenario: Scenario) {
    var s = <Scenario>deepCopy(iScenario);
    // step by step, re-encode to b64
    s.steps.forEach((st: Step) => {
      st.title = utoa(st.title);
      st.content = utoa(st.content);
    });

    var params = new HttpParams({ encoder: new CustomEncoder() })
      .set('name', utoa(s.name))
      .set('description', utoa(s.description))
      .set('steps', JSON.stringify(s.steps))
      .set('categories', JSON.stringify(s.categories))
      .set('tags', JSON.stringify(s.tags))
      .set('virtualmachines', JSON.stringify(s.virtualmachines))
      .set('pause_duration', s.pause_duration)
      .set('keepalive_duration', s.keepalive_duration);

    return this.http.put(environment.server + '/a/scenario/' + s.id, params);
  }

  public create(s: Scenario) {
    var params = new HttpParams()
      .set('name', utoa(s.name))
      .set('description', utoa(s.description))
      .set('pause_duration', s.pause_duration)
      .set('keepalive_duration', s.keepalive_duration);

    return this.http.post(environment.server + '/a/scenario/new', params).pipe(
      catchError((e: HttpErrorResponse) => {
        return throwError(e.error);
      }),
      map((s: ServerResponse) => {
        return s.message;
      }),
      map((scenarioID: string) => {
        s.id = scenarioID;
        s.categories = [];
        s.tags = [];
        return s;
      }),
      tap((scenario: Scenario) => {
        this.cachedScenarioList.push(scenario);
        this.set(this.cachedScenarioList);
      })
    );
  }

  public printable(id: string) {
    return this.http.get(
      environment.server + '/a/scenario/' + id + '/printable',
      { responseType: 'text' }
    );
  }
}
