import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-panel-header-icons',
    standalone: false,
    templateUrl: './panel-header-icons.component.html',
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
