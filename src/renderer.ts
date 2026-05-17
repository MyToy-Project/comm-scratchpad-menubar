import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { clipboard } from 'electron';

// Type definitions
interface Recap {
  id: string;
  name: string;
  text: string;
}

interface Note {
  id: string;
  text: string;
  timestamp: number;
  recaps: Recap[];
}

interface StorageData {
  notes: Note[];
}

declare const feather: any;

const STORAGE_FILE = path.join(os.homedir(), '.comm-scratchpad.json');

let inputArea: HTMLTextAreaElement;
let saveBtn: HTMLButtonElement;
let notesList: HTMLElement;

const expandedNotes = new Set<string>();
const copySelectors = new Set<string>();

function getData(): StorageData {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return { notes: [] };
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    if (!data) return { notes: [] };
    
    const parsed = JSON.parse(data);
    let notes: Note[] = [];
    
    if (Array.isArray(parsed)) {
      notes = parsed;
    } else {
      notes = parsed.notes || [];
    }

    return {
      notes: notes.map(n => ({
        ...n,
        recaps: (n.recaps || []).map(r => ({
          ...r,
          name: r.name || (r as any).title || ''
        }))
      }))
    };
  } catch (e) {
    console.error('Failed to read data:', e);
    return { notes: [] };
  }
}

function saveData(data: StorageData): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function saveNote(text: string): void {
  const data = getData();
  const newNote: Note = {
    id: crypto.randomUUID(),
    text: text,
    timestamp: Date.now(),
    recaps: []
  };
  data.notes.unshift(newNote);
  saveData(data);
  renderNotes();
}

function updateNoteText(id: string, text: string): void {
  const data = getData();
  const note = data.notes.find(n => n.id === id);
  if (note) {
    note.text = text;
    saveData(data);
  }
}

function deleteNote(id: string): void {
  if (!confirm('Are you sure you want to delete this note?')) return;
  const data = getData();
  data.notes = data.notes.filter(n => n.id !== id);
  saveData(data);
  renderNotes();
}

function addRecap(noteId: string): void {
  const data = getData();
  const note = data.notes.find(n => n.id === noteId);
  if (note) {
    note.recaps.push({
      id: crypto.randomUUID(),
      name: '',
      text: ''
    });
    expandedNotes.add(noteId);
    saveData(data);
    renderNotes();
  }
}

function updateRecap(noteId: string, recapId: string, text: string): void {
  const data = getData();
  const note = data.notes.find(n => n.id === noteId);
  if (note) {
    const recap = note.recaps.find(r => r.id === recapId);
    if (recap) {
      recap.text = text;
      saveData(data);
    }
  }
}

function updateRecapName(noteId: string, recapId: string, name: string): void {
  const data = getData();
  const note = data.notes.find(n => n.id === noteId);
  if (note) {
    const recap = note.recaps.find(r => r.id === recapId);
    if (recap) {
      recap.name = name;
      saveData(data);
    }
  }
}

function deleteRecap(noteId: string, recapId: string): void {
  if (!confirm('Delete this recap?')) return;
  const data = getData();
  const note = data.notes.find(n => n.id === noteId);
  if (note) {
    note.recaps = note.recaps.filter(r => r.id !== recapId);
    saveData(data);
    renderNotes();
  }
}

function toggleRecaps(noteId: string): void {
  if (expandedNotes.has(noteId)) {
    expandedNotes.delete(noteId);
  } else {
    expandedNotes.add(noteId);
  }
  renderNotes();
}

function toggleCopySelector(noteId: string): void {
  if (copySelectors.has(noteId)) {
    copySelectors.delete(noteId);
  } else {
    copySelectors.add(noteId);
  }
  renderNotes();
}

function executeCopy(noteId: string): void {
  const noteElement = document.getElementById(`note-${noteId}`);
  if (!noteElement) return;

  const checkboxes = noteElement.querySelectorAll('.copy-checkbox:checked') as NodeListOf<HTMLInputElement>;
  
  const data = getData();
  const note = data.notes.find(n => n.id === noteId);
  if (!note) return;

  let copyParts: string[] = [];
  
  checkboxes.forEach(cb => {
    const type = cb.dataset.type;
    const id = cb.dataset.id;

    if (type === 'memo') {
      copyParts.push(note.text);
    } else if (type === 'recap') {
      const recap = note.recaps.find(r => r.id === id);
      if (recap) {
        const recapTitle = recap.name ? `[${recap.name}]` : `[Recap]`;
        copyParts.push(`${recapTitle}\n${recap.text}`);
      }
    }
  });

  if (copyParts.length > 0) {
    const finalContent = copyParts.join('\n\n---\n\n');
    clipboard.writeText(finalContent);
    
    const btn = noteElement.querySelector('.copy-execute-btn') as HTMLButtonElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Copied! <i data-feather="check" class="w-3 h-3"></i>';
    btn.classList.replace('bg-blue-600', 'bg-green-600');
    feather.replace();

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.replace('bg-green-600', 'bg-blue-600');
      feather.replace();
      copySelectors.delete(noteId);
      renderNotes();
    }, 1500);
  }
}

