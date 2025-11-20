import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, SimpleChanges } from '@angular/core';
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
    visible: boolean = false;
    zoomLevel: number = 100;
    rotation: number = 0;
    fineTune: number = 0;
    zoomScale: number = 1;
    visibleChange = new EventEmitter<boolean>();
    croppedImage: string = '';
    imageChangedEvent: any = '';

    constructor(
        public ms: MechanicsService,
        private cdr: ChangeDetectorRef
    ) { }

    async ngOnInit(): Promise<void> {
        console.log("crop dialog box called");
        if (this.imageUrl) {
            console.log("recieved image url", this.imageUrl);
            this.loadImageAsEvent(this.imageUrl);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['imageUrl'] && changes['imageUrl'].currentValue) {
            // whenever parent updates imageUrl, convert it to a fake file event
            this.loadImageAsEvent(changes['imageUrl'].currentValue);
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
        this.croppedImage = event.base64!;
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
        console.log('Saving cropped image...');
        this.visible = false;
    }
}
