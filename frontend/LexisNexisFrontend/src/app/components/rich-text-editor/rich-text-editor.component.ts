import { Component, forwardRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="editor-toolbar">
      <button type="button" class="toolbar-btn" (click)="execCommand('bold')" title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" class="toolbar-btn" (click)="execCommand('italic')" title="Italic">
        <em>I</em>
      </button>
      <button type="button" class="toolbar-btn" (click)="execCommand('underline')" title="Underline">
        <u>U</u>
      </button>
      <div class="toolbar-divider"></div>
      <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList')" title="Bullet List">
        ☰
      </button>
      <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList')" title="Numbered List">
        ≡
      </button>
      <div class="toolbar-divider"></div>
      <button type="button" class="toolbar-btn" (click)="createLink()" title="Insert Link">
        🔗
      </button>
    </div>
    <div
      #editor
      class="editor-content"
      contenteditable="true"
      (input)="onInput()"
      (blur)="onTouched()"
      [attr.placeholder]="placeholder">
    </div>
  `,
  styles: `
    :host {
      display: block;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .editor-toolbar {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .toolbar-btn {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #334155;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
    }

    .toolbar-btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .toolbar-btn:active {
      transform: scale(0.95);
    }

    .toolbar-divider {
      width: 1px;
      background: #e2e8f0;
      margin: 0 4px;
    }

    .editor-content {
      padding: 12px;
      min-height: 100px;
      max-height: 300px;
      overflow-y: auto;
      outline: none;
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }

    .editor-content:empty:before {
      content: attr(placeholder);
      color: #94a3b8;
      pointer-events: none;
    }

    .editor-content:focus {
      background: #fefefe;
    }

    .editor-content ul,
    .editor-content ol {
      padding-left: 24px;
      margin: 8px 0;
    }

    .editor-content a {
      color: #0284c7;
      text-decoration: underline;
    }

    .editor-content strong {
      font-weight: 600;
    }

    .editor-content em {
      font-style: italic;
    }

    .editor-content u {
      text-decoration: underline;
    }
  `
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;
  
  placeholder = 'Optional description';
  
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit() {
    // Set initial content if any
  }

  writeValue(value: string): void {
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = value || '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editorElement) {
      this.editorElement.nativeElement.contentEditable = (!isDisabled).toString();
    }
  }

  onInput(): void {
    const html = this.editorElement.nativeElement.innerHTML;
    this.onChange(html);
  }

  execCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorElement.nativeElement.focus();
    this.onInput();
  }

  createLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }
}
