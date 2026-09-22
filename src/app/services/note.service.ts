import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note, NotePayload } from '../models/note.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly resource = environment.apiUrl + '/caderno-dev';

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Note[]> { return this.http.get<Note[]>(this.resource); }
  create(payload: NotePayload): Observable<Note> { return this.http.post<Note>(this.resource, payload); }
  update(id: number, payload: NotePayload): Observable<Note> { return this.http.put<Note>(this.resource + '/' + id, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(this.resource + '/' + id); }
}
