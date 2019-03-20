import { Component, ViewChild, Input, ElementRef, Renderer, Self } from '@angular/core';
import { ControlValueAccessor, NgModel } from '@angular/forms';
import { Ng2Uploader } from 'ng2-uploader/ng2-uploader';
import { MessageService } from '../../../services'
@Component({
  selector: 'ba-image-input',
  styles: [require('./baImageInput.scss')],
  template: require('./baImageInput.html'),
  providers: [Ng2Uploader]
})
export class BaImageInput implements ControlValueAccessor {
  @Input() defaultPicture:string = '';
  @Input() picture:string = '';
  @Input() base64_format:boolean = false;
  @Input() canDelete:boolean = true;

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

      console.log(file);
      if(file.size > 5242880){
        console.log('The file size is exceeding maximum size of 5MB.');
        this.messageService.errorMessage('The file size is exceeding maximum size of 5MB.');
      }else{
        this._changePicture(file);
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
    this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
    return false;
  }

  public removePicture():boolean {
    this.picture = '';
    this.model.reset();
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
}
