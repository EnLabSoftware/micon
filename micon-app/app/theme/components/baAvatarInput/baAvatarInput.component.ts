import { Component, ViewChild, Input, ElementRef, Renderer, Self, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgModel } from '@angular/forms';
import { Ng2Uploader } from 'ng2-uploader/ng2-uploader';
import { MessageService } from '../../../services'

@Component({
  selector: 'ba-avatar-input',
  styles: [require('./baAvatarInput.scss')],
  template: require('./baAvatarInput.html'),
  providers: [Ng2Uploader]
})
export class BaAvatarInput implements ControlValueAccessor {
  @Input() defaultPicture:string = '';
  @Input() picture:string = '';
  @Input() base64_format:boolean = false;
  @Input() canDelete:boolean = true;
  @Output() onChange = new EventEmitter();

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;

  public model: NgModel;

  constructor(@Self() file:NgModel, private renderer:Renderer, private messageService: MessageService) {
    this.model = file;
    file.valueAccessor = this;
  }

  public ngOnInit():void {
  }

  public onFiles():void {
    let files = this._fileUpload.nativeElement.files;

    if (files.length) {
      let file = files[0];
      if(file.type.search("image") == -1){
        this.messageService.errorMessage('The file is not an image.');
      }else{
        this._changePicture(file);
        setTimeout(() => this.onChange.emit(), 500);
      }
    }
  }

  public writeValue(obj: any): void {
  }

  public registerOnChange(fn: any): void {
    this.onFiles();
  }

  public registerOnTouched(fn: any): void {
  }

  public bringFileSelector():boolean {
    console.log('bringFileSelector');
    this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
    return false;
  }

  protected _changePicture(file:File):void {
    const reader = new FileReader();
    reader.addEventListener('load', (event:Event) => {
      this.picture = (<any> event.target).result;
      if (this.base64_format)
        this.model.viewToModelUpdate(this.picture);
      else
        this.model.viewToModelUpdate(file);
    }, false);

    reader.addEventListener('loadend', (event:Event) => {
      this.picture = (<any> event.target).result;
    }, false);

    reader.readAsDataURL(file);
  }

  public onClick(){
    this.onChange.emit();
    return false;
  }
}
