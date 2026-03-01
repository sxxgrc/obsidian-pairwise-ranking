import { Modal, Plugin, TFile, Notice, MarkdownView } from 'obsidian';

export default class PairwiseRankingPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'add-to-ranking',
      name: 'Add to Ranking',
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          if (!checking) this.promptForNewItem();
          return true;
        }
        return false;
      }
    });
  }

  private async promptForNewItem() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice('Open a note first');
      return;
    }

    // Read current items immediately
    const items = await this.readItemsFromFile(file);
    
    // Create a minimal input modal
    const modal = new Modal(this.app);
    modal.titleEl.setText('Add to Ranking');
    
    // Create input WITH proper event handling
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter new item...';
    input.className = 'ranking-input';
    
    // Force focus in a way that works with Obsidian
    requestAnimationFrame(() => {
      input.focus();
    });
    
    const button = document.createElement('button');
    button.textContent = 'Add';
    button.className = 'ranking-button';
    
    const container = modal.contentEl;
    container.appendChild(input);
    container.appendChild(button);
    
    // Handle submission
    const onSubmit = async () => {
      const newItem = input.value.trim();
      if (!newItem) return;
      
      modal.close();
      
      if (items.length === 0) {
        // No items to rank against, just add
        items.push(newItem);
        await this.writeItemsToFile(file, items);
        new Notice(`Added "${newItem}"`);
      } else {
        // Perform ranking
        const position = await this.findInsertionPosition(newItem, items);
        items.splice(position, 0, newItem);
        await this.writeItemsToFile(file, items);
        new Notice(`Added "${newItem}" at position ${position + 1}`);
      }
    };
    button.addEventListener('click', onSubmit);
    
    modal.open();
  }

  private async readItemsFromFile(file: TFile): Promise<string[]> {
    try {
      const content = await this.app.vault.read(file);
      return content
        .split('\n')
        .map(line => line.trim().replace(/^\s*\d+\.\s*/, ''))
        .filter(line => line.length > 0);
    } catch (error) {
      console.error('Error reading file:', error);
      return [];
    }
  }

  private async writeItemsToFile(file: TFile, items: string[]): Promise<void> {
    await this.app.vault.modify(file,
      items
        .map((item, idx) => `${idx + 1}. ${item}`)
        .join('\n')
    );
  }

  private async findInsertionPosition(
    newItem: string, 
    items: string[]
  ): Promise<number> {
    let left = 0;
    let right = items.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const preference = await this.compareItems(newItem, items[mid]);
      
      if (preference === 'new') {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return left;
  }

  private async compareItems(a: string, b: string): Promise<'new' | 'existing'> {
    return new Promise((resolve) => {
      // Create and open comparison modal immediately
      const modal = new Modal(this.app);
      modal.titleEl.setText('Which is better?');
      
      const container = modal.contentEl;
      
      // Buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'comparison-buttons';
      
      const newButton = document.createElement('button');
      newButton.textContent = a;
      newButton.className = 'comparison-button comparison-button-a';
      
      const vsSpan = document.createElement('span');
      vsSpan.textContent = ' vs ';
      
      const existingButton = document.createElement('button');
      existingButton.textContent = b;
      existingButton.className = 'comparison-button comparison-button-b';
      
      buttonContainer.appendChild(newButton);
      buttonContainer.appendChild(vsSpan);
      buttonContainer.appendChild(existingButton);
      
      container.appendChild(buttonContainer);
      
      // Event handlers
      const finish = (choice: 'new' | 'existing') => {
        modal.close();
        resolve(choice);
      };
      
      newButton.addEventListener('click', () => finish('new'));
      existingButton.addEventListener('click', () => finish('existing'));
      
      // Open modal
      modal.open();
      
      // Focus first button for keyboard navigation
      requestAnimationFrame(() => {
        newButton.focus();
      });
    });
  }
}
