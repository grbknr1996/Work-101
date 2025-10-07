import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-panel-header-icons',
    standalone: false,
    templateUrl: './panel-header-icons.component.html',
    styles: [
        `
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  background-color: #ebf8ff;
  padding: 0.5rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-weight: 500;
  font-size: 1rem;
  color: #2d3748;
}

.icon-group {
  display: flex;
  gap: 1rem;
}

.clickable-icon {
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.clickable-icon:hover {
  color: #4299e1;
}`
    ]
})
export class PanelHeaderIconsComponent {

    ngOnInit() { }
    @Input() panelName: string = '';
    @Input() panelIndex: number = 0;
    @Input() panelTypes: { type: string, icon: string, tooltip: string }[] = [];
    @Output() switchContent = new EventEmitter<{ index: number, content: string }>();
    @Output() expandPanel = new EventEmitter<number>();
    @Input() isExpanded: boolean = false;

    changePanelView(type: string) {
        if (type === 'Expand Panel') {
            this.expandPanel.emit(this.panelIndex);
        } else {
            this.switchContent.emit({ index: this.panelIndex, content: type });
        }
    }

}
