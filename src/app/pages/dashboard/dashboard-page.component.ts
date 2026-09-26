import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NoteEditorComponent } from '../../components/note-editor/note-editor.component';
import { Note, NotePayload } from '../../models/note.model';
import { AuthService } from '../../services/auth.service';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteEditorComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';
  mobileLibraryOpen = false;
  mobileSearchOpen = false;
  username = '';
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  selectedNote?: Note;
  categories: string[] = [];
  search = '';
  selectedCategory = 'Todos';
  isLoading = false;
  isSaving = false;
  showEditor = false;
  showProfileMenu = false;
  deleteCandidate?: Note;
  editingId?: number;
  notice = '';
  error = '';
  form: Note = this.emptyNote();

  constructor(private readonly notesService: NoteService, private readonly auth: AuthService, private readonly router: Router) {}
  ngOnInit(): void {
    this.username = this.auth.getUsername();
    this.theme = this.readTheme();
    this.applyTheme();
    this.loadNotes();
  }
  get totalCharacters(): number { return this.notes.reduce((total, note) => total + note.resumo.length, 0); }
  get latestNote(): Note | undefined { return [...this.notes].sort((a, b) => this.dateValue(b) - this.dateValue(a))[0]; }

  loadNotes(): void {
    this.isLoading = true;
    this.notesService.list().subscribe({
      next: notes => { this.notes = notes ?? []; this.rebuildFilters(); this.selectedNote = this.selectedNote ? this.notes.find(note => note.id === this.selectedNote?.id) : this.notes[0]; this.isLoading = false; },
      error: (response: HttpErrorResponse) => { this.isLoading = false; if (response.status === 401) this.logout(); else this.error = this.readError(response, 'Não foi possível carregar suas anotações.'); }
    });
  }

  openNew(): void { this.clearMessages(); this.editingId = undefined; this.form = this.emptyNote(); this.showEditor = true; }
  openEdit(note: Note): void { this.clearMessages(); this.editingId = note.id; this.form = { ...note }; this.showEditor = true; }
  closeEditor(): void { if (!this.isSaving) this.showEditor = false; }

  saveNote(payload: NotePayload): void {
    this.clearMessages();
    this.isSaving = true;
    const request = this.editingId ? this.notesService.update(this.editingId, payload) : this.notesService.create(payload);
    request.subscribe({
      next: note => {
        if (this.editingId) this.notes = this.notes.map(item => item.id === note.id ? note : item);
        else this.notes = [note, ...this.notes];
        this.selectedNote = note;
        this.rebuildFilters(); this.showEditor = false; this.isSaving = false;
        this.notice = this.editingId ? 'Anotação atualizada.' : 'Anotação criada.';
      },
      error: (response: HttpErrorResponse) => { this.isSaving = false; this.error = this.readError(response, 'Não foi possível salvar a anotação.'); }
    });
  }

  deleteNote(note: Note): void {
    if (!note.id) return;
    this.clearMessages();
    this.deleteCandidate = note;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate?.id) return;
    const note = this.deleteCandidate;
    const noteId = note.id;
    if (!noteId) return;
    this.notesService.delete(noteId).subscribe({
      next: () => { this.notes = this.notes.filter(item => item.id !== note.id); this.selectedNote = this.notes[0]; this.rebuildFilters(); this.notice = 'Anotação excluída.'; },
      error: (response: HttpErrorResponse) => this.error = this.readError(response, 'Não foi possível excluir a anotação.'),
      complete: () => this.deleteCandidate = undefined
    });
  }

  cancelDelete(): void { this.deleteCandidate = undefined; }

  logout(): void { this.auth.logout(); this.router.navigate(['/auth']); }
  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    if (typeof localStorage !== 'undefined') localStorage.setItem('caderno-dev-theme', this.theme);
  }
  selectNote(note: Note): void { this.selectedNote = note; this.mobileLibraryOpen = false; }
  toggleMobileLibrary(): void { this.mobileLibraryOpen = !this.mobileLibraryOpen; }
  closeMobileLibrary(): void { this.mobileLibraryOpen = false; }
  selectCategory(category: string): void { this.selectedCategory = category; this.applyFilters(); }
  applyFilters(): void {
    const term = this.search.trim().toLowerCase();
    this.filteredNotes = this.notes.filter(note => {
      const matchesTerm = !term || [note.assunto, note.resumo, note.categoria].some(value => value?.toLowerCase().includes(term));
      return matchesTerm && (this.selectedCategory === 'Todos' || note.categoria === this.selectedCategory);
    });
    if (!this.selectedNote || !this.filteredNotes.some(note => note.id === this.selectedNote?.id)) {
      this.selectedNote = this.filteredNotes[0];
    }
  }
  clearSearch(): void { this.search = ''; this.applyFilters(); }
  categoryCount(category: string): number { return this.notes.filter(note => note.categoria === category).length; }
  categoryClass(category?: string): string { return 'tag-' + (category ?? 'Geral').toLowerCase().replace(/\s+/g, '-'); }
  formatDate(value?: string): string { return value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(value)) : 'Agora'; }
  trackById(_: number, note: Note): number | undefined { return note.id; }
  clearMessages(): void { this.notice = ''; this.error = ''; }
  private rebuildFilters(): void {
    this.categories = [...new Set(this.notes.map(note => note.categoria?.trim()).filter(Boolean) as string[])].sort();
    if (this.selectedCategory !== 'Todos' && !this.categories.includes(this.selectedCategory)) this.selectedCategory = 'Todos';
    this.applyFilters();
  }
  private emptyNote(): Note { return { assunto: '', resumo: '', categoria: '' }; }
  private dateValue(note: Note): number { return new Date(note.atualizadoEm ?? note.criadoEm ?? 0).getTime(); }
  private readError(response: HttpErrorResponse, fallback: string): string { return typeof response.error === 'string' ? response.error : response.error?.message ?? fallback; }
  private readTheme(): 'light' | 'dark' {
    if (typeof localStorage === 'undefined') return 'light';
    return localStorage.getItem('caderno-dev-theme') === 'dark' ? 'dark' : 'light';
  }
  private applyTheme(): void {
    if (typeof document !== 'undefined') document.documentElement.dataset['theme'] = this.theme;
  }
}
