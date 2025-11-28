import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { MechanicsService } from 'src/app/_services/mechanics.service';

@Component({
    selector: 'app-crop-dialog',
    standalone: false,
    templateUrl: './crop-dialog.component.html',
})
export class CropDialogComponent implements OnInit {
    @Input() imageUrl!: string;
    @Input() pageNumber!: number;
    @Input() documentIndex!: number;
    visible: boolean = false;
    zoomLevel: number = 100;
    rotation: number = 0;
    fineTune: number = 0;
    zoomScale: number = 1;
    visibleChange = new EventEmitter<boolean>();
    croppedImage: string = '';
    imageChangedEvent: any = '';
    @Output() imageSaved = new EventEmitter<string>();
    @Output() numberExtracted = new EventEmitter<{ index: number; number: string }>();

    constructor(
        public ms: MechanicsService,
        private cdr: ChangeDetectorRef
    ) { }

    async ngOnInit(): Promise<void> {
        console.log("crop dialog box called", this.imageUrl, this.pageNumber);
        if (this.imageUrl) {
            console.log("recieved image url", this.imageUrl);
            this.loadImageAsEvent(this.imageUrl);
        }
    }


    private loadImageAsEvent(url: string) {
        console.log("Loading image as event:", url);
        if (!url) return;

        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'document.png', { type: blob.type });
                this.imageChangedEvent = { target: { files: [file] } };
                console.log("Image event created successfully:", this.imageChangedEvent);
                console.log("File type:", this.imageChangedEvent.target.files[0].type);

                this.cdr.detectChanges();
            })
            .catch(err => console.error('Failed to load image:', err));
    }



    open(imageUrl?: string) {
        if (imageUrl) { this.imageUrl = imageUrl; }
        this.croppedImage = '';
        this.imageChangedEvent = null;
        this.cdr.detectChanges();
        this.visible = true;
        this.visibleChange.emit(true);
        console.log("dialog box open with url:", this.imageUrl);
        if (this.imageUrl) {
            this.loadImageAsEvent(this.imageUrl);
        }
    }


    onClose() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    zoomIn() {
        this.zoomLevel += 10;
        this.zoomLevel = Math.round(this.zoomScale * 100);
    }

    zoomOut() {
        if (this.zoomScale > 0.2) {
            this.zoomScale -= 0.1;
            this.zoomLevel = Math.round(this.zoomScale * 100);
        }
    }

    rotateLeft() {
        this.fineTune = (this.fineTune - 90 + 360) % 360;
    }

    rotateRight() {
        this.fineTune = (this.fineTune + 90) % 360;
    }

    resetAll() {
        this.zoomLevel = 100;
        this.fineTune = 0;
        this.zoomScale = 1;
    }
    imageCropped(event: ImageCroppedEvent) {
    console.log("Image cropped:", event);

    if (event.base64) {
        this.croppedImage = event.base64;
        return;
    }

    // Fallback if cropper returns blob instead of base64
    if (event.blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
        this.croppedImage = reader.result as string; // base64 output
        console.log("Converted base64:", this.croppedImage);
        };
        reader.readAsDataURL(event.blob);
    }
    }


    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
        console.log('File selected:', event.target.files[0]);
    }
    cropperReady() {
        console.log('Cropper ready');
    }

    loadImageFailed() {
        console.log("load image failed");
    }
    imageLoaded(image: LoadedImage) {
        // show cropper
    }

    saveCroppedImage() {
        // TODO: Implement actual cropping logic
        console.log('Saving cropped image...', this.croppedImage);
        this.imageSaved.emit(this.croppedImage);
        this.visible = false;
    }

    saveNumber() {
        // Mock OCR: Generate random document number
    const mockNumber = this.generateMockDocumentNumber();
        console.log('Mock OCR extracted number:', mockNumber);
        
        // Emit the extracted number with document index
        this.numberExtracted.emit({
            index: this.documentIndex,
            number: mockNumber
        });
        
        this.visible = false;
    }

    private generateMockDocumentNumber(): string {
        const prefixes = ['VC-D', 'VC-T', 'VC-P'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const year = new Date().getFullYear();
        const number = String(Math.floor(Math.random() * 900) + 100);
        return `${prefix}-${year}-${number}`;
    }
}
