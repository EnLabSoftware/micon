import {Component, ViewChild, Input, ElementRef, Renderer, Self} from '@angular/core';
import {ControlValueAccessor, NgModel} from '@angular/forms';
import {Ng2Uploader} from 'ng2-uploader/ng2-uploader';

@Component({
  selector: 'ba-file-input',
  styles: [],
  template: require('./baFileInput.html'),
  providers: [Ng2Uploader]
})
export class BaFileInput implements ControlValueAccessor {
  @Input() name:string = '';
  @Input() accept:string = '';
  @Input() base64_format:boolean = false;

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;

  public model: NgModel;
  accept_list = [];

  constructor(@Self() file:NgModel, private renderer:Renderer) {
    this.model = file;
    file.valueAccessor = this;
  }

  public ngOnInit():void {
    this.accept_list = this.accept.split(', ').filter(function(x){
      return (x !== (undefined || ''));
    });
  }

  public onFiles():void {
    let files = this._fileUpload.nativeElement.files;

    if (files.length) {
      let file = files[0];
      let ext = '.' + file.name.split('.').pop();
      if (this.accept_list.length) {
        if (this.accept_list.indexOf(ext) > -1) {
          this._changePicture(file);
        } else {
          alert("This file format is not supported. Please try again!");
        }
      } else {
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
    this.model.reset();
    return false;
  }

  protected _changePicture(file:File):void {
    if (this.base64_format) {
      const reader = new FileReader();
      reader.addEventListener('load', (event: Event) => {
        this.model.viewToModelUpdate((<any> event.target).result);
      }, false);
      reader.readAsDataURL(file);
    } else {
      this.model.viewToModelUpdate(file);
    }
  }
}
