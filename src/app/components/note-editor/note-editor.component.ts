import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note, NotePayload } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html'
})
export class NoteEditorComponent {
  @Input() note: Note = { assunto: '', resumo: '', categoria: '' };
  @Input() editing = false;
  @Input() saving = false;
  @Output() saved = new EventEmitter<NotePayload>();
  @Output() cancelled = new EventEmitter<void>();

  submit(): void {
    if (!this.note.assunto.trim() || !this.note.resumo.trim()) return;
    this.saved.emit({
      assunto: this.note.assunto.trim(),
      resumo: this.note.resumo.trim(),
      categoria: this.note.categoria?.trim() || undefined
    });
  }
}