function autoResize(textarea: HTMLTextAreaElement): void {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Expose functions to window for onclick handlers
(window as any).deleteNote = deleteNote;
(window as any).addRecap = addRecap;
(window as any).updateNoteText = updateNoteText;
(window as any).updateRecap = updateRecap;
(window as any).updateRecapName = updateRecapName;
(window as any).deleteRecap = deleteRecap;
(window as any).toggleRecaps = toggleRecaps;
(window as any).toggleCopySelector = toggleCopySelector;
(window as any).executeCopy = executeCopy;
(window as any).autoResize = autoResize;

function renderNotes(): void {
  if (!notesList) return;
  const { notes } = getData();
  
  if (notes.length === 0) {
    notesList.innerHTML = `
      <div class="text-center py-10 text-gray-400 flex flex-col items-center">
        <i data-feather="inbox" class="w-8 h-8 mb-2 opacity-50"></i>
        <p class="text-sm">No moments captured yet.</p>
      </div>
    `;
    feather.replace();
    return;
  }

  notesList.innerHTML = notes.map(note => {
    const isExpanded = expandedNotes.has(note.id);
    const isCopyOpen = copySelectors.has(note.id);
    const hasRecaps = note.recaps.length > 0;

    return `
      <div id="note-${note.id}" class="bg-white p-4 mb-4 rounded-2xl border border-gray-200 shadow-sm group relative">
        <div class="flex justify-between items-start mb-2">
          <textarea
            oninput="updateNoteText('${note.id}', this.value); autoResize(this);"
            class="text-sm text-gray-800 leading-relaxed flex-1 bg-transparent outline-none resize-none border-b border-transparent focus:border-gray-300 p-0 m-0 overflow-hidden"
          >${note.text}</textarea>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button 
              onclick="toggleCopySelector('${note.id}')"
              class="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="Copy Selection"
            >
              <i data-feather="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              onclick="deleteNote('${note.id}')"
              class="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Delete Note"
            >
              <i data-feather="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-[10px] text-gray-400 mb-2">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <i data-feather="clock" class="w-3 h-3"></i>
              ${new Date(note.timestamp).toLocaleString()}
            </div>
            <button 
              onclick="addRecap('${note.id}')"
              class="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-full transition-colors"
            >
              <i data-feather="plus" class="w-2.5 h-2.5"></i> Add Recap
            </button>
          </div>

          ${hasRecaps ? `
            <button 
              onclick="toggleRecaps('${note.id}')"
              class="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded-full transition-colors"
            >
              <i data-feather="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-3 h-3"></i>
              ${isExpanded ? 'Collapse' : `Show Recaps (${note.recaps.length})`}
            </button>
          ` : ''}
        </div>

        <!-- Copy Selector Interface -->
        ${isCopyOpen ? `
          <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
            <h4 class="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2">Select parts to copy</h4>
            <label class="flex items-center gap-2 cursor-pointer group/item">
              <input type="checkbox" class="copy-checkbox w-3 h-3 accent-blue-600" data-type="memo" checked>
              <span class="text-[11px] text-blue-700 font-medium truncate">Original Memo</span>
            </label>
            ${note.recaps.map((recap, i) => `
              <label class="flex items-center gap-2 cursor-pointer group/item">
                <input type="checkbox" class="copy-checkbox w-3 h-3 accent-blue-600" data-type="recap" data-id="${recap.id}" checked>
                <span class="text-[11px] text-blue-700 font-medium truncate">Recap #${i + 1}${recap.name ? `: ${recap.name}` : ''}</span>
              </label>
            `).join('')}
            <div class="flex gap-2 mt-3 pt-2 border-t border-blue-100">
              <button 
                onclick="executeCopy('${note.id}')"
                class="copy-execute-btn flex-1 bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
              >
                Copy Selection <i data-feather="clipboard" class="w-3 h-3"></i>
              </button>
              <button 
                onclick="toggleCopySelector('${note.id}')"
                class="bg-white text-blue-600 border border-blue-200 text-[10px] font-bold px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Recaps Section -->
        <div class="${isExpanded ? 'block' : 'hidden'} space-y-3 mt-4">
          ${note.recaps.map((recap, index) => `
            <div class="bg-gray-50 rounded-lg p-2 border border-gray-100 relative group/recap">
              <div class="flex items-center justify-between mb-1 gap-2">
                <div class="flex items-center gap-1 shrink-0">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recap #${index + 1}:</span>
                </div>
                <input 
                  type="text"
                  value="${recap.name}"
                  placeholder="Give it a name..."
                  oninput="updateRecapName('${note.id}', '${recap.id}', this.value)"
                  class="text-[10px] font-bold text-gray-600 tracking-wider bg-transparent outline-none flex-1 border-b border-transparent focus:border-gray-300"
                />
                <button 
                  onclick="deleteRecap('${note.id}', '${recap.id}')"
                  class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Recap"
                >
                  <i data-feather="x" class="w-3 h-3"></i>
                </button>
              </div>
              <textarea
                placeholder="Type your recap here..."
                oninput="updateRecap('${note.id}', '${recap.id}', this.value); autoResize(this);"
                class="w-full bg-transparent text-xs outline-none resize-none placeholder:text-gray-300 min-h-[40px] overflow-hidden"
              >${recap.text}</textarea>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
  feather.replace();
  
  // Auto-resize all textareas after DOM is painted
  setTimeout(() => {
    document.querySelectorAll('textarea').forEach(ta => autoResize(ta as HTMLTextAreaElement));
  }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  inputArea = document.getElementById('inputArea') as HTMLTextAreaElement;
  saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  notesList = document.getElementById('notesList') as HTMLElement;

  feather.replace();

  // Event Listeners
  saveBtn.addEventListener('click', () => {
    if (!inputArea.value.trim()) return;
    saveNote(inputArea.value.trim());
    inputArea.value = '';
  });

  inputArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveBtn.click();
    }
  });

  window.addEventListener('focus', () => {
    setTimeout(() => inputArea.focus(), 50);
  });

  // Initial render
  renderNotes();
  inputArea.focus();
});
